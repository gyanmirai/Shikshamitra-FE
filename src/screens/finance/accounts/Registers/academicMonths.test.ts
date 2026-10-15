import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import { entryDate, academicMonthOptions, defaultAcademicMonth } from './academicMonths';

describe('Accounts academic months', () => {
  const period = { id: 'year', startDate: '2026-06-15', endDate: '2027-05-10' };
  it('includes only intersecting calendar months with unambiguous years', () => {
    const options = academicMonthOptions(period);
    expect(options).toHaveLength(12);
    expect(options[0]).toEqual({ value: '2026-06', label: 'June 2026' });
    expect(options.at(-1)).toEqual({ value: '2027-05', label: 'May 2027' });
  });
  it('supports extended and shortened academic periods', () => {
    expect(academicMonthOptions({ startDate: '2025-10-01', endDate: '2027-03-31' })).toHaveLength(
      18
    );
    expect(academicMonthOptions({ startDate: '2026-10-14', endDate: '2026-10-20' })).toHaveLength(
      1
    );
  });
  it('defaults to the current included month or the first available month', () => {
    const options = academicMonthOptions(period);
    expect(defaultAcademicMonth(options, dayjs('2026-10-14'))).toBe('2026-10');
    expect(defaultAcademicMonth(options, dayjs('2028-10-14'))).toBe('2026-06');
  });
  it('does not invent dates for unavailable or invalid years', () => {
    expect(academicMonthOptions(null)).toEqual([]);
    expect(academicMonthOptions({ startDate: 'invalid', endDate: '2027-05-31' })).toEqual([]);
    expect(academicMonthOptions({ startDate: '2027-05-31', endDate: '2026-06-01' })).toEqual([]);
  });
  it('clips the manual date to boundary months and preserves the current selected day', () => {
    expect(entryDate(period, '2026-06', dayjs('2026-10-14'))).toBe('2026-06-15');
    expect(entryDate(period, '2026-10', dayjs('2026-10-14'))).toBe('2026-10-14');
    expect(entryDate(period, 'all', dayjs('2028-10-14'))).toBe('2027-05-10');
  });
});
