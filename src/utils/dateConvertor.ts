import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import { parseWallClockTime } from './time-of-day';

dayjs.extend(customParseFormat);
dayjs.extend(timezone);
dayjs.extend(utc);

export const dateFormat = 'DD/MM/YYYY HH:mm:ss';

export const dateConvertor = (date: string, isParams = false) => {
  const userTimeZone = dayjs.tz.guess();
  return isParams
    ? encodeURIComponent(dayjs(date, dateFormat).tz(userTimeZone).format())
    : dayjs(date, dateFormat).tz(userTimeZone).format();
};

export const datePickerToDateTimeOffset = (value: Dayjs | null | undefined): string | null => {
  if (!value?.isValid()) return null;
  return dateConvertor(value.startOf('day').format(dateFormat));
};

/**
 * Formats API schedule values as civil wall-clock times.
 *
 * Examination schedule fields are stored as local clock values even when the
 * API serializes them with an ISO offset. Parsing those strings as instants
 * would apply the browser timezone a second time (17:15 becomes 22:45 in IST).
 */
export const formatDateTimeOffsetAsWallClockTime = (
  value: string | null | undefined,
  format = 'hh:mm A'
): string | null => {
  const parsed = parseWallClockTime(value);
  return parsed ? parsed.format(format) : null;
};

/** Formats the calendar portion of a civil schedule value without timezone conversion. */
export const formatDateTimeOffsetAsWallClockDate = (
  value: string | null | undefined,
  format = 'DD MMM YYYY'
): string | null => {
  const datePart = value?.match(/^(\d{4}-\d{2}-\d{2})/)?.[1];
  if (!datePart) return null;

  const parsed = dayjs(datePart, 'YYYY-MM-DD', true);
  return parsed.isValid() ? parsed.format(format) : null;
};
