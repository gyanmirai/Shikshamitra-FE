import { LibraryBookStatus } from 'src/enums/library-book-status';

import type { IBookCopy } from '../Components/type';

export function canRemoveCatalogueCopy(copy: IBookCopy | undefined) {
  if (!copy || copy.status !== LibraryBookStatus.Available) return false;
  if (!copy.copyId && !copy.id) return true;
  return copy.canRemove === true && !copy.receivingReceiptId;
}
export function copyRemovalReason(copy: IBookCopy) {
  if (canRemoveCatalogueCopy(copy)) return `Remove copy ${copy.copyNo}`;
  return (
    copy.removalBlockedReason ||
    (copy.receivingReceiptId
      ? 'This copy is retained by a receiving record. Use its Inventory actions for supported changes.'
      : 'Saved removal eligibility is unavailable or blocked. Reload saved copies and review their Inventory actions.')
  );
}
