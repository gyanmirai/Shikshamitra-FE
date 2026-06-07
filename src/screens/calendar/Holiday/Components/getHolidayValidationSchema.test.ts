import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import { holidayValidationSchema } from './getHolidayValidationSchema';

const currentYear = {
  startDate: '2026-06-01',
  endDate: '2027-05-31',
};

const validHoliday = {
  holidayName: 'Archive Day',
  holidayTypeId: 'holiday-type-1',
  startDate: dayjs('2026-06-15'),
  endDate: dayjs('2026-06-15'),
};

describe('holidayValidationSchema', () => {
  it('allows completed holidays inside the academic year', async () => {
    await expect(holidayValidationSchema(currentYear).validate(validHoliday)).resolves.toEqual(
      validHoliday
    );
  });

  it('rejects start dates outside the academic year', async () => {
    await expect(
      holidayValidationSchema(currentYear).validate({
        ...validHoliday,
        startDate: dayjs('2026-05-31'),
      })
    ).rejects.toThrow('Start Date must be on or after 01/06/2026');
  });

  it('rejects end dates before the start date', async () => {
    await expect(
      holidayValidationSchema(currentYear).validate({
        ...validHoliday,
        startDate: dayjs('2026-06-16'),
        endDate: dayjs('2026-06-15'),
      })
    ).rejects.toThrow('End Date cannot be before Start Date');
  });
});
