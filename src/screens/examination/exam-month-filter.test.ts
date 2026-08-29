import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import { getExamMonthRange, getDefaultExamMonth, buildExamMonthOptions } from './exam-month-filter';

describe('exam month filter', () => {
  it('builds the selected academic session in chronological order', () => {
    const options = buildExamMonthOptions({
      startDate: '2026-04-01',
      endDate: '2027-03-31',
    });

    expect(options).toHaveLength(12);
    expect(options[0]).toMatchObject({ value: '2026-04', label: 'April 2026' });
    expect(options[11]).toMatchObject({ value: '2027-03', label: 'March 2027' });
  });

  it('falls back to the academic year name when dates are unavailable', () => {
    const options = buildExamMonthOptions({ name: '2026-2027' });

    expect(options.map((option) => option.value)).toEqual([
      '2026-04',
      '2026-05',
      '2026-06',
      '2026-07',
      '2026-08',
      '2026-09',
      '2026-10',
      '2026-11',
      '2026-12',
      '2027-01',
      '2027-02',
      '2027-03',
    ]);
  });

  it('uses the current month when it is inside the selected session', () => {
    const options = buildExamMonthOptions({ name: '2026-2027' });

    expect(getDefaultExamMonth(options, dayjs('2026-08-29'))).toBe('2026-08');
    expect(getDefaultExamMonth(options, dayjs('2028-01-01'))).toBe('2026-04');
  });

  it('returns an API-ready inclusive range for the selected month', () => {
    const options = buildExamMonthOptions({ name: '2026-2027' });

    expect(getExamMonthRange(options, '2027-02')).toMatchObject({
      startDate: '2027-02-01T00:00:00.000',
      endDate: '2027-02-28T23:59:59.999',
    });
  });
});
