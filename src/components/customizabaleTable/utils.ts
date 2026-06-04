import type { Dayjs } from 'dayjs';

export const parseFormattedNumber = (val: string | number | null | Dayjs): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  if (typeof (val as any).format === 'function') {
    return parseFloat((val as any).format('DD'));
  }
  if (typeof val === 'object') return 0;

  // Remove $ symbol, commas, spaces, and then parse to float
  const parsed = parseFloat((val as string).replace(/[^0-9.-]+/g, ''));
  return Number.isNaN(parsed) ? 0 : parsed;
};
