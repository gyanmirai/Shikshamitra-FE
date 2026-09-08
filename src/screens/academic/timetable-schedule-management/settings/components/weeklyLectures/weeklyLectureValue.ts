export const MIN_WEEKLY_LECTURES_PER_SUBJECT = 0;
export const MAX_WEEKLY_LECTURES_PER_SUBJECT = 20;

export type WeeklyLectureInput = number | string | null | undefined;
export type WeeklyLectureValue = number | '';

const BLOCKED_NUMBER_KEYS = new Set(['e', 'E', '+', '-', '.']);

/**
 * Normalizes user-controlled lecture counts before they enter form state.
 * The upper bound mirrors the backend TimetableConsts.MaxWeeklyLectures invariant.
 */
export function normalizeWeeklyLectureValue(value: WeeklyLectureInput): WeeklyLectureValue {
  if (value === null || value === undefined || String(value).trim() === '') return '';

  const parsedValue = Number(value);
  if (Number.isNaN(parsedValue)) return '';

  if (!Number.isFinite(parsedValue)) {
    return parsedValue > 0 ? MAX_WEEKLY_LECTURES_PER_SUBJECT : MIN_WEEKLY_LECTURES_PER_SUBJECT;
  }

  return Math.min(
    MAX_WEEKLY_LECTURES_PER_SUBJECT,
    Math.max(MIN_WEEKLY_LECTURES_PER_SUBJECT, Math.trunc(parsedValue))
  );
}

export function toWeeklyLectureCount(value: WeeklyLectureInput): number {
  const normalizedValue = normalizeWeeklyLectureValue(value);
  return normalizedValue === '' ? MIN_WEEKLY_LECTURES_PER_SUBJECT : normalizedValue;
}

export function getWeeklyLectureTotal(
  subjects: ReadonlyArray<{ noOfLecture: WeeklyLectureInput }>
): number {
  return subjects.reduce((total, subject) => total + toWeeklyLectureCount(subject.noOfLecture), 0);
}

export function preventInvalidWeeklyLectureKey(event: {
  key: string;
  preventDefault: () => void;
}): void {
  if (BLOCKED_NUMBER_KEYS.has(event.key)) event.preventDefault();
}
