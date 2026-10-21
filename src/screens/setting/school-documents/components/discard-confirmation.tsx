import Button from '@mui/material/Button';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';

export function documentDiscardConfirmation(keepEditing: () => void, discard: () => void) {
  return (
    <ConfirmDialog
      open
      title="Discard Document Changes?"
      content="Your changes have not been saved. Discard them and close the form?"
      onClose={keepEditing}
      cancelText="Keep Editing"
      action={
        <Button
          type="button"
          size="small"
          variant="contained"
          color="error"
          startIcon={<Iconify icon={GlobalIcons.delete} />}
          onClick={discard}
        >
          Discard Changes
        </Button>
      }
    />
  );
}
