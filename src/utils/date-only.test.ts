import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import { toDateOnly, parseDateOnly, formatDateOnly } from './date-only';

describe('date-only helpers', () => {
  it('extracts the civil date from offset timestamps without timezone conversion', () => {
    expect(toDateOnly('2026-08-15T00:00:00.000Z')).toBe('2026-08-15');
    expect(toDateOnly('2026-08-15T23:30:00-07:00')).toBe('2026-08-15');
  });

  it('formats offset timestamps by their date part', () => {
    expect(formatDateOnly('2026-08-15T00:00:00.000Z')).toBe('15-08-2026');
    expect(parseDateOnly('2026-08-15T00:00:00.000Z')?.format('YYYY-MM-DD')).toBe('2026-08-15');
  });

  it('serializes date picker values as date-only strings for holiday DateOnly fields', () => {
    expect(toDateOnly(dayjs('2026-08-15'))).toBe('2026-08-15');
  });
});
