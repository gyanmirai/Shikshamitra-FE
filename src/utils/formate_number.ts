export const formatNumber = (num: number | string, currency?: string): string => {
    const numericValue = Number(num);



    if (Number.isNaN(numericValue)) {
      return currency ? `${currency} 0.00` : '0.00';
    }

    return new Intl.NumberFormat(undefined, {
      style: currency ? 'currency' : 'decimal',
      currency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue).replace(/(\D)(\d)/, '$1 $2');
  };

