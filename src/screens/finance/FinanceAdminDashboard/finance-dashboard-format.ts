import { fNumber } from 'src/utils/format-number';

export const formatDashboardMoney = (value: number) =>
  fNumber(value, { style: 'currency', currency: 'INR' });

export const dashboardNumberSx = { fontVariantNumeric: 'tabular-nums lining-nums' };
