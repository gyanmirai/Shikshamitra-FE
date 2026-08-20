import dayjs from 'dayjs';

export type ExamIssueSeverity = 'blocking' | 'warning';

export type ExamPlanningIssue = {
  id: string;
  step: number;
  severity: ExamIssueSeverity;
  title: string;
  description?: string;
};

const flattenScheduledSubjects = (subjects: any[]) => {
  const rows: any[] = [];
  subjects.forEach((subject) => {
    if (subject?.electiveGroupId && subject?.schedulingMode === 'separate') {
      (subject.subjects || []).forEach((nested: any) => {
        rows.push({
          ...nested,
          subjectName: nested.subjectName || nested.name || subject.subjectName,
          parentSubjectName: subject.subjectName,
        });
      });
      return;
    }
    rows.push(subject);
  });
  return rows;
};

export const buildExamPlanningIssues = (values: any): ExamPlanningIssue[] => {
  const issues: ExamPlanningIssue[] = [];
  const selectedDivisionIds = (values.divisions || []).filter((id: string) => id !== 'all');
  const subjectRows = flattenScheduledSubjects(values.subjects || []);

  if (!values.examName) {
    issues.push({
      id: 'exam-name-required',
      step: 0,
      severity: 'blocking',
      title: 'Exam name is missing',
      description: 'Add a clear exam name before saving the final schedule.',
    });
  }

  if (!values.className || selectedDivisionIds.length === 0 || subjectRows.length === 0) {
    issues.push({
      id: 'scope-incomplete',
      step: 0,
      severity: 'blocking',
      title: 'Scope is incomplete',
      description: 'Select class, division, and at least one subject.',
    });
  }

  subjectRows.forEach((subject, index) => {
    const label = subject.subjectName || `Subject ${index + 1}`;
    if (!subject.examDate || !subject.startTime || !subject.endTime) {
      issues.push({
        id: `schedule-missing-${subject.subjectId || index}`,
        step: 1,
        severity: 'blocking',
        title: `${label} schedule is incomplete`,
        description: 'Date, start time, and end time are required.',
      });
    }

    if (
      subject.startTime &&
      subject.endTime &&
      !dayjs(subject.endTime).isAfter(dayjs(subject.startTime))
    ) {
      issues.push({
        id: `schedule-time-${subject.subjectId || index}`,
        step: 1,
        severity: 'blocking',
        title: `${label} has invalid time range`,
        description: 'End time must be after start time.',
      });
    }

    if (!subject.gradeScalingId || !subject.totalMarks || !subject.passingMarks) {
      issues.push({
        id: `marks-missing-${subject.subjectId || index}`,
        step: 1,
        severity: 'blocking',
        title: `${label} marks setup is incomplete`,
        description: 'Grade scale, total marks, and passing marks are required.',
      });
    }

    if (Number(subject.passingMarks) > Number(subject.totalMarks)) {
      issues.push({
        id: `marks-invalid-${subject.subjectId || index}`,
        step: 1,
        severity: 'blocking',
        title: `${label} passing marks exceed total marks`,
      });
    }

    if (!subject.notes) {
      issues.push({
        id: `notes-warning-${subject.subjectId || index}`,
        step: 1,
        severity: 'warning',
        title: `${label} has no notes`,
        description: 'Optional, but useful for student-facing exam instructions.',
      });
    }
  });

  if (values.isRoomAssign) {
    const activeAssignments: Array<{
      subjectId: string;
      subjectName: string;
      divisionId: string;
      roomIds: string[];
      examDate: any;
      startTime: any;
      endTime: any;
    }> = [];

    subjectRows.forEach((subject, subjectIndex) => {
      selectedDivisionIds.forEach((divisionId: string) => {
        const subjectId = subject.subjectId || subject.id;
        const roomIds = values.roomDetails?.[subjectId]?.[divisionId]?.roomIds || [];
        if (!roomIds.length) {
          issues.push({
            id: `room-missing-${subjectId || subjectIndex}-${divisionId}`,
            step: 2,
            severity: 'blocking',
            title: `${subject.subjectName || 'Subject'} is missing room assignment`,
            description: 'Room assignment is required for all divisions when Assign Rooms is enabled.',
          });
        } else {
          activeAssignments.push({
            subjectId,
            subjectName: subject.subjectName || 'Subject',
            divisionId,
            roomIds,
            examDate: subject.examDate,
            startTime: subject.startTime,
            endTime: subject.endTime,
          });
        }
      });
    });

    // Check room conflicts across overlapping time slots
    const conflictPairs = new Set<string>();
    for (let i = 0; i < activeAssignments.length; i += 1) {
      for (let j = i + 1; j < activeAssignments.length; j += 1) {
        const a = activeAssignments[i];
        const b = activeAssignments[j];

        // Divisions taking the same subject can share the same room
        if (a.subjectId === b.subjectId) continue;

        const isSameDay =
          a.examDate && b.examDate && dayjs(a.examDate).isSame(dayjs(b.examDate), 'day');

        let isOverlapping = false;
        if (isSameDay && a.startTime && a.endTime && b.startTime && b.endTime) {
          const tStartA = dayjs(a.startTime);
          const tEndA = dayjs(a.endTime);
          const tStartB = dayjs(b.startTime);
          const tEndB = dayjs(b.endTime);

          const startA = dayjs(a.examDate).hour(tStartA.hour()).minute(tStartA.minute()).second(0);
          const endA = dayjs(a.examDate).hour(tEndA.hour()).minute(tEndA.minute()).second(0);
          const startB = dayjs(b.examDate).hour(tStartB.hour()).minute(tStartB.minute()).second(0);
          const endB = dayjs(b.examDate).hour(tEndB.hour()).minute(tEndB.minute()).second(0);

          isOverlapping = startA.isBefore(endB) && endA.isAfter(startB);
        }

        if (isOverlapping) {
          const sharedRooms = a.roomIds.filter((id) => b.roomIds.includes(id));
          if (sharedRooms.length > 0) {
            const conflictKey = `${a.subjectId}-${a.divisionId}-${b.subjectId}-${b.divisionId}`;
            if (!conflictPairs.has(conflictKey)) {
              conflictPairs.add(conflictKey);
              issues.push({
                id: `room-conflict-${conflictKey}`,
                step: 2,
                severity: 'blocking',
                title: `Room conflict in ${a.subjectName}`,
                description: `Room conflict between ${a.subjectName} and ${b.subjectName} during overlapping exam hours.`,
              });
            }
          }
        }
      }
    }
  }

  return issues;
};

export const getReadinessSummary = (issues: ExamPlanningIssue[]) => {
  const blocking = issues.filter((issue) => issue.severity === 'blocking');
  const warnings = issues.filter((issue) => issue.severity === 'warning');
  return {
    blocking,
    warnings,
    isReady: blocking.length === 0,
  };
};
