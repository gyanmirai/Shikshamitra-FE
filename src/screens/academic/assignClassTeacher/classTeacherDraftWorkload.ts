import type { ClassTeacherEligibleTeacher } from 'src/redux/classManagementApi/classTeacherAssignmentApi/classTeacherAssignmentApi';

type DraftAssignment = {
  classTeacher: string | null;
};

type TeacherWorkload = Pick<
  ClassTeacherEligibleTeacher,
  | 'teacherId'
  | 'currentClassTeacherCount'
  | 'maximumClassTeacherCount'
  | 'workloadStatus'
>;

const CAPACITY_REASON_PATTERN = /class teacher responsibilit/i;

const countAssignmentsByTeacher = (rows: DraftAssignment[]) => {
  const counts = new Map<string, number>();

  rows.forEach(({ classTeacher }) => {
    if (!classTeacher) return;
    counts.set(classTeacher, (counts.get(classTeacher) ?? 0) + 1);
  });

  return counts;
};

const getDraftWorkloadStatus = (count: number, maximum: number) => {
  if (count >= maximum) return 'Exceeded';
  if (count === maximum - 1) return 'Near Capacity';
  return 'Normal';
};

const getCapacityReason = (maximum: number) =>
  `Teacher already has ${maximum} class teacher responsibilities.`;

export const applyDraftTeacherWorkloads = (
  teachers: ClassTeacherEligibleTeacher[],
  draftRows: DraftAssignment[],
  originalRows: DraftAssignment[]
): ClassTeacherEligibleTeacher[] => {
  const draftCounts = countAssignmentsByTeacher(draftRows);
  const originalCounts = countAssignmentsByTeacher(originalRows);

  return teachers.map((teacher) => {
    const draftDelta =
      (draftCounts.get(teacher.teacherId) ?? 0) -
      (originalCounts.get(teacher.teacherId) ?? 0);

    if (draftDelta === 0) return teacher;

    const adjustedCount = Math.max(0, teacher.currentClassTeacherCount + draftDelta);
    const capacityReached = adjustedCount >= teacher.maximumClassTeacherCount;
    const nonCapacityReasons = teacher.ineligibilityReasons.filter(
      (reason) => !CAPACITY_REASON_PATTERN.test(reason)
    );
    const hasKnownNonCapacityBlock =
      !teacher.isActive ||
      teacher.isOnLeave ||
      teacher.hasTimetableConflict ||
      nonCapacityReasons.length > 0;
    const wasBlockedOnlyByCapacity =
      !teacher.isEligible &&
      teacher.currentClassTeacherCount >= teacher.maximumClassTeacherCount &&
      !hasKnownNonCapacityBlock;
    const eligibleWithoutCapacity = teacher.isEligible || wasBlockedOnlyByCapacity;

    return {
      ...teacher,
      currentClassTeacherCount: adjustedCount,
      workloadStatus: getDraftWorkloadStatus(
        adjustedCount,
        teacher.maximumClassTeacherCount
      ),
      isEligible: eligibleWithoutCapacity && !capacityReached,
      ineligibilityReasons: capacityReached
        ? [...nonCapacityReasons, getCapacityReason(teacher.maximumClassTeacherCount)]
        : nonCapacityReasons,
    };
  });
};

export const getDraftTeacherWorkload = (
  teachers: TeacherWorkload[],
  teacherId: string | null,
  fallback: TeacherWorkload | null | undefined
): TeacherWorkload | null => {
  if (!teacherId) return null;

  return teachers.find((teacher) => teacher.teacherId === teacherId) ?? fallback ?? null;
};
