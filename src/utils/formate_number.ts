import { roundUpAmount } from './whole-rupee-amount';

/** Existing callers retain whole-rupee rounding; transaction reviews can request exact decimal display. */
export const formatNumber = (
  num: number | string,
  currency?: string,
  options: { fractionDigits?: number } = {}
): string => {
  const numericValue = Number(num);
  const fractionDigits = options.fractionDigits ?? 0;
  if (Number.isNaN(numericValue)) return currency ? `${currency} 0` : '0';
  const formatted = new Intl.NumberFormat(undefined, {
    style: currency ? 'currency' : 'decimal',
    currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(fractionDigits > 0 ? numericValue : roundUpAmount(numericValue));
  return currency || fractionDigits === 0 ? formatted.replace(/(\D)(\d)/, '$1 $2') : formatted;
};
