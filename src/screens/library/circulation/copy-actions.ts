import type { GrantedPermission } from 'src/utils/permissions';
import type { IBookCopy } from 'src/screens/library/BookManagement/Components/type';
import type { AdaptiveThreeDotsAction } from 'src/components/adaptive-three-dots-actions/types';

import { GlobalIcons } from 'src/utils/icons';
import { hasGrantedPermission } from 'src/utils/permissions';
import { LibraryBookStatus } from 'src/enums/library-book-status';

export type CopyActionCallbacks = {
  onIssueBook?: () => void;
  onReturnBook?: () => void;
  onChangeStatus?: () => void;
  onBookHistory?: () => void;
  onInventoryActions?: () => void;
};
export function getCopyActions(
  copy: IBookCopy,
  permissions: GrantedPermission[] | undefined,
  callbacks: CopyActionCallbacks
): AdaptiveThreeDotsAction[] {
  const actions: AdaptiveThreeDotsAction[] = [];
  const activeIssue =
    copy.status === LibraryBookStatus.Issued || copy.status === LibraryBookStatus.Overdue;
  if (
    callbacks.onIssueBook &&
    hasGrantedPermission(permissions, 'Library.IssueReturn.Issue') &&
    (copy.status === LibraryBookStatus.Available || copy.status === LibraryBookStatus.Reserved)
  )
    actions.push({
      id: 'issue',
      label: `Issue ${copy.accessionNo}`,
      icon: GlobalIcons.issueBook,
      onClick: callbacks.onIssueBook,
    });
  if (
    callbacks.onReturnBook &&
    hasGrantedPermission(permissions, 'Library.IssueReturn.Return') &&
    activeIssue
  )
    actions.push({
      id: 'return',
      label: `Return ${copy.accessionNo}`,
      icon: GlobalIcons.retrunIcon,
      onClick: callbacks.onReturnBook,
    });
  if (callbacks.onChangeStatus && hasGrantedPermission(permissions, 'Library.AllBooks.Update'))
    actions.push({
      id: 'status',
      label: `Change status of ${copy.accessionNo}`,
      icon: GlobalIcons.edit,
      disabled: activeIssue,
      tooltip: activeIssue ? 'Use the return workflow for an issued copy.' : undefined,
      onClick: callbacks.onChangeStatus,
    });
  if (callbacks.onBookHistory && hasGrantedPermission(permissions, 'Library.IssueReturn.View'))
    actions.push({
      id: 'history',
      label: `Borrowing history for ${copy.accessionNo}`,
      icon: GlobalIcons.history,
      onClick: callbacks.onBookHistory,
    });
  return actions;
}
