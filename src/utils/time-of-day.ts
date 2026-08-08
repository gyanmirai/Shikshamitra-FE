import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

/**
 * Wall-clock time helpers for API fields whose time component is a civil-clock
 * value (e.g. `"2026-08-10T13:00:00+00:00"`), **not** an absolute UTC instant.
 *
 * The backend stores schedule times as ISO strings with a `+00:00` offset that
 * is metadata — the hours/minutes are the intended display times.  Naïve
 * `dayjs(value)` interprets the offset and shifts the value into the browser's
 * local timezone, producing wrong times.
 *
 * `parseWallClockTime` strips any ISO wrapper and strict-parses only the clock
 * portion (`HH:mm[:ss]`), returning a Dayjs object whose `.hour()/.minute()`
 * match the API's wall-clock values — safe for both display formatting *and*
 * MUI X TimePicker consumption (which reads `.hour()/.minute()`).
 */

const ISO_TIME_PART = /T(\d{2}:\d{2}(?::\d{2})?)/;

type TimeInput = string | null | undefined;

/**
 * Parse an API time string as wall-clock time (no timezone conversion).
 *
 * Handles:
 * - ISO with offset: `"2026-08-10T13:00:00+00:00"` → 13:00
 * - Bare clock:      `"13:00:00"` or `"13:00"`       → 13:00
 * - 12-hour clock:   `"01:00 PM"`                     → 13:00
 * - Falsy:           `null | undefined | ""`          → `null`
 */
export function parseWallClockTime(value: TimeInput): Dayjs | null {
  if (!value) return null;

  // 1. Strip ISO date/offset wrapper — keep only the clock portion
  const isoMatch = value.match(ISO_TIME_PART);
  const clock = isoMatch?.[1] ?? value;

  // 2. Strict-parse the clock string (prevents dayjs from guessing an offset)
  const parsed = dayjs(clock, ['HH:mm:ss', 'HH:mm', 'hh:mm A'], true);
  return parsed.isValid() ? parsed : null;
}

/**
 * Format an API time string as `hh:mm A` (e.g. `"01:00 PM"`) without timezone
 * conversion.  Useful for render helpers that read API data directly
 * (bypassing Formik / the mapper).
 */
export function formatWallClockTime(value: TimeInput): string {
  const parsed = parseWallClockTime(value);
  return parsed ? parsed.format('hh:mm A') : '-';
}
