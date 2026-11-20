import { it, expect } from 'vitest';
import { LibraryBookStatus } from 'src/enums/library-book-status';

import { mapIssueReturnItemDto } from './library-adapters';

it('uses Staff for canonical numeric role 1 without changing transaction identity or loan status', () => {
  expect(
    mapIssueReturnItemDto({ transactionId: 'loan-id', memberId: 'member-id', role: 1, status: 0 })
  ).toMatchObject({
    transactionId: 'loan-id',
    memberId: 'member-id',
    role: 'Staff',
    status: LibraryBookStatus.Issued,
  });
  expect(mapIssueReturnItemDto({ role: 0 }).role).toBe('Student');
});
