import { it, vi, expect } from 'vitest';

import { inventoryActions } from './inventory-actions';
import { statusState } from './copy-status-test-fixture';

const callbacks = { onReturnBook: vi.fn(), onChangeStatus: vi.fn() };
const permissions = (...names: string[]) =>
  names.map((name) => ({ name: `Library.${name}`, isGranted: true }));

it('offers recovery return for a real readable Lost loan only when the server permits it', () => {
  const state = { ...statusState, hasOpenLoan: true, activeLoanId: 'loan-id', canReturn: true };
  const grants = permissions('AllBooks.View', 'IssueReturn.Return');
  expect(inventoryActions(state, grants, callbacks, vi.fn()).map((action) => action.id)).toEqual([
    'return',
    'events',
  ]);
  expect(
    inventoryActions({ ...state, canReturn: false }, grants, callbacks, vi.fn()).map(
      (action) => action.id
    )
  ).toEqual(['events']);
});
it('blocks mutation and return capabilities pending legacy loan reconciliation', () => {
  const state = {
    ...statusState,
    requiresLoanReconciliation: true,
    hasOpenLoan: true,
    activeLoanId: 'loan-id',
    canReturn: true,
    canMove: true,
    canWriteOff: true,
    canEditNotes: true,
  };
  expect(
    inventoryActions(
      state,
      permissions('AllBooks.View', 'AllBooks.Update', 'AllBooks.Delete', 'IssueReturn.Return'),
      callbacks,
      vi.fn()
    ).map((action) => action.id)
  ).toEqual(['events']);
});
it('requires both write-off capability and delete permission for the explicit decision', () => {
  const state = {
    ...statusState,
    canMove: false,
    canWriteOff: true,
    canChangeCondition: false,
    canEditNotes: false,
  };
  expect(
    inventoryActions(
      state,
      permissions('AllBooks.View', 'AllBooks.Update'),
      callbacks,
      vi.fn()
    ).map((action) => action.id)
  ).toEqual(['events']);
  const onAction = vi.fn();
  const actions = inventoryActions(
    state,
    permissions('AllBooks.View', 'AllBooks.Delete'),
    callbacks,
    onAction
  );
  actions.find((action) => action.id === 'writeoff')?.onClick?.();
  expect(onAction).toHaveBeenCalledWith('writeoff');
});
