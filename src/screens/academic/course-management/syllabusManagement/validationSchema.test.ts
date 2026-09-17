import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import { getChapterValidationSchema } from './validationSchema';
import {
  CHAPTER_NUMBER_RANGE_MESSAGE,
  CHAPTER_NUMBER_INTEGER_MESSAGE,
  CHAPTER_NUMBER_REQUIRED_MESSAGE,
} from './chapterNumber';

const currentYear = {
  startDate: dayjs().subtract(6, 'month').format('YYYY-MM-DD'),
  endDate: dayjs().add(6, 'month').format('YYYY-MM-DD'),
};

describe('getChapterValidationSchema', () => {
  it('requires the chapter start and end dates expected by the API contract', async () => {
    const schema = getChapterValidationSchema(currentYear);

    await expect(schema.validateAt('startDate', { startDate: null })).rejects.toThrow(
      'Start Date is required'
    );
    await expect(
      schema.validateAt('endDate', { startDate: dayjs(), endDate: null })
    ).rejects.toThrow('End Date is required');
  });

  it('validates chapter numbers as bounded whole numbers', async () => {
    const schema = getChapterValidationSchema(currentYear);

    await expect(schema.validateAt('chapterNo', { chapterNo: '' })).rejects.toThrow(
      CHAPTER_NUMBER_REQUIRED_MESSAGE
    );
    await expect(schema.validateAt('chapterNo', { chapterNo: 1.5 })).rejects.toThrow(
      CHAPTER_NUMBER_INTEGER_MESSAGE
    );
    await expect(schema.validateAt('chapterNo', { chapterNo: 111111 })).rejects.toThrow(
      CHAPTER_NUMBER_RANGE_MESSAGE
    );
    await expect(
      schema.validateAt('chapterNo', {
        chapterNo: '111111111111111111111111111111111111111111111',
      })
    ).rejects.toThrow(CHAPTER_NUMBER_RANGE_MESSAGE);
    await expect(schema.validateAt('chapterNo', { chapterNo: 1000 })).resolves.toBe(1000);
  });

  it('rejects a whitespace-only chapter name as required', async () => {
    const schema = getChapterValidationSchema(currentYear);

    await expect(schema.validateAt('chapterName', { chapterName: '   ' })).rejects.toThrow(
      'Chapter Name is required'
    );
  });

  it('normalizes leading and trailing whitespace before validating a chapter name', async () => {
    const schema = getChapterValidationSchema(currentYear);

    await expect(
      schema.validateAt('chapterName', { chapterName: '  Linear Algebra  ' })
    ).resolves.toBe('Linear Algebra');
  });

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

  it('rejects past chapter dates during updates', async () => {
    const schema = getChapterValidationSchema(currentYear, [], 'chapter-id');
    const startDate = dayjs().subtract(2, 'day');
    const endDate = dayjs().subtract(1, 'day');

    await expect(schema.validateAt('startDate', { startDate })).rejects.toThrow(
      'Start Date cannot be in the past'
    );
    await expect(schema.validateAt('endDate', { startDate, endDate })).rejects.toThrow(
      'End Date cannot be in the past'
    );
  });

  it("allows today's chapter dates during updates", async () => {
    const schema = getChapterValidationSchema(currentYear, [], 'chapter-id');
    const today = dayjs();

    await expect(schema.validateAt('startDate', { startDate: today })).resolves.toEqual(today);
    await expect(
      schema.validateAt('endDate', { startDate: today, endDate: today })
    ).resolves.toEqual(today);
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
