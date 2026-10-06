import { roundUpAmount } from './whole-rupee-amount';

export const formatNumber = (num: number | string, currency?: string): string => {
  const numericValue = Number(num);

  if (Number.isNaN(numericValue)) {
    return currency ? `${currency} 0` : '0';
  }

  return new Intl.NumberFormat(undefined, {
    style: currency ? 'currency' : 'decimal',
    currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(roundUpAmount(numericValue))
    .replace(/(\D)(\d)/, '$1 $2');
};
