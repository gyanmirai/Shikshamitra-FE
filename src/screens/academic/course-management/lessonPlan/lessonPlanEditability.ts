import type { PlanStatus } from './lessonPlanData';

type LessonPlanStatusSource = {
  planStatus?: PlanStatus | null;
  status?: PlanStatus | null;
};

export const resolveLessonPlanStatus = ({ planStatus, status }: LessonPlanStatusSource) =>
  planStatus ?? status;

export const canEditLessonPlan = (plan: LessonPlanStatusSource) => {
  const status = resolveLessonPlanStatus(plan);
  return status === 'Draft' || status === 'NeedsChanges';
};

export const getLessonPlanEditLockMessage = (plan: LessonPlanStatusSource) => {
  const status = resolveLessonPlanStatus(plan);

  if (status === 'Rejected') {
    return 'Rejected lesson plans are locked. Create a new lesson plan instead.';
  }

  if (status === 'Approved') {
    return 'Approved lesson plans are locked and cannot be edited.';
  }

  return 'This lesson plan is locked and cannot be edited.';
};
