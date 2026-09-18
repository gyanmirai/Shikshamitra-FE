import type { DayType, CalendarDayStatus } from 'src/enums/academic-calendar';

import dayjs from 'dayjs';

export interface CalendarDayViewRecord {
  id?: string;
  date?: string;
  endDate?: string;
  rangeStartDate?: string;
  rangeEndDate?: string;
  dayType: DayType;
  status?: CalendarDayStatus;
  title?: string;
  holidayCategory?: string | number;
  description?: string;
  appliesToAll?: boolean;
  standardId?: string;
}

const MAX_EXPANDED_RANGE_DAYS = 731;

const getVisibleIdentity = (day: CalendarDayViewRecord) =>
  [
    day.dayType,
    day.title?.trim().toLowerCase() ?? '',
    day.holidayCategory ?? '',
    day.description?.trim().toLowerCase() ?? '',
  ].join('|');

const getClampedRange = (
  day: CalendarDayViewRecord,
  calendarStartDate?: string,
  calendarEndDate?: string
) => {
  let start = dayjs(day.date).startOf('day');
  let end = dayjs(day.endDate || day.date).startOf('day');

  if (!start.isValid()) return null;
  if (!end.isValid() || end.isBefore(start, 'day')) end = start;

  const calendarStart = dayjs(calendarStartDate).startOf('day');
  const calendarEnd = dayjs(calendarEndDate).startOf('day');

  if (calendarStart.isValid() && start.isBefore(calendarStart, 'day')) start = calendarStart;
  if (calendarEnd.isValid() && end.isAfter(calendarEnd, 'day')) end = calendarEnd;
  if (end.diff(start, 'day') > MAX_EXPANDED_RANGE_DAYS) {
    end = start.add(MAX_EXPANDED_RANGE_DAYS, 'day');
  }

  return end.isBefore(start, 'day') ? null : { start, end };
};

/**
 * Collapses class-specific duplicates before expanding ranges, then indexes only
 * dates inside the selected academic calendar. This prevents malformed or very
 * broad ranges from creating an unbounded number of browser-side records.
 */
export const buildCalendarDayMap = (
  days: CalendarDayViewRecord[],
  calendarStartDate?: string,
  calendarEndDate?: string
) => {
  const groupedRanges = new Map<string, Map<string, CalendarDayViewRecord>>();

  days.forEach((day) => {
    const range = getClampedRange(day, calendarStartDate, calendarEndDate);
    if (!range) return;

    const startKey = range.start.format('YYYY-MM-DD');
    const groupIdentity = `${range.end.format('YYYY-MM-DD')}|${getVisibleIdentity(day)}`;
    const rangeDates = groupedRanges.get(groupIdentity) ?? new Map<string, CalendarDayViewRecord>();
    if (!rangeDates.has(startKey)) rangeDates.set(startKey, day);
    groupedRanges.set(groupIdentity, rangeDates);
  });

  const dayMap: Record<string, CalendarDayViewRecord[]> = {};
  const seenExpandedEvents = new Set<string>();
  const addEvent = (dateKey: string, day: CalendarDayViewRecord) => {
    const eventIdentity = `${dateKey}|${getVisibleIdentity(day)}`;
    if (seenExpandedEvents.has(eventIdentity)) return;

    seenExpandedEvents.add(eventIdentity);
    dayMap[dateKey] ??= [];
    dayMap[dateKey].push({
      ...day,
      date: dayjs(dateKey).format('YYYY-MM-DDTHH:mm:ssZ'),
      rangeStartDate: day.date,
      rangeEndDate: day.endDate,
    });
  };

  groupedRanges.forEach((rangeDates) => {
    // The API materializes vacations as one row per date and attaches the same
    // range end to every row. Those rows must not each be expanded again.
    if (rangeDates.size > 1) {
      rangeDates.forEach((day, dateKey) => addEvent(dateKey, day));
      return;
    }

    const day = rangeDates.values().next().value as CalendarDayViewRecord;
    const range = getClampedRange(day, calendarStartDate, calendarEndDate);
    if (!range) return;

    let cursor = range.start;
    while (cursor.isBefore(range.end, 'day') || cursor.isSame(range.end, 'day')) {
      const dateKey = cursor.format('YYYY-MM-DD');
      addEvent(dateKey, day);
      cursor = cursor.add(1, 'day');
    }
  });

  return dayMap;
};

export const flattenCalendarDayMap = (dayMap: Record<string, CalendarDayViewRecord[]>) =>
  Object.values(dayMap).flat();
