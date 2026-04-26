import dayjs from 'dayjs';

export const CALENDAR_PAGE_SIZE = 500;
export const CALENDAR_MAX_PAGES = 40;
export const CALENDAR_RANGE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSSZ';

export interface CalendarRangePayload {
  rangeStart: string;
  rangeEnd: string;
}

export interface CalendarEventLike {
  id?: string | number;
}

export function buildCalendarVisibleRangePayload(
  startDate: Date,
  endExclusiveDate: Date
): CalendarRangePayload {
  const start = dayjs(startDate).startOf('day');
  const endInclusive = dayjs(endExclusiveDate).subtract(1, 'day').endOf('day');

  return {
    rangeStart: start.format(CALENDAR_RANGE_FORMAT),
    rangeEnd: endInclusive.format(CALENDAR_RANGE_FORMAT),
  };
}

export function dedupeCalendarItemsById<T extends CalendarEventLike>(items: T[]): T[] {
  const map = items.reduce((acc, item) => {
    if (item?.id != null) {
      acc.set(String(item.id), item);
    }
    return acc;
  }, new Map<string, T>());

  return Array.from(map.values());
}

export function shouldMarkCalendarCapReached(
  reachedPageLimit: boolean,
  totalCount: number,
  fetchedItemCount: number
): boolean {
  return reachedPageLimit && totalCount > fetchedItemCount;
}
