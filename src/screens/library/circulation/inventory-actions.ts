import type { GrantedPermission } from 'src/utils/permissions';
import type { LibraryCopyState } from 'src/redux/library/copy-lifecycle-types';
import type { AdaptiveThreeDotsAction } from 'src/components/adaptive-three-dots-actions/types';

import { GlobalIcons } from 'src/utils/icons';
import { hasGrantedPermission } from 'src/utils/permissions';

import type { CopyActionCallbacks } from './copy-actions';

export type CopyInventoryAction = 'move' | 'writeoff' | 'events';
export function inventoryActions(
  state: LibraryCopyState,
  permissions: GrantedPermission[] | undefined,
  callbacks: CopyActionCallbacks,
  onAction: (action: CopyInventoryAction) => void
): AdaptiveThreeDotsAction[] {
  if (!hasGrantedPermission(permissions, 'Library.AllBooks.View')) return [];
  const actions: AdaptiveThreeDotsAction[] = [];
  const reconciled = !state.requiresLoanReconciliation;
  const update = hasGrantedPermission(permissions, 'Library.AllBooks.Update');
  if (
    reconciled &&
    state.canReturn &&
    state.activeLoanId &&
    callbacks.onReturnBook &&
    hasGrantedPermission(permissions, 'Library.IssueReturn.Return')
  )
    actions.push({
      id: 'return',
      label: `Return ${state.accessionNumber}`,
      icon: GlobalIcons.retrunIcon,
      onClick: callbacks.onReturnBook,
    });
  if (
    reconciled &&
    update &&
    (state.canChangeCondition || state.canEditNotes) &&
    callbacks.onChangeStatus
  )
    actions.push({
      id: 'condition',
      label: `Condition and notes for ${state.accessionNumber}`,
      icon: GlobalIcons.edit,
      onClick: callbacks.onChangeStatus,
    });
  if (reconciled && update && state.canMove)
    actions.push({
      id: 'move',
      label: `Move ${state.accessionNumber}`,
      icon: GlobalIcons.building,
      onClick: () => onAction('move'),
    });
  if (
    reconciled &&
    state.canWriteOff &&
    hasGrantedPermission(permissions, 'Library.AllBooks.Delete')
  )
    actions.push({
      id: 'writeoff',
      label: `Write off ${state.accessionNumber}`,
      icon: GlobalIcons.delete,
      color: 'error.main',
      onClick: () => onAction('writeoff'),
    });
  actions.push({
    id: 'events',
    label: `Copy events for ${state.accessionNumber}`,
    icon: GlobalIcons.history,
    onClick: () => onAction('events'),
  });
  return actions;
}
