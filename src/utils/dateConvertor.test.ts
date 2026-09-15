import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import { dateFormat, dateConvertor, datePickerToDateTimeOffset } from './dateConvertor';

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
});
