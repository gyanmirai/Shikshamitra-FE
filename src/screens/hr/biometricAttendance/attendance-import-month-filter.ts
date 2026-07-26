import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';

export const getDefaultAttendanceImportMonth = (now: Dayjs = dayjs()) => now.startOf('month');

export const toAttendanceImportPayrollMonth = (value?: Dayjs | null) =>
  value?.isValid() ? value.format('YYYY-MM') : undefined;
