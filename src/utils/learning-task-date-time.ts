import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const LEARNING_TASK_TIME_ZONE = 'Asia/Kolkata';

/** Task schedules are instants in the API and school-local times in the form. */
export function learningTaskDateTime(value?: string | null): Dayjs | null {
  if (!value) return null;
  const parsed = dayjs.utc(value).tz(LEARNING_TASK_TIME_ZONE);
  return parsed.isValid() ? parsed : null;
}

export function serializeLearningTaskDateTime(value: Dayjs): string {
  return dayjs.tz(value.format('YYYY-MM-DDTHH:mm:ss'), LEARNING_TASK_TIME_ZONE).format();
}

export function formatLearningTaskDateTime(
  value?: string | null,
  format = 'DD-MM-YYYY HH:mm'
): string {
  return learningTaskDateTime(value)?.format(format) || '-';
}

export function learningTaskNow(): Dayjs {
  return dayjs().tz(LEARNING_TASK_TIME_ZONE);
}
