import type { Dayjs } from 'dayjs';

export const toSalarySlipMonthYear = (value: Dayjs | null | undefined) =>
  value?.format('MMMM-YYYY').toUpperCase();
