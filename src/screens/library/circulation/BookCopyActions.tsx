import type { RootState } from 'src/redux/store';
import type { IBookCopy } from 'src/screens/library/BookManagement/Components/type';

import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { hasGrantedPermission } from 'src/utils/permissions';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

import { getCopyActions } from './copy-actions';

import type { CopyActionCallbacks } from './copy-actions';

export function BookCopyActions({
  copy,
  bookId,
  onInventoryActions,
  ...callbacks
}: CopyActionCallbacks & { copy: IBookCopy; bookId: string }) {
  const { permissions } = useSelector((state: RootState) => state.auth);
  const actions = getCopyActions(copy, permissions, {
    ...callbacks,
    onReturnBook: undefined,
    onChangeStatus: undefined,
  });
  if (onInventoryActions && hasGrantedPermission(permissions, 'Library.AllBooks.View'))
    actions.push({
      id: 'inventory',
      label: `Inventory actions for ${copy.accessionNo}`,
      icon: GlobalIcons.copy,
      disabled: !bookId || !copy.copyId,
      tooltip: !bookId || !copy.copyId ? 'A saved book and copy identity are required.' : undefined,
      onClick: onInventoryActions,
    });
  return (
    <AdaptiveThreeDotsActions
      actions={actions}
      directActionLimit={2}
      collapseOnOverflow={false}
      moreLabel={`More actions for ${copy.accessionNo}`}
    />
  );
}
