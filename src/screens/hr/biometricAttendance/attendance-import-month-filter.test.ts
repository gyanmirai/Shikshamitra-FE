import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import {
  toAttendanceImportPayrollMonth,
  getDefaultAttendanceImportMonth,
} from './attendance-import-month-filter';

describe('attendance import month filter', () => {
  it('defaults to the current browser month and builds the API filter', () => {
    const selectedMonth = getDefaultAttendanceImportMonth(dayjs('2026-07-26T15:30:00'));

    expect(selectedMonth.format('YYYY-MM-DD HH:mm')).toBe('2026-07-01 00:00');
    expect(toAttendanceImportPayrollMonth(selectedMonth)).toBe('2026-07');
  });

  it('omits invalid or cleared month values', () => {
    expect(toAttendanceImportPayrollMonth(null)).toBeUndefined();
    expect(toAttendanceImportPayrollMonth(dayjs('invalid'))).toBeUndefined();
  });
});
