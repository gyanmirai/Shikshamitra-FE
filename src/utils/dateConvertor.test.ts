import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import {
  dateFormat,
  dateConvertor,
  datePickerToDateTimeOffset,
  formatDateTimeOffsetAsWallClockDate,
  formatDateTimeOffsetAsWallClockTime,
} from './dateConvertor';

describe('dateConvertor', () => {
  it('serializes a formatted date as an offset-bearing ISO timestamp', () => {
    const result = dateConvertor(dayjs('2026-08-20').format(dateFormat));

    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
  });

  it('serializes a MUI date picker value as a DateTimeOffset payload', () => {
    const result = datePickerToDateTimeOffset(dayjs('2026-08-20'));

    expect(result).toMatch(/^2026-08-20T00:00:00[+-]\d{2}:\d{2}$/);
  });

  it('preserves the selected working day when the UTC instant falls on the previous date', () => {
    const result = datePickerToDateTimeOffset(dayjs('2026-09-15'));

    expect(result).toMatch(/^2026-09-15T00:00:00[+-]\d{2}:\d{2}$/);
  });

  it('keeps an empty picker value nullable for inherited Cycle dates', () => {
    expect(datePickerToDateTimeOffset(null)).toBeNull();
  });

  it('formats offset-bearing schedule values without applying the browser timezone', () => {
    expect(formatDateTimeOffsetAsWallClockTime('2026-09-16T17:15:00Z', 'h:mm A')).toBe('5:15 PM');
    expect(formatDateTimeOffsetAsWallClockTime('2026-09-16T18:00:00+00:00', 'h:mm A')).toBe(
      '6:00 PM'
    );
  });

  it('formats time-only schedule values and rejects malformed values', () => {
    expect(formatDateTimeOffsetAsWallClockTime('09:30:00', 'h:mm A')).toBe('9:30 AM');
    expect(formatDateTimeOffsetAsWallClockTime('not-a-time', 'h:mm A')).toBeNull();
    expect(formatDateTimeOffsetAsWallClockTime(null, 'h:mm A')).toBeNull();
  });

  it('formats the civil schedule date without shifting it across timezones', () => {
    expect(formatDateTimeOffsetAsWallClockDate('2026-09-16T00:00:00Z', 'ddd, D MMM YYYY')).toBe(
      'Wed, 16 Sep 2026'
    );
    expect(formatDateTimeOffsetAsWallClockDate('not-a-date')).toBeNull();
  });
});
