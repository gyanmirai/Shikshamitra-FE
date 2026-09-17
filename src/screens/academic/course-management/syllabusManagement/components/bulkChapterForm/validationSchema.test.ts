import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import { getBulkChapterValidationSchema } from './validationSchema';

const currentYear = {
  startDate: dayjs().subtract(6, 'month').format('YYYY-MM-DD'),
  endDate: dayjs().add(6, 'month').format('YYYY-MM-DD'),
};

const validChapter = {
  chapterNo: 1,
  chapterName: 'Introduction',
  startDate: dayjs(),
  endDate: dayjs().add(1, 'day'),
};

describe('getBulkChapterValidationSchema', () => {
  it.each([
    ['startDate', 'Start Date is required'],
    ['endDate', 'End Date is required'],
  ])('blocks submission when %s is missing', async (field, message) => {
    const schema = getBulkChapterValidationSchema(currentYear);
    const chapter = { ...validChapter, [field]: null };

    await expect(schema.validate({ chapters: [chapter] })).rejects.toThrow(message);
  });

  it('accepts a chapter whose required dates are inside the academic year', async () => {
    const schema = getBulkChapterValidationSchema(currentYear);

    await expect(schema.validate({ chapters: [validChapter] })).resolves.toMatchObject({
      chapters: [validChapter],
    });
  });
});
