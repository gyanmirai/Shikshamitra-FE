import { Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';

export function useHouseCloseGuard(dirty: boolean, busy: boolean, onClose: () => void) {
  const router = useRouter();
  const guard = useUnsavedNavigation(dirty, {
    push: router.push,
    blockNavigation: busy,
    renderConfirmation: (keepEditing, discard) => (
      <ConfirmDialog
        open
        title="Discard Unsaved Changes?"
        icon="warning"
        onClose={keepEditing}
        cancelText="Keep editing"
        content="Your changes to this form will be lost if you discard them."
        action={
          <Button
            size="small"
            variant="contained"
            color="error"
            onClick={discard}
            startIcon={<Iconify icon={GlobalIcons.delete} />}
          >
            Discard changes
          </Button>
        }
      />
    ),
  });
  return { close: () => guard.requestNavigation(onClose), confirmation: guard.confirmation };
}
