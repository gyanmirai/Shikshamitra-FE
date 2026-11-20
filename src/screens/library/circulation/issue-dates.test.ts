import dayjs from 'dayjs';
import { it, expect } from 'vitest';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

import { getIssueBookSchema } from '../BookList/Components/BookView/getBookIssueValidatonSchema';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
const year = { startDate: '2026-04-01', endDate: '2027-03-31' };
const values = {
  accessionNumber: 'LIB-1',
  memberId: 'member-id',
  issueDate: dayjs('2026-06-01'),
  dueDate: dayjs('2026-06-15'),
};
it('rejects a due date before issue while permitting school operations across academic-year boundaries', async () => {
  await expect(
    getIssueBookSchema(year).validate({ ...values, dueDate: dayjs('2026-05-01') })
  ).rejects.toThrow(/Due date/);
  await expect(
    getIssueBookSchema(year).validate({
      ...values,
      issueDate: dayjs('2025-12-01'),
      dueDate: dayjs('2026-01-01'),
    })
  ).resolves.toBeDefined();
});
