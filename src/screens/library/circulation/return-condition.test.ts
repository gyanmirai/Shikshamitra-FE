import dayjs from 'dayjs';
import { it, expect } from 'vitest';

import { returnSchema } from './return-form';

const returned = {
  accessionNo: 'SCHOOL/42',
  returnDate: dayjs('2026-11-17'),
  chargeCategory: 'none',
  amount: '',
  fineDueDate: null,
  remarks: '',
};

it.each([3, 6])(
  'rejects terminal or missing-copy status %s as a physical return',
  async (copyStatus) => {
    await expect(returnSchema.validate({ ...returned, copyStatus })).rejects.toThrow(/Copy status/);
  }
);
it.each([0, 4, 5])('accepts recovered physical copy condition %s', async (copyStatus) => {
  await expect(returnSchema.validate({ ...returned, copyStatus })).resolves.toBeDefined();
});
