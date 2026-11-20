import type { CopyIdentity } from 'src/redux/library/copy-lifecycle-types';

import { useState } from 'react';

import { CopyMoveDialog } from './CopyMoveDialog';
import { CopyWriteOffDialog } from './CopyWriteOffDialog';
import { CopyInventoryDialog } from './CopyInventoryDialog';
import { CopyEventsDialog } from './events/CopyEventsDialog';

import type { CopyActionCallbacks } from './copy-actions';
import type { CopyInventoryAction } from './inventory-actions';

export function CopyLifecycleDialogs({
  onClose,
  ...props
}: CopyIdentity & CopyActionCallbacks & { accessionNumber: string; onClose: () => void }) {
  const [action, setAction] = useState<CopyInventoryAction | null>(null);
  if (action === 'move') return <CopyMoveDialog {...props} onClose={onClose} />;
  if (action === 'writeoff') return <CopyWriteOffDialog {...props} onClose={onClose} />;
  if (action === 'events') return <CopyEventsDialog {...props} onClose={onClose} />;
  return (
    <CopyInventoryDialog
      {...props}
      onClose={onClose}
      onAction={setAction}
      onReturnBook={
        props.onReturnBook
          ? () => {
              onClose();
              props.onReturnBook?.();
            }
          : undefined
      }
      onChangeStatus={
        props.onChangeStatus
          ? () => {
              onClose();
              props.onChangeStatus?.();
            }
          : undefined
      }
    />
  );
}
