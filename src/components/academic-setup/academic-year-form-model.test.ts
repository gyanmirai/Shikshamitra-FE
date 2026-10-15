import dayjs from 'dayjs';
import { vi, it, expect, describe, afterEach } from 'vitest';

import {
  getAcademicYearInitialValues,
  academicYearValidationSchema,
} from './academic-year-form-model';

describe('academic year form defaults', () => {
  afterEach(() => vi.useRealTimers());

  it('keeps date-only defaults stable as time passes so Formik does not reset selections', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-14T10:00:00'));
    const initialValues = getAcademicYearInitialValues(null);
    vi.setSystemTime(new Date('2026-10-14T10:00:01'));
    expect(getAcademicYearInitialValues(null)).toEqual(initialValues);
    expect(initialValues.startDate.format('YYYY-MM-DD HH:mm:ss.SSS')).toBe(
      '2026-06-01 00:00:00.000'
    );
    expect(initialValues.endDate.format('YYYY-MM-DD HH:mm:ss.SSS')).toBe('2027-03-31 00:00:00.000');
  });

  it('retains the rule that the end date belongs to the immediately following year', async () => {
    await expect(
      academicYearValidationSchema.validate({
        startDate: dayjs('2026-06-01'),
        endDate: dayjs('2028-05-31'),
      })
    ).rejects.toThrow('End date must be in the year immediately after the start date.');
  });
});
