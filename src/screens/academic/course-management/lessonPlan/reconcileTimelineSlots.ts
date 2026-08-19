import type { LessonPlanRow } from './lessonPlanData';

type TimelineSlot = {
  timetableSlotId?: string | null;
  standardId?: string;
  divisionId?: string;
  subjectId?: string;
  lessonPlan?: unknown | null;
};

const getContextKey = (value: {
  standardId?: string;
  divisionId?: string;
  subjectId?: string;
}) => `${value.standardId || ''}:${value.divisionId || ''}:${value.subjectId || ''}`;

const getPlanId = (lessonPlan: unknown): string | undefined => {
  if (!lessonPlan || typeof lessonPlan !== 'object') return undefined;

  const plan = lessonPlan as { id?: string; Id?: string };
  return plan.id || plan.Id;
};

export const reconcileTimelineSlots = <TSlot extends TimelineSlot>(
  slots: readonly TSlot[],
  lessonPlans: readonly LessonPlanRow[],
  selectedDate: string,
  timelineTeacherId?: string
): TSlot[] => {
  const eligiblePlans = lessonPlans.filter(
    (plan) =>
      plan.plannedDate === selectedDate &&
      (!timelineTeacherId || plan.teacherId === timelineTeacherId)
  );

  const plansBySlotId = new Map(
    eligiblePlans
      .filter((plan) => Boolean(plan.timetableSlotId))
      .map((plan) => [plan.timetableSlotId as string, plan])
  );
  const assignedPlanIds = new Set<string>();

  const slotsWithExactMatches = slots.map((slot) => {
    const existingPlanId = getPlanId(slot.lessonPlan);
    if (existingPlanId) assignedPlanIds.add(existingPlanId);

    if (slot.lessonPlan || !slot.timetableSlotId) return slot;

    const exactPlan = plansBySlotId.get(slot.timetableSlotId);
    if (!exactPlan) return slot;

    assignedPlanIds.add(exactPlan.id);
    return { ...slot, lessonPlan: exactPlan };
  });

  const unplannedSlotCounts = new Map<string, number>();
  slotsWithExactMatches.forEach((slot) => {
    if (!slot.lessonPlan) {
      const contextKey = getContextKey(slot);
      unplannedSlotCounts.set(contextKey, (unplannedSlotCounts.get(contextKey) || 0) + 1);
    }
  });

  const remainingPlansByContext = new Map<string, LessonPlanRow[]>();
  eligiblePlans.forEach((plan) => {
    if (assignedPlanIds.has(plan.id)) return;

    const contextKey = getContextKey(plan);
    const contextPlans = remainingPlansByContext.get(contextKey) || [];
    contextPlans.push(plan);
    remainingPlansByContext.set(contextKey, contextPlans);
  });

  return slotsWithExactMatches.map((slot) => {
    if (slot.lessonPlan) return slot;

    const contextKey = getContextKey(slot);
    const contextPlans = remainingPlansByContext.get(contextKey) || [];

    if (unplannedSlotCounts.get(contextKey) !== 1 || contextPlans.length !== 1) return slot;

    return { ...slot, lessonPlan: contextPlans[0] };
  });
};
