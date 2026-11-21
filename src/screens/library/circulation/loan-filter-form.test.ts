import { it, expect } from 'vitest';

import { loanAsOfDate } from './loan-read-query';
import { initialLoanFilters } from './loan-filter-form';

it('rejects rolled-over dates and timestamps instead of replacing them with a school date', () => {
  expect(loanAsOfDate('2026-02-31')).toBeNull();
  expect(loanAsOfDate('2026-11-16T18:30:00Z')).toBeNull();
  expect(initialLoanFilters('', '2026-02-31').asOfDate?.isValid()).toBe(false);
});
it('preserves a civil date literally and leaves an absent as-of date absent', () => {
  expect(loanAsOfDate('2028-02-29')).toBe('2028-02-29');
  expect(loanAsOfDate('')).toBeUndefined();
  expect(initialLoanFilters('', '').asOfDate).toBeNull();
});
