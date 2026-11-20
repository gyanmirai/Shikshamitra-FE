import { roundUpAmount } from './whole-rupee-amount';

const formatExactDecimal = (value: string, currency?: string): string | undefined => {
  const parts = /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(value);
  if (!parts) return undefined;

  const integer = BigInt(`${parts[1]}${parts[2]}`);
  const signedInteger = parts[1] === '-' && integer === BigInt(0) ? -0 : integer;
  const fraction = (parts[3] ?? '').padEnd(2, '0');
  const formatter = new Intl.NumberFormat(undefined, {
    style: currency ? 'currency' : 'decimal',
    currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const { locale, numberingSystem } = formatter.resolvedOptions();
  const localizedFraction = new Intl.NumberFormat(locale, {
    numberingSystem,
    useGrouping: false,
    minimumIntegerDigits: 2,
    maximumFractionDigits: 0,
  }).format(BigInt(fraction));
  return formatter
    .formatToParts(signedInteger)
    .map((part) => (part.type === 'fraction' ? localizedFraction : part.value))
    .join('');
};

/** Existing callers retain whole-rupee rounding; transaction reviews can request exact decimal display. */
export const formatNumber = (
  num: number | string,
  currency?: string,
  options: { fractionDigits?: number } = {}
): string => {
  const fractionDigits = options.fractionDigits ?? 0;
  if (typeof num === 'string' && fractionDigits === 2) {
    const exact = formatExactDecimal(num, currency);
    if (exact !== undefined) return currency ? exact.replace(/(\D)(\d)/, '$1 $2') : exact;
  }

  const numericValue = Number(num);
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
