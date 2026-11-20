import { it, expect, describe } from 'vitest';

import { formatNumber } from './formate_number';

const ungroup = (value: string) => value.replace(/[^\d.-]/g, '');

describe('explicit decimal display from an exact server string', () => {
  it.each(['100000000000000.01', '9999999999999999.99', '-100000000000000.01'])(
    'preserves every supported paise in %s',
    (amount) => {
      const formatted = formatNumber(amount, 'INR', { fractionDigits: 2 });

      expect(formatted).toContain('₹');
      expect(ungroup(formatted)).toBe(amount);
    }
  );

  it.each(['0.50', '-0.50', '12345678.90'])(
    'preserves the sign and two decimal places in %s',
    (amount) => {
      expect(ungroup(formatNumber(amount, 'INR', { fractionDigits: 2 }))).toBe(amount);
    }
  );

  it('preserves the existing bounded numeric contract', () => {
    expect(ungroup(formatNumber(40.25, 'INR', { fractionDigits: 2 }))).toBe('40.25');
  });

  it('retains existing whole-rupee defaults', () => {
    expect(ungroup(formatNumber(12.25, 'INR'))).toBe('13');
    expect(formatNumber(12.25)).toBe('13');
  });

  it('retains the existing invalid-value fallback', () => {
    expect(formatNumber('invalid')).toBe('0');
  });
});
