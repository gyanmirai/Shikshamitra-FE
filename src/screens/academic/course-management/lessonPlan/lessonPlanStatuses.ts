import type { PlanStatus, DiaryStatus } from './lessonPlanData';

const PLAN_STATUSES: PlanStatus[] = ['Draft', 'Submitted', 'Approved', 'Rejected', 'NeedsChanges'];
const DIARY_STATUSES: DiaryStatus[] = ['Draft', 'Submitted'];

// ABP serializes enum values as numbers. Both list and timeline rows must use
// the same display model before they reach actions, forms, or detail views.
export const toPlanStatus = (value: unknown): PlanStatus =>
  typeof value === 'number'
    ? (PLAN_STATUSES[value] ?? 'Draft')
    : (typeof value === 'string' && value ? (value as PlanStatus) : 'Draft');

export const toDiaryStatus = (value: unknown, hasDiary = true): DiaryStatus => {
  if (!hasDiary) return 'NotSubmitted';
  return typeof value === 'number'
    ? (DIARY_STATUSES[value] ?? 'Draft')
    : (typeof value === 'string' && value ? (value as DiaryStatus) : 'Draft');
};
