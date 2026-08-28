import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import { getChapterValidationSchema } from './validationSchema';

const currentYear = {
  startDate: dayjs().subtract(6, 'month').format('YYYY-MM-DD'),
  endDate: dayjs().add(6, 'month').format('YYYY-MM-DD'),
};

describe('getChapterValidationSchema date rules', () => {
  it('rejects past chapter dates during creation', async () => {
    const schema = getChapterValidationSchema(currentYear);
    const pastDate = dayjs().subtract(1, 'day');

    await expect(schema.validateAt('startDate', { startDate: pastDate })).rejects.toThrow(
      'Start Date cannot be in the past'
    );
    await expect(
      schema.validateAt('endDate', { startDate: pastDate, endDate: pastDate })
    ).rejects.toThrow('End Date cannot be in the past');
  });

  it('allows existing chapters with past dates to be updated', async () => {
    const schema = getChapterValidationSchema(currentYear, [], 'chapter-id');
    const startDate = dayjs().subtract(2, 'day');
    const endDate = dayjs().subtract(1, 'day');

    await expect(schema.validateAt('startDate', { startDate })).resolves.toEqual(startDate);
    await expect(schema.validateAt('endDate', { startDate, endDate })).resolves.toEqual(endDate);
  });

  it('keeps academic-year and date-order validation active during updates', async () => {
    const schema = getChapterValidationSchema(currentYear, [], 'chapter-id');
    const beforeAcademicYear = dayjs(currentYear.startDate).subtract(1, 'day');
    const startDate = dayjs().subtract(1, 'day');
    const endDate = startDate.subtract(1, 'day');

    await expect(schema.validateAt('startDate', { startDate: beforeAcademicYear })).rejects.toThrow(
      'academic year start'
    );
    await expect(schema.validateAt('endDate', { startDate, endDate })).rejects.toThrow(
      'End Date cannot be before Start Date'
    );
  });
});
