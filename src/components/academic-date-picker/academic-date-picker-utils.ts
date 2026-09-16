import type { Dayjs } from 'dayjs';

import { DayType, CalendarDayStatus } from 'src/enums/academic-calendar';

import type { AcademicCalendarDay } from './types';

export const DEFAULT_BLOCKED_DAY_TYPES = [
  DayType.Holiday,
  DayType.Vacation,
  DayType.Event,
  DayType.EmergencyClosure,
];

export const toDateKey = (date: Dayjs | string) =>
  // Calendar records carry school dates, not instants to shift into the browser timezone.
  typeof date === 'string' ? date.slice(0, 10) : date.format('YYYY-MM-DD');

export const isActiveCalendarDay = (day: AcademicCalendarDay) =>
  !day.status || Number(day.status) === CalendarDayStatus.Active;

export const appliesToScope = (
  day: AcademicCalendarDay,
  standardId?: string | null,
  divisionId?: string | null
) => {
  if (day.appliesToAll) return true;
  if (divisionId && day.divisionId === divisionId) return true;
  if (standardId && day.standardId === standardId && !divisionId) return true;
  if (standardId && day.standardId === standardId && !day.divisionId) return true;
  if (!standardId && !divisionId) return !day.standardId && !day.divisionId;
  return false;
};

export const getCalendarDayTitle = (day: AcademicCalendarDay) =>
  day.title || (day.dayType ? DayType[day.dayType] : 'Calendar event');
