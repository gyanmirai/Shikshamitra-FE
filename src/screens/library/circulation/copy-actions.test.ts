import type { IBookCopy } from 'src/screens/library/BookManagement/Components/type';

import { it, vi, expect } from 'vitest';
import { LibraryBookStatus } from 'src/enums/library-book-status';

import { getCopyActions } from './copy-actions';

const copy: IBookCopy = {
  copyId: 'copy-id',
  copyNo: 1,
  accessionNo: 'વાંચન/#42',
  role: '',
  issueDate: '',
  dueDate: '',
  status: LibraryBookStatus.Available,
};
const callbacks = {
  onIssueBook: vi.fn(),
  onReturnBook: vi.fn(),
  onChangeStatus: vi.fn(),
  onBookHistory: vi.fn(),
};
it('removes every unauthorized copy action including history', () => {
  expect(getCopyActions(copy, [], callbacks)).toEqual([]);
});
it('does not offer Return for a lost or damaged copy without an active loan', () => {
  const permissions = [{ name: 'Library.IssueReturn.Return', isGranted: true }];
  expect(
    getCopyActions({ ...copy, status: LibraryBookStatus.Lost }, permissions, callbacks)
  ).toEqual([]);
  expect(
    getCopyActions({ ...copy, status: LibraryBookStatus.Damaged }, permissions, callbacks)
  ).toEqual([]);
});
it('offers a contextual History action with View alone and preserves active-loan Return', () => {
  const history = getCopyActions(
    copy,
    [{ name: 'Library.IssueReturn.View', isGranted: true }],
    callbacks
  );
  expect(history.map((action) => action.id)).toEqual(['history']);
  expect(history[0].label).toContain(copy.accessionNo);
  const issued = getCopyActions(
    { ...copy, status: LibraryBookStatus.Issued },
    [{ name: 'Library.IssueReturn.Return', isGranted: true }],
    callbacks
  );
  expect(issued.map((action) => action.id)).toEqual(['return']);
});
