import dayjs from 'dayjs';
import { it, expect } from 'vitest';

import { returnSchema } from './return-form';

it('rejects an assessment due date before its separate school assessment date', async () => {
  await expect(
    returnSchema.validate({
      accessionNo: 'scan',
      returnDate: dayjs('2026-11-17'),
      copyStatus: 0,
      chargeCategory: 'category-id',
      amount: '12.25',
      remarks: '',
      assessmentAcademicYearId: 'year-id',
      assessmentReason: 'Damage assessment',
      chargeDate: dayjs('2026-11-17'),
      fineDueDate: dayjs('2026-11-16'),
    })
  ).rejects.toThrow(/Assessment due date/);
});
