import { it, expect, describe } from 'vitest';

import { formatNumber } from './formate_number';
import { formatCurrency } from './cureencyFormater';
import { fPercent, fCurrency } from './format-number';

describe('whole-rupee money formatting', () => {
  it.each([100.01, 100.49, 100.99])('rounds %s upward in shared currency formatters', (amount) => {
    expect(fCurrency(amount)).toBe('₹101');
    expect(formatCurrency(amount)).toBe('₹101');
    expect(formatNumber(amount, 'INR').replace(/\s/g, '')).toBe('₹101');
    expect(formatNumber(amount)).toBe('101');
  });

  it('keeps zero and integer values without decimal places', () => {
    expect(fCurrency(0)).toBe('₹0');
    expect(fCurrency(1000)).toBe('₹1,000');
    expect(formatNumber('invalid')).toBe('0');
    expect(fCurrency(null)).toBe('');
  });

  it('uses the system precision even when a caller requests decimal currency', () => {
    expect(fCurrency(100.01, { minimumFractionDigits: 2, maximumFractionDigits: 2 })).toBe('₹101');
  });

  it('preserves fractional percentages', () => {
    expect(fPercent(12.5)).toBe('12.5%');
  });

  it('does not add a rupee for floating-point calculation noise', () => {
    expect(fCurrency(500.0000000000001)).toBe('₹500');
    expect(fCurrency(.01 / 365)).toBe('₹1');
  });
});
