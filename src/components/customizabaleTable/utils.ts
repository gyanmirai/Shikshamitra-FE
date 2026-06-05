import type { Dayjs } from 'dayjs';

export const parseFormattedNumber = (val: string | number | null | Dayjs): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  if (val instanceof Object) return parseFloat(val.format('DD'));

  // Remove $ symbol, commas, spaces, and then parse to float
  return parseFloat((val as string).replace(/[^0-9.-]+/g, ''));
};
