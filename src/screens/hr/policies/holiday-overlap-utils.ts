import type { WorkCalendarHoliday } from 'src/redux/hr/hr-policy-api';

import dayjs from 'dayjs';
import { toDateOnly, parseDateOnly } from 'src/utils/date-only';

export type HolidayDateRange = {
  fromDate: string;
  toDate: string;
};

export type HolidayOverlapConflict = {
  holiday: WorkCalendarHoliday;
  overlapFrom: string;
  overlapTo: string;
};

export function getHolidayFromDate(item: WorkCalendarHoliday) {
  return item.fromDate || item.date;
}

export function getHolidayToDate(item: WorkCalendarHoliday) {
  return item.toDate || item.fromDate || item.date;
}

export function normalizeHolidayDateRange(item: WorkCalendarHoliday): HolidayDateRange | null {
  const fromDate = parseDateOnly(getHolidayFromDate(item));
  const toDate = parseDateOnly(getHolidayToDate(item));
  if (!fromDate || !toDate || toDate.isBefore(fromDate, 'day')) {
    return null;
  }
  return {
    fromDate: fromDate.format('YYYY-MM-DD'),
    toDate: toDate.format('YYYY-MM-DD'),
  };
}

export function holidayRangesOverlap(left: HolidayDateRange, right: HolidayDateRange) {
  return (
    !dayjs(left.toDate).isBefore(dayjs(right.fromDate), 'day') &&
    !dayjs(right.toDate).isBefore(dayjs(left.fromDate), 'day')
  );
}

export function findIncludedHolidayOverlap(
  holidays: WorkCalendarHoliday[],
  candidate: HolidayDateRange,
  ignoreIndex: number | null = null
): HolidayOverlapConflict | null {
  for (let index = 0; index < holidays.length; index += 1) {
    const holiday = holidays[index];
    const shouldCheckHoliday =
      (ignoreIndex === null || index !== ignoreIndex) && holiday.isIncluded;
    if (shouldCheckHoliday) {
      const range = normalizeHolidayDateRange(holiday);
      if (range && holidayRangesOverlap(range, candidate)) {
        const overlapFrom = dayjs(range.fromDate).isAfter(dayjs(candidate.fromDate), 'day')
          ? range.fromDate
          : candidate.fromDate;
        const overlapTo = dayjs(range.toDate).isBefore(dayjs(candidate.toDate), 'day')
          ? range.toDate
          : candidate.toDate;
        return { holiday, overlapFrom, overlapTo };
      }
    }
  }
  return null;
}

export function mergeNonOverlappingHolidayRows(
  currentRows: WorkCalendarHoliday[],
  importedRows: WorkCalendarHoliday[],
  getRowKey: (item: WorkCalendarHoliday) => string
) {
  const existingKeys = new Set(currentRows.map(getRowKey));
  const additions: WorkCalendarHoliday[] = [];
  let skippedDuplicateCount = 0;
  let skippedOverlapCount = 0;

  importedRows.forEach((item) => {
    const rowKey = getRowKey(item);
    if (existingKeys.has(rowKey)) {
      skippedDuplicateCount += 1;
      return;
    }

    const range = normalizeHolidayDateRange(item);
    const overlap =
      item.isIncluded && range
        ? findIncludedHolidayOverlap([...currentRows, ...additions], range)
        : null;
    if (overlap) {
      skippedOverlapCount += 1;
      return;
    }

    existingKeys.add(rowKey);
    additions.push(item);
  });

  return {
    rows: [...currentRows, ...additions].sort(
      (left, right) =>
        dayjs(toDateOnly(getHolidayFromDate(left))).valueOf() -
        dayjs(toDateOnly(getHolidayFromDate(right))).valueOf()
    ),
    addedCount: additions.length,
    skippedDuplicateCount,
    skippedOverlapCount,
  };
}
