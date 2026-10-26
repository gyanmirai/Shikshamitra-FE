import { Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';

export function useRoomDiscardGuard(dirty: boolean, busy: boolean, onClose: () => void) {
  const guard = useUnsavedNavigation(dirty, {
    blockNavigation: busy,
    renderConfirmation: (keepEditing, discard) => (
      <ConfirmDialog
        open
        title="Discard Unsaved Changes?"
        content="Your changes to this form will be lost if you discard them."
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
    ),
  });

  return {
    requestClose: () => guard.requestNavigation(onClose),
    confirmation: guard.confirmation,
  };
}
