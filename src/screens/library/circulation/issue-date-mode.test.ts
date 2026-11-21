import dayjs from 'dayjs';
import { it, expect } from 'vitest';

import { getIssueBookSchema } from '../BookList/Components/BookView/getBookIssueValidatonSchema';

const draft = {
  accessionNumber: 'scan',
  memberId: 'person-id',
  issueDate: dayjs('2026-11-17'),
  dueDate: null,
};
it('shows a required due-date error for manual policy while allowing automatic policy to calculate it', async () => {
  await expect(getIssueBookSchema(undefined, true).validate(draft)).rejects.toThrow(
    /Due date is required/
  );
  await expect(getIssueBookSchema(undefined, false).validate(draft)).resolves.toBeDefined();
});
