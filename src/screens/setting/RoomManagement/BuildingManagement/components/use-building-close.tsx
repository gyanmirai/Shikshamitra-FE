import { Button } from '@mui/material';
import { useRouter } from 'src/routes/hooks';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';

export function useBuildingClose(dirty: boolean, busy: boolean, close: () => void) {
  const router = useRouter();
  const { requestNavigation, confirmation } = useUnsavedNavigation(dirty, {
    push: router.push,
    blockNavigation: busy,
    renderConfirmation: (keepEditing, discard) => (
      <ConfirmDialog
        open
        title="Discard Unsaved Changes?"
        icon="warning"
        content="Your changes to this building will be lost if you discard them."
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
            size="small"
            variant="contained"
            color="error"
            disabled={busy}
            startIcon={<Iconify icon={GlobalIcons.delete} width={18} />}
            onClick={discard}
          >
            Discard changes
          </Button>
        }
      />
    ),
  });
  return { requestClose: () => requestNavigation(close), confirmation };
}
