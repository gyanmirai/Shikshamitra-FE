import { it, expect } from 'vitest';

import { inquiryDateRange } from './inquiry-date-range';

it('covers the entire selected day with an exclusive next-day boundary', () => {
  const range = inquiryDateRange('2026-11-17', '2026-11-17')!;
  expect(range.value[0].format('YYYY-MM-DD')).toBe('2026-11-17');
  expect(range.value[1].format('YYYY-MM-DD')).toBe('2026-11-17');
  expect(
    new Date(range.creationTimeBefore).getTime() - new Date(range.creationTimeFrom).getTime()
  ).toBe(24 * 60 * 60 * 1000);
  expect(range.creationTimeBefore).toBe(range.value[1].add(1, 'day').startOf('day').toISOString());
});

it.each([
  ['', ''],
  ['2026-11-17', ''],
  ['invalid', '2026-11-17'],
  ['2026-11-18', '2026-11-17'],
  ['2026-02-30', '2026-03-01'],
])('ignores incomplete or invalid external ranges %s %s', (from, to) => {
  expect(inquiryDateRange(from, to)).toBeUndefined();
});
