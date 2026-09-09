import { it, expect, describe } from 'vitest';

import { formatExamDateRange } from './schedule-exam-date-range';

describe('scheduled exam date range', () => {
  it.each(['Z', '+00:00', '+05:30', '-07:00'])(
    'keeps the 8 September 18:00–18:40 exam on one calendar day with %s metadata',
    (offset) => {
      expect(
        formatExamDateRange(`2026-09-08T00:00:00${offset}`, `2026-09-08T18:40:00${offset}`)
      ).toBe('08-09-2026');
    }
  );

  it.each([
    ['2026-09-08', '2026-09-08', '08-09-2026'],
    ['2026-09-08T00:00:00', '2026-09-08T18:40:00', '08-09-2026'],
    ['2026-09-08T00:00:00Z', '2026-09-08T23:59:59.9999999Z', '08-09-2026'],
    ['2026-09-08T00:00:00Z', '2026-09-10T18:40:00Z', '08-09-2026 - 10-09-2026'],
    ['2026-09-30T00:00:00Z', '2026-10-01T18:40:00Z', '30-09-2026 - 01-10-2026'],
    ['2026-12-31T00:00:00Z', '2027-01-01T18:40:00Z', '31-12-2026 - 01-01-2027'],
  ])('formats %s through %s as %s', (start, end, expected) => {
    expect(formatExamDateRange(start, end)).toBe(expected);
  });

  it.each([null, undefined, ''])('shows one date when the end date is %s', (end) => {
    expect(formatExamDateRange('2026-09-08T00:00:00Z', end)).toBe('08-09-2026');
  });

  it.each([null, undefined, ''])(
    'leaves the unscheduled label to the view when start is %s',
    (start) => {
      expect(formatExamDateRange(start, '2026-09-08T18:40:00Z')).toBe('');
    }
  );
});
