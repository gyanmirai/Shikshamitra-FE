import type { LibraryCopyState } from 'src/redux/library/copy-lifecycle-types';

import { it, expect } from 'vitest';

import { copyStateOptions } from './copy-state-options';

const state: LibraryCopyState = {
  bookId: 'book-id',
  copyId: 'copy-id',
  accessionNumber: 'SCHOOL/42',
  status: 0,
  sectionId: 'section-id',
  shelfId: 'shelf-id',
  revision: 'revision-1',
  hasOpenLoan: false,
  loanLinkSource: 'None',
  requiresLoanReconciliation: false,
  canReturn: false,
  canEditNotes: true,
  canChangeCondition: true,
  canMove: true,
  canWriteOff: true,
  allowedConditionStatuses: [3, 4, 5],
  blockedReasons: [],
};

it('keeps terminal write-off out of the ordinary condition editor even when it is authorized', () => {
  expect(copyStateOptions(state).map((option) => option.id)).toEqual([0, 3, 4, 5]);
});

it('preserves the saved written-off status as the current value for notes and history', () => {
  expect(
    copyStateOptions({ ...state, status: 6, canChangeCondition: false, canWriteOff: false }).map(
      (option) => option.id
    )
  ).toEqual([6]);
});
