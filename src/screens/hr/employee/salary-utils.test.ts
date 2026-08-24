import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import {
  isApplicableToMonth,
  toApplicableMonthPayload,
  formatApplicableMonthLabel,
} from './salary-utils';

describe('salary-utils applicable month handling', () => {
  it('serializes selected temporary component months as stable first-of-month dates', () => {
    expect(toApplicableMonthPayload(dayjs('2026-04-15'))).toBe('2026-04-01');
    expect(toApplicableMonthPayload('2026-04-15T18:30:00.000Z')).toBe('2026-04-01');
    expect(toApplicableMonthPayload('2026-4-30')).toBe('2026-04-01');
  });

  it('formats backend month strings without timezone month shifts', () => {
    expect(formatApplicableMonthLabel('2026-04-01T00:00:00.000Z')).toBe('Apr 2026');
  });

  it('shows one-time components only in their applicable month', () => {
    expect(isApplicableToMonth('2026-08-01T00:00:00.000Z', '2026-08')).toBe(true);
    expect(isApplicableToMonth('2026-09-01T00:00:00.000Z', '2026-08')).toBe(false);
  });
});
