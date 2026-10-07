import dayjs from 'dayjs';
import { parseWallClockTime } from 'src/utils/time-of-day';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';

import { hasSchedulableExamSubject } from './schedulable-exam-subjects';

import type { IExamSubject, IRoomDetails, IExamFormValues, IDivisionRoomDetail } from '../type';

function combineDateAndTime(dateObj: any, timeObj: any): string | null {
  if (!dateObj || !timeObj) return null;
  const d = dayjs(dateObj);
  const t = dayjs(timeObj);
  if (!d.isValid() || !t.isValid()) return null;
  return d.hour(t.hour()).minute(t.minute()).second(0).millisecond(0).toISOString();
}

function toApiDateTime(value: any): string | null {
  return value?.format?.(dateFormat) ? dateConvertor(value.format(dateFormat)) : null;
}

function toNullableNumber(value: any): number | null {
  if (value === '' || value === undefined || value === null) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function hasCompleteSchedule(value: any): boolean {
  return Boolean(
    value?.examDate &&
    value?.startTime &&
    value?.endTime &&
    value?.totalMarks !== '' &&
    value?.totalMarks !== undefined &&
    value?.totalMarks !== null &&
    value?.passingMarks !== '' &&
    value?.passingMarks !== undefined &&
    value?.passingMarks !== null
  );
}

// ---------------------------------------------------------------------------
// Default empty form values — used for CREATE mode
// ---------------------------------------------------------------------------
export const defaultExamFormValues: IExamFormValues = {
  examId: '',
  examType: '',
  examTypeName: '',
  examName: '',
  className: '',
  gradingScaleId: '',
  divisions: [],
  subjects: [],
  description: '',
  isRoomAssign: false,
  syncToAcademicCalendar: false,
  roomDetails: {},
};

// ---------------------------------------------------------------------------
// Backend → Formik mapper
// Accepts the three separate API responses and returns a single Formik state.
// Works identically for CREATE (all args null) and EDIT (all args populated).
// ---------------------------------------------------------------------------
export function mapBackendToFormik(
  basicData: any = null,
  scheduleData: any = null,
  roomData: any = null,
  examSubjectsData: any = null,
  examTypes: any[] = []
): IExamFormValues {
  const scheduleMap: Record<string, any> = {};
  const rawScheduleSubjects: any[] = scheduleData?.subjects ?? scheduleData?.data?.subjects ?? [];
  const scheduleSubjectIds = new Set<string>();
  rawScheduleSubjects.forEach((s: any) => {
    if (s?.subjectId) {
      scheduleMap[s.subjectId] = s;
      // Schedule API stores individual elective subjects in electiveGroupSubjects (not subjects).
      // Populate scheduleMap for each so per-subject schedule lookup works in separate mode.
      if (
        s.electiveGroupId &&
        Array.isArray(s.electiveGroupSubjects) &&
        s.electiveGroupSubjects.length > 0
      ) {
        s.electiveGroupSubjects.forEach((sub: any) => {
          if (sub?.subjectId) {
            scheduleSubjectIds.add(sub.subjectId);
            scheduleMap[sub.subjectId] = {
              ...sub,
              electiveGroupId: s.electiveGroupId,
              electiveGroupName: s.electiveGroupName,
              examDate: sub.examDate ?? s.examDate ?? null,
              startTime: sub.startTime ?? s.startTime ?? null,
              endTime: sub.endTime ?? s.endTime ?? null,
              totalMarks: sub.totalMarks ?? s.totalMarks ?? null,
              passingMarks: sub.passingMarks ?? s.passingMarks ?? null,
              notes: sub.notes ?? s.notes ?? null,
              gradeScalingId: sub.gradeScalingId ?? s.gradeScalingId ?? null,
            };
          }
        });
      } else {
        scheduleSubjectIds.add(s.subjectId);
      }
    }
  });

  const subjectsArr: any[] = (() => {
    if (!examSubjectsData) return [];
    if (Array.isArray(examSubjectsData)) return examSubjectsData;
    return (
      examSubjectsData?.items ??
      examSubjectsData?.data?.items ??
      examSubjectsData?.subjects ??
      examSubjectsData?.data?.subjects ??
      []
    );
  })();

  const isAssignmentFormat =
    subjectsArr.length > 0 && Array.isArray((subjectsArr[0] as any)?.subjects);

  const examSubjectMap: Record<string, any> = {};
  const electiveGroupMap: Record<
    string,
    { name: string; color: string; subjects: IExamSubject[] }
  > = {};

  if (isAssignmentFormat) {
    subjectsArr.forEach((item: any) => {
      if (item?.electiveGroupId) {
        // Elective group item: key by electiveGroupId
        const groupColor = item.color ?? '#9E9E9E';
        const groupName = item.electiveGroupName ?? '';
        const groupSubjects = (item.subjects ?? []).map((s: any) => ({
          ...s,
          electiveGroupId: item.electiveGroupId,
          electiveGroupName: groupName,
          subjectColor: s.color ?? s.subjectColor ?? groupColor,
        }));

        electiveGroupMap[item.electiveGroupId] = {
          name: groupName,
          color: groupColor,
          subjects: groupSubjects,
        };

        // Also index each individual elective subject by subjectId in examSubjectMap
        groupSubjects.forEach((s: any) => {
          const sid = s.subjectId || s.id;
          if (sid) {
            examSubjectMap[sid] = s;
          }
        });
      } else {
        // Core subject item: map each nested subject by its subjectId
        (item.subjects ?? []).forEach((s: any) => {
          const sid = s.subjectId || s.id;
          if (sid) {
            examSubjectMap[sid] = {
              ...s,
              subjectColor: s.color ?? s.subjectColor ?? item.color ?? '#9E9E9E',
            };
          }
        });
      }
    });
  } else {
    // Flat format — each item is an individual subject
    subjectsArr.forEach((s: any) => {
      const sid = s.subjectId || s.id;
      if (!sid) return;
      const subjectColor = s.color ?? s.subjectColor ?? '#9E9E9E';
      examSubjectMap[sid] = { ...s, subjectColor };

      if (s.electiveGroupId) {
        if (!electiveGroupMap[s.electiveGroupId]) {
          electiveGroupMap[s.electiveGroupId] = {
            name: s.electiveGroupName ?? '',
            color: subjectColor,
            subjects: [],
          };
        }
        electiveGroupMap[s.electiveGroupId].subjects.push({ ...s, subjectColor } as any);
      }
    });
  }

  // Step 3a — resolve raw metadata for every subjectId in basicData
  interface RawEntry {
    subjectId: string;
    sched: any;
    sub: any;
    electiveData: { name: string; color: string; subjects: IExamSubject[] } | undefined;
    resolvedElectiveGroupId: string | undefined;
    resolvedSubjectName: string;
    resolvedSubjectColor: string;
  }

  const rawEntrySubjectIds: string[] =
    Array.isArray(basicData?.subjectIds) && basicData.subjectIds.length > 0
      ? Array.from(new Set(basicData.subjectIds))
      : scheduleSubjectIds.size > 0
        ? Array.from(scheduleSubjectIds)
        : subjectsArr.map((subject: any) => subject?.subjectId).filter(Boolean);

  const rawEntries: RawEntry[] = rawEntrySubjectIds.map((subjectId: string) => {
    const sched = scheduleMap[subjectId] ?? {};
    const sub = examSubjectMap[subjectId] ?? {};
    // Look up by electiveGroupId on sub, or subjectId if basicData uses group IDs
    const electiveGroupId = sub.electiveGroupId ?? sched.electiveGroupId;
    const electiveData = electiveGroupId
      ? electiveGroupMap[electiveGroupId]
      : electiveGroupMap[subjectId];

    const resolvedElectiveGroupId: string | undefined =
      electiveGroupId ?? (electiveData ? sub.electiveGroupId || subjectId : undefined);

    const resolvedSubjectName: string =
      sub.subjectName ??
      sched.subjectName ??
      sub.name ??
      sched.electiveGroupName ??
      electiveData?.name ??
      '';

    const resolvedSubjectColor: string =
      sub.subjectColor ??
      sub.color ??
      sched.subjectColor ??
      sched.electiveGroupColor ??
      sched.color ??
      electiveData?.color ??
      '#9E9E9E';

    return {
      subjectId,
      sched,
      sub,
      electiveData,
      resolvedElectiveGroupId,
      resolvedSubjectName,
      resolvedSubjectColor,
    };
  });

  // Helper — enrich a subject object with its per-subject schedule fields
  const withSchedule = (s: any, fallbackColor: string) => {
    const subSched = scheduleMap[s.subjectId] ?? {};
    return {
      ...s,
      subjectColor: s.color || s.subjectColor || fallbackColor,
      examDate: subSched.examDate ? dayjs(subSched.examDate) : null,
      startTime: parseWallClockTime(subSched.startTime),
      endTime: parseWallClockTime(subSched.endTime),
      totalMarks: subSched.totalMarks ?? '',
      passingMarks: subSched.passingMarks ?? '',
      notes: subSched.notes ?? '',
      gradeScalingId: subSched.gradeScalingId ?? null,
    };
  };

  // Step 3b — emit one entry per core subject and one entry per elective subject
  const subjects: IExamSubject[] = rawEntries.flatMap((entry) => {
    const {
      subjectId,
      sched,
      sub,
      electiveData,
      resolvedElectiveGroupId,
      resolvedSubjectName,
      resolvedSubjectColor,
    } = entry;

    // ── Core subject ────────────────────────────────────────────────────────
    if (!resolvedElectiveGroupId) {
      return [
        {
          subjectId,
          subjectName: resolvedSubjectName,
          subjectColor: resolvedSubjectColor,
          subjectCode: sched.subjectCode ?? sub.subjectCode ?? sub.code ?? '',
          electiveGroupId: undefined,
          subjects: undefined,
          schedulingMode: undefined,
          examDate: sched.examDate ? dayjs(sched.examDate) : null,
          startTime: parseWallClockTime(sched.startTime),
          endTime: parseWallClockTime(sched.endTime),
          totalMarks: sched.totalMarks ?? '',
          passingMarks: sched.passingMarks ?? '',
          notes: sched.notes ?? '',
          gradeScalingId: sched.gradeScalingId ?? null,
        } as IExamSubject,
      ];
    }

    // ── Elective subject — emit individual subject entry matching Create mode structure ──
    const groupSched = scheduleMap[resolvedElectiveGroupId] ?? {};
    const groupName =
      groupSched.electiveGroupName ??
      sched.electiveGroupName ??
      sub.electiveGroupName ??
      electiveData?.name ??
      resolvedSubjectName;
    const groupColor =
      sched.electiveGroupColor ??
      sched.color ??
      sub.subjectColor ??
      electiveData?.color ??
      resolvedSubjectColor;

    const individualSubject = withSchedule(
      {
        ...sub,
        ...sched,
        subjectId,
        subjectName: sub.subjectName || sched.subjectName || resolvedSubjectName,
        subjectColor: sub.subjectColor || groupColor,
        electiveGroupId: resolvedElectiveGroupId,
        electiveGroupName: groupName,
      },
      groupColor
    );

    return [
      {
        id: subjectId,
        subjectId,
        subjectName: individualSubject.subjectName,
        subjectColor: individualSubject.subjectColor,
        subjectCode: sched.subjectCode ?? sub.subjectCode ?? sub.code ?? '',
        selectedElectiveSubjectId: subjectId,
        electiveGroupId: resolvedElectiveGroupId,
        electiveGroupName: groupName,
        subjects: [individualSubject],
        schedulingMode: 'separate',
        examDate: individualSubject.examDate,
        startTime: individualSubject.startTime,
        endTime: individualSubject.endTime,
        totalMarks: individualSubject.totalMarks,
        passingMarks: individualSubject.passingMarks,
        notes: individualSubject.notes,
        gradeScalingId: individualSubject.gradeScalingId,
      } as IExamSubject,
    ];
  });

  // Build roomDetails keyed by subjectId (not subjectName — avoids name collisions)
  const rawRoomDetails: IRoomDetails = {};
  (roomData?.subjects ?? []).forEach((sub: any) => {
    rawRoomDetails[sub.subjectId] = {};
    (sub.divisions ?? []).forEach((div: any) => {
      rawRoomDetails[sub.subjectId][div.divisionId] = {
        roomIds: div.roomIds ?? [],
        capacity: div.capacity ?? 0,
      };
    });
  });

  const roomDetails = pruneRoomDetails(rawRoomDetails, subjects, basicData?.divisionIds ?? []);

  return {
    examId: basicData?.id ?? '',
    examType: basicData?.examTypeId ?? '',
    examTypeName:
      examTypes.find((t: any) => t.id === basicData?.examTypeId)?.examType ??
      basicData?.examTypeName ??
      basicData?.examType ??
      '',
    examName: basicData?.examName ?? '',
    className: basicData?.standardId ?? '',
    gradingScaleId: basicData?.gradingScaleId ?? '',
    divisions: basicData?.divisionIds ?? [],
    subjects,
    description: basicData?.description ?? '',
    isRoomAssign: roomData?.isRoomAssigned ?? false,
    syncToAcademicCalendar: false,
    roomDetails,
  };
}

// ---------------------------------------------------------------------------
// Room Allocation Purging Utility
// Cascading delete for downstream room allocation when subjects or divisions are removed
// ---------------------------------------------------------------------------
export function pruneRoomDetails(
  roomDetails: IRoomDetails = {},
  subjects: IExamSubject[] = [],
  divisions: string[] = []
): IRoomDetails {
  if (!roomDetails || typeof roomDetails !== 'object') return {};

  const validDivisionIds = new Set((divisions || []).filter((id) => id !== 'all'));

  // Collect all valid subject IDs (core subject IDs + nested elective subject IDs)
  const validSubjectIds = new Set<string>();
  (subjects || []).forEach((sub: any) => {
    if (sub?.electiveGroupId && Array.isArray(sub?.subjects)) {
      sub.subjects.forEach((nested: any) => {
        if (nested.isExamSelectionDisabled) return;
        const id = nested?.subjectId || nested?.id;
        if (id) validSubjectIds.add(id);
      });
      if (hasSchedulableExamSubject(sub)) {
        if (sub.electiveGroupId) validSubjectIds.add(sub.electiveGroupId);
        if (sub.subjectId) validSubjectIds.add(sub.subjectId);
      }
    } else if (sub?.subjectId || sub?.id) {
      validSubjectIds.add(sub.subjectId || sub.id);
    }
  });

  const nextRoomDetails: IRoomDetails = {};

  validSubjectIds.forEach((subjId) => {
    const existingSubjRoom = roomDetails[subjId];
    if (existingSubjRoom && typeof existingSubjRoom === 'object') {
      const prunedDivMap: Record<string, IDivisionRoomDetail> = {};
      validDivisionIds.forEach((divId) => {
        if (existingSubjRoom[divId]) {
          prunedDivMap[divId] = existingSubjRoom[divId];
        }
      });
      if (Object.keys(prunedDivMap).length > 0) {
        nextRoomDetails[subjId] = prunedDivMap;
      }
    }
  });

  return nextRoomDetails;
}

// ---------------------------------------------------------------------------
// Payload serializers — one per API call, all read from values.subjects
// ---------------------------------------------------------------------------

export function serializeBasicDetailsPayload(values: IExamFormValues) {
  return {
    examTypeId: values.examType,
    examName: values.examName,
    standardId: values.className,
    gradingScaleId: values.gradingScaleId || null,
    divisionIds: values.divisions.filter((id) => id !== 'all'),
    subjectIds: values.subjects.flatMap((s: any) => {
      // Elective group: send each individual subject's ID, not the group ID
      if (s.electiveGroupId && Array.isArray(s.subjects)) {
        return s.subjects
          .filter((sub: any) => !sub.isExamSelectionDisabled)
          .map((sub: any) => sub.subjectId || sub.id);
      }
      // Core subject (or individual elective entry): send subjectId directly
      return [s.subjectId];
    }),
  };
}

export function serializeSchedulePayload(values: IExamFormValues) {
  const subjects: Array<{
    subjectId: string;
    electiveGroupId?: string | null;
    examDate: string | null;
    startTime: string | null;
    endTime: string | null;
    gradeScalingId: string | null;
    totalMarks: number | null;
    passingMarks: number | null;
    notes: string;
  }> = [];

  values.subjects.forEach((sub) => {
    // Elective group in Separate mode: expand individual subjects into entries
    if (sub.electiveGroupId && sub.schedulingMode === 'separate' && Array.isArray(sub.subjects)) {
      ((sub as any).subjects as any[])
        .filter((s: any) => !s.isExamSelectionDisabled)
        .forEach((s: any) => {
          subjects.push({
            subjectId: s.subjectId || s.id,
            electiveGroupId: sub.electiveGroupId,
            examDate: s?.examDate?.format?.(dateFormat)
              ? dateConvertor(s.examDate.format(dateFormat))
              : null,
            startTime: s?.startTime?.format?.(dateFormat)
              ? dateConvertor(s?.startTime?.format?.(dateFormat))
              : null,
            endTime: s?.endTime?.format?.(dateFormat)
              ? dateConvertor(s?.endTime?.format?.(dateFormat))
              : null,
            gradeScalingId: s.gradeScalingId ?? null,
            totalMarks: toNullableNumber(s.totalMarks),
            passingMarks: toNullableNumber(s.passingMarks),
            notes: s.notes ?? '',
          });
        });
    } else {
      // Core subject or elective group in Combined mode
      subjects.push({
        subjectId: sub.subjectId,
        electiveGroupId: sub.electiveGroupId ?? null,
        examDate: sub?.examDate?.format?.(dateFormat)
          ? dateConvertor(sub.examDate.format(dateFormat))
          : null,
        startTime: sub?.startTime?.format?.(dateFormat)
          ? dateConvertor(sub?.startTime?.format?.(dateFormat))
          : null,
        endTime: sub?.endTime?.format?.(dateFormat)
          ? dateConvertor(sub?.endTime?.format?.(dateFormat))
          : null,
        gradeScalingId: sub.gradeScalingId ?? null,
        totalMarks: toNullableNumber(sub.totalMarks),
        passingMarks: toNullableNumber(sub.passingMarks),
        notes: sub.notes,
      });
    }
  });

  return { subjects, syncToAcademicCalendar: values.syncToAcademicCalendar };
}

export function serializeRoomAssignmentPayload(values: IExamFormValues) {
  // Exclude the 'all' placeholder — mirrors serializeBasicDetailsPayload
  const validDivisionIds = values.divisions.filter((id) => id !== 'all');

  const subjectEntries: Array<{
    subjectId: string;
    electiveGroupId: string | null;
    examDate: string | null;
    divisions: Array<{ divisionId: string; roomIds: string[]; capacity: number }>;
  }> = [];

  values.subjects.forEach((sub) => {
    if (sub.electiveGroupId && Array.isArray(sub.subjects)) {
      // Elective group: expand into one entry per individual subject
      ((sub as any).subjects as any[])
        .filter((s: any) => !s.isExamSelectionDisabled)
        .forEach((s: any) => {
          const sId = s.subjectId || s.id;
          const shouldAssignRooms = hasCompleteSchedule(s);
          const mappedDivisions = validDivisionIds.map((divId) => ({
            divisionId: divId,
            roomIds: values.roomDetails[sId]?.[divId]?.roomIds ?? [],
            capacity: values.roomDetails[sId]?.[divId]?.capacity ?? 0,
          }));
          subjectEntries.push({
            subjectId: sId,
            electiveGroupId: sub.electiveGroupId ?? null,
            examDate: s?.examDate?.format?.(dateFormat)
              ? dateConvertor(s.examDate.format(dateFormat))
              : null,
            divisions: values.isRoomAssign
              ? shouldAssignRooms
                ? mappedDivisions.filter((div) => div.roomIds.length > 0)
                : []
              : mappedDivisions,
          });
        });
    } else {
      // Core subject
      const mappedDivisions = validDivisionIds.map((divId) => ({
        divisionId: divId,
        roomIds: values.roomDetails[sub.subjectId]?.[divId]?.roomIds ?? [],
        capacity: values.roomDetails[sub.subjectId]?.[divId]?.capacity ?? 0,
      }));
      subjectEntries.push({
        subjectId: sub.subjectId,
        electiveGroupId: null,
        examDate: sub?.examDate?.format?.(dateFormat)
          ? dateConvertor(sub.examDate.format(dateFormat))
          : null,
        divisions: values.isRoomAssign
          ? mappedDivisions.filter((div) => div.roomIds.length > 0)
          : mappedDivisions,
      });
    }
  });

  return {
    isRoomAssigned: values.isRoomAssign,
    subjects: subjectEntries,
  };
}

// ---------------------------------------------------------------------------
// Legacy exports — kept for components not yet migrated; remove after migration
// ---------------------------------------------------------------------------

/** @deprecated Use mapBackendToFormik */
export const basicDetailsInitialValues = (editData: any = null) => ({
  examType: editData?.examTypeId || '',
  examName: editData?.examName || '',
  className: editData?.standardId || '',
  divisions: editData?.divisionIds || [],
  selectedSubjects: editData?.subjectIds || [],
  description: editData?.description || '',
});

/** @deprecated Use mapBackendToFormik */
export const scheduleInitialValues = (editData: any = null) => ({
  subjects:
    editData?.subjects?.map((sub: any) => ({
      ...sub,
      subjectId: sub.subjectId,
      examDate: sub.examDate ? dayjs(sub.examDate) : null,
      startTime: sub.startTime ? dayjs(`2000-01-01T${sub.startTime}`) : null,
      endTime: sub.endTime ? dayjs(`2000-01-01T${sub.endTime}`) : null,
      totalMarks: sub.totalMarks || 0,
      passingMarks: sub.passingMarks || 0,
      notes: sub.notes || '',
    })) || [],
});

/** @deprecated Use mapBackendToFormik */
export const roomAssignmentInitialValues = (editData: any = null, formikSubjects: any[] = []) => {
  const reconstructedRoomDetails: IRoomDetails = {};
  const isRoomAssign = editData?.isRoomAssigned ?? false;

  if (editData?.subjects) {
    editData.subjects.forEach((sub: any) => {
      reconstructedRoomDetails[sub.subjectId] = {};
      sub.divisions.forEach((div: any) => {
        reconstructedRoomDetails[sub.subjectId][div.divisionId] = {
          roomIds: div.roomIds,
          capacity: div.capacity,
        };
      });
    });
  }

  if (Object.keys(reconstructedRoomDetails).length === 0 && formikSubjects.length > 0) {
    formikSubjects.forEach((sub: any) => {
      reconstructedRoomDetails[sub.subjectId ?? sub.id] = {};
    });
  }

  return { isRoomAssign, roomDetails: reconstructedRoomDetails };
};
