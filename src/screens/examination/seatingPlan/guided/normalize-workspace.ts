import type {
  SeatingSubjectDto,
  SeatingPlanGroupDto,
  SeatingPlanWorkspaceDto,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

export function normalizeWorkspace(workspace: SeatingPlanWorkspaceDto): SeatingPlanWorkspaceDto {
  const legacySubjects = (workspace.sessions ?? []).flatMap((session) => session.subjects);
  const subjectsById = new Map<string, SeatingSubjectDto>();
  (workspace.availableSubjects ?? legacySubjects).forEach((subject) => {
    subjectsById.set(subject.examSubjectId, subject);
  });

  const legacyPlans = (workspace.sessions ?? [])
    .filter((session) => session.seatingPlanId)
    .map<SeatingPlanGroupDto>((session) => ({
      seatingPlanId: session.seatingPlanId as string,
      name:
        session.seatingPlanName ??
        session.subjects.map((subject) => subject.subjectName).join(', '),
      scopeType: session.subjects.length === 1 ? 2 : 1,
      status: session.status,
      isLocked: session.isLocked,
      hasCompleteSchedule: session.hasCompleteSchedule,
      canConfigure: session.canPrepare && !session.isLocked,
      scheduleCount: 1,
      subjects: session.subjects,
      divisions: session.divisions,
      availableRooms: session.availableRooms,
      selectedRoomIds: session.selectedRoomIds,
      totalStudents: session.totalStudents,
      allocatedStudents: session.allocatedStudents,
      pendingStudents: session.pendingStudents,
      roomsUsed: session.roomsUsed,
      usableCapacity: session.usableCapacity,
      emptySeats: session.emptySeats,
      utilization: session.utilization,
      issues: session.issues,
    }));

  const plans = workspace.plans ?? legacyPlans;
  const plannedSubjectIds = new Set(
    plans.flatMap((plan) => plan.subjects.map((subject) => subject.examSubjectId))
  );
  const allSubjectsPlanned =
    subjectsById.size > 0 && plannedSubjectIds.size === subjectsById.size;
  const legacyPublished =
    allSubjectsPlanned && plans.length > 0 && plans.every((plan) => plan.status === 5);
  const fallbackReadiness = {
    examId: workspace.examId,
    isPublished: legacyPublished,
    isReadyToPublish: false,
    canResetDraft: !legacyPublished && plans.length > 0,
    totalSubjectCount: subjectsById.size,
    plannedSubjectCount: plannedSubjectIds.size,
    totalPlanCount: plans.length,
    readyPlanCount: plans.filter((plan) => plan.pendingStudents === 0 && plan.totalStudents > 0)
      .length,
    totalStudentSeats: plans.reduce((total, plan) => total + plan.totalStudents, 0),
    allocatedStudentSeats: plans.reduce((total, plan) => total + plan.allocatedStudents, 0),
    publishedAt: null,
    publishedByUserId: null,
    publicationVersion: null,
    blockers: [],
    warnings: [],
  };

  const readiness = workspace.readiness ?? fallbackReadiness;
  const effectivePlans = plans.map((plan) => {
    if (readiness.isPublished) {
      return { ...plan, status: 5, isLocked: true, canConfigure: false };
    }

    const hasDuplicateOwnership = plan.issues.some(
      (issue) => issue.code === 'DUPLICATE_SUBJECT_OWNERSHIP'
    );
    const draftStatus =
      plan.status !== 5
        ? plan.status
        : plan.totalStudents > 0 && plan.pendingStudents === 0
          ? 2
          : plan.allocatedStudents > 0
            ? 1
            : 0;

    return {
      ...plan,
      status: draftStatus,
      isLocked: false,
      canConfigure:
        plan.hasCompleteSchedule &&
        plan.totalStudents > 0 &&
        plan.availableRooms.length > 0 &&
        !hasDuplicateOwnership,
    };
  });

  return {
    ...workspace,
    availableSubjects: [...subjectsById.values()],
    plans: effectivePlans,
    sessions: workspace.sessions ?? [],
    readiness,
  };
}
