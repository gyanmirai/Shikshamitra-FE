import type { Dayjs } from 'dayjs';
import type { BirthdayPeriod } from 'src/redux/student/records/student-birthdays-api';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const DAY_MS = 24 * 60 * 60 * 1000;
const SCHOOL_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;
const MAX_RANGE_DAYS = 366;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const BIRTHDAY_PERIODS = [
  { value: 'today', label: 'Today' },
  { value: 'next7Days', label: 'Next 7 days' },
  { value: 'thisMonth', label: 'This month' },
  { value: 'custom', label: 'Custom range' },
] as const satisfies readonly { value: BirthdayPeriod; label: string }[];

export function readBirthdayPeriod(value: string | null): BirthdayPeriod {
  return BIRTHDAY_PERIODS.find((period) => period.value === value)?.value ?? 'today';
}

export function parseBirthdayDate(value: string) {
  if (!ISO_DATE.test(value) || value.startsWith('0000')) return null;
  const date = dayjs.utc(`${value}T00:00:00Z`);
  return date.format('YYYY-MM-DD') === value ? date : null;
}

export function formatBirthdayDate(value: string | undefined, format: string) {
  return parseBirthdayDate(value ?? '')?.format(format) ?? '—';
}

export function getBirthdayDateRange(
  start: string,
  end: string
): { dates: [Dayjs | null, Dayjs | null]; error?: string } {
  const dates: [Dayjs | null, Dayjs | null] = [parseBirthdayDate(start), parseBirthdayDate(end)];
  if (!start && !end) return { dates };
  if (!dates[0] || !dates[1]) return { dates, error: 'Choose a valid start and end date.' };
  if (end < start) return { dates, error: 'Choose an end date on or after the start date.' };
  if ((Date.parse(end) - Date.parse(start)) / DAY_MS + 1 > MAX_RANGE_DAYS) {
    return { dates, error: 'Choose a range of up to 366 days.' };
  }
  return { dates };
}

/** Schedules a cache rollover at IST midnight. The API resolves the actual date range. */
export function birthdaySchoolClock(now: number) {
  const schoolTime = now + SCHOOL_OFFSET_MS;
  const day = Math.floor(schoolTime / DAY_MS);
  return {
    schoolDate: new Date(day * DAY_MS).toISOString().slice(0, 10),
    delay: (day + 1) * DAY_MS - schoolTime,
  };
}
