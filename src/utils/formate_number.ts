


export const formatNumber = (num: number | string): string => new Intl.NumberFormat().format(Number(num));
  