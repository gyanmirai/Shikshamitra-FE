import Button from '@mui/material/Button';
import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from '../iconify';
import { ConfirmDialog } from './confirm-dialog';

type Options = { title?: string; description?: string; busy?: boolean };

export function renderUnsavedConfirmation(
  keepEditing: () => void,
  discard: () => void,
  {
    title = 'Discard Unsaved Changes?',
    description = 'Your changes have not been saved. Keep editing, or discard them and continue.',
    busy = false,
  }: Options = {}
) {
  return (
    <ConfirmDialog
      open
      title={title}
      content={description}
      icon="warning"
      cancelText="Keep editing"
      disableBackdropClick
      disableCancel={busy}
      onClose={keepEditing}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && !busy) {
          event.stopPropagation();
          keepEditing();
        }
      }}
      action={
        <Button
          type="button"
          variant="contained"
          color="error"
          disabled={busy}
          startIcon={<Iconify icon={GlobalIcons.delete} />}
          onClick={discard}
        >
          Discard changes
        </Button>
      }
    />
  );
}
