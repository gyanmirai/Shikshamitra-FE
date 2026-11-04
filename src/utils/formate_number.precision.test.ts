import { expect, it } from 'vitest';
import { formatNumber } from './formate_number';

it('supports exact decimal money without changing the existing whole-rupee default', () => {
  expect(formatNumber(12.25, 'INR', { fractionDigits: 2 })).toContain('12.25');
  expect(formatNumber('0.50', 'INR', { fractionDigits: 2 })).toContain('0.50');
  expect(formatNumber(0, 'INR', { fractionDigits: 2 })).toContain('0.00');
  expect(formatNumber(12.25, undefined, { fractionDigits: 2 })).toBe('12.25');
  expect(formatNumber(12.25, 'INR')).toContain('13');
  expect(formatNumber(12.25)).toBe('13');
});
