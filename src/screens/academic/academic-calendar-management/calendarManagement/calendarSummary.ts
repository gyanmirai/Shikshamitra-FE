import dayjs from 'dayjs';
import { DayType, CalendarDayStatus } from 'src/enums/academic-calendar';

import { buildCalendarDayMap } from './calendarViewModel';

import type { CalendarDayViewRecord } from './calendarViewModel';

const NON_WORKING_DAY_TYPES = new Set<DayType>([
  DayType.Holiday,
  DayType.Vacation,
  DayType.EmergencyClosure,
]);

const toDateKey = (value?: string) => {
  const date = dayjs(value);
  return date.isValid() ? date.format('YYYY-MM-DD') : null;
};

export const calculateCalendarSummary = (
  days: CalendarDayViewRecord[],
  calendarStartDate?: string,
  calendarEndDate?: string
) => {
  const startKey = toDateKey(calendarStartDate);
  const endKey = toDateKey(calendarEndDate);
  if (!startKey || !endKey || endKey < startKey) {
    return { totalWorkingDays: 0, totalHolidays: 0 };
  }

  const activeDays = days.filter(
    (day) => !day.status || Number(day.status) === CalendarDayStatus.Active
  );
  const indexedDays = buildCalendarDayMap(activeDays, startKey, endKey);
  let totalWorkingDays = 0;
  let totalHolidays = 0;
  let cursor = dayjs(startKey);

  while (cursor.isBefore(endKey, 'day') || cursor.isSame(endKey, 'day')) {
    const dateKey = cursor.format('YYYY-MM-DD');
    const events = indexedDays[dateKey] ?? [];
    const dayTypes = new Set(events.map((event) => Number(event.dayType)));
    const isWeekend = cursor.day() === 0 || cursor.day() === 6;

    if (dayTypes.has(DayType.Holiday)) totalHolidays += 1;
    if (
      dayTypes.has(DayType.WorkingDay) ||
      (!isWeekend && !events.some((event) => NON_WORKING_DAY_TYPES.has(event.dayType)))
    ) {
      totalWorkingDays += 1;
    }

    cursor = cursor.add(1, 'day');
  }

  return { totalWorkingDays, totalHolidays };
};
