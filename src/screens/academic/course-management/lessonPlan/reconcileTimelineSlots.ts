import dayjs from 'dayjs';

import type { LessonPlanRow } from './lessonPlanData';

type TimelineSlot = {
  timetableSlotId?: string | null;
  standardId?: string;
  divisionId?: string;
  subjectId?: string;
  lessonPlan?: unknown | null;
};

const getContextKey = (value: { standardId?: string; divisionId?: string; subjectId?: string }) =>
  `${value.standardId || ''}:${value.divisionId || ''}:${value.subjectId || ''}`;

const hasMatchingContext = (slot: TimelineSlot, plan: LessonPlanRow) =>
  (!slot.standardId || slot.standardId === plan.standardId) &&
  (!slot.divisionId || slot.divisionId === plan.divisionId) &&
  (!slot.subjectId || slot.subjectId === plan.subjectId);

const getPlanId = (lessonPlan: unknown): string | undefined => {
  if (!lessonPlan || typeof lessonPlan !== 'object') return undefined;

  const plan = lessonPlan as { id?: string; Id?: string };
  return plan.id || plan.Id;
};

const getDateKey = (value?: string | null) => {
  if (!value) return '';
  return value.length >= 10 ? value.slice(0, 10) : value;
};

export const reconcileTimelineSlots = <TSlot extends TimelineSlot>(
  slots: readonly TSlot[],
  lessonPlans: readonly LessonPlanRow[],
  selectedDate: string,
  timelineTeacherId?: string
): TSlot[] => {
  const selectedDateKey = getDateKey(selectedDate);
  const isEligiblePlan = (value: unknown): boolean => {
    if (!value || typeof value !== 'object') return false;

    const plan = value as {
      plannedDate?: string | null;
      PlannedDate?: string | null;
      teacherId?: string;
      TeacherId?: string;
    };
    const plannedDate = plan.plannedDate ?? plan.PlannedDate;
    if (!plannedDate) return false;

    // PlannedDate is an instant: midnight in the school's offset can be the
    // previous UTC day. Compare in the same local timezone as the date picker.
    const localDate = dayjs(plannedDate);
    return (
      localDate.isValid() &&
      localDate.format('YYYY-MM-DD') === selectedDateKey &&
      (!timelineTeacherId || (plan.teacherId ?? plan.TeacherId) === timelineTeacherId)
    );
  };
  const eligiblePlans = lessonPlans.filter(isEligiblePlan);
  // Embedded API plans need the same check as cached list plans. Never render
  // an off-date plan (and its diary actions), including standalone manual rows.
  const eligibleSlots = slots.filter((slot) => !slot.lessonPlan || isEligiblePlan(slot.lessonPlan));

  const plansBySlotId = new Map(
    eligiblePlans
      .filter((plan) => Boolean(plan.timetableSlotId))
      .map((plan) => [plan.timetableSlotId as string, plan])
  );
  const assignedPlanIds = new Set<string>();

  const slotsWithExactMatches = eligibleSlots.map((slot) => {
    const existingPlanId = getPlanId(slot.lessonPlan);
    if (existingPlanId) assignedPlanIds.add(existingPlanId);

    if (slot.lessonPlan || !slot.timetableSlotId) return slot;

    const exactPlan = plansBySlotId.get(slot.timetableSlotId);
    if (!exactPlan || !hasMatchingContext(slot, exactPlan)) return slot;

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
