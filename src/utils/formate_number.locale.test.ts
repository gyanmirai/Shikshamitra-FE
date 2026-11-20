import { it, vi, expect, describe, afterEach } from 'vitest';

import { formatNumber } from './formate_number';

const NativeNumberFormat = Intl.NumberFormat;

afterEach(() => vi.restoreAllMocks());

function arabicNumberFormat(locale?: Intl.LocalesArgument, options?: Intl.NumberFormatOptions) {
  return new NativeNumberFormat(locale ?? 'ar-EG', options);
}

const useArabicDefault = () =>
  vi.spyOn(Intl, 'NumberFormat').mockImplementation(arabicNumberFormat);

describe('explicit decimal display follows the formatter numbering system', () => {
  it('localizes the exact server fraction along with the large integer', () => {
    useArabicDefault();

    const text = formatNumber('100000000000000.01', 'INR', { fractionDigits: 2 });
    const fraction = new NativeNumberFormat('ar-EG', {
      style: 'currency',
      currency: 'INR',
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .formatToParts(0.01)
      .find((part) => part.type === 'fraction')?.value;

    expect(fraction).toBeDefined();
    expect(text).toContain(fraction);
    expect(text).not.toMatch(/[0-9]/);
  });

  it('retains the existing locale behavior for bounded numeric money', () => {
    useArabicDefault();
    const reference = new NativeNumberFormat('ar-EG', {
      style: 'currency',
      currency: 'INR',
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(0.5);

    expect(formatNumber(0.5, 'INR', { fractionDigits: 2 })).toBe(reference);
  });
});
