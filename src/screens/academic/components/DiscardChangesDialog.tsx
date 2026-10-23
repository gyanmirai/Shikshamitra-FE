import { Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';

type Props = { open: boolean; onClose: () => void; onDiscard: () => void };

export function DiscardChangesDialog({ open, onClose, onDiscard }: Props) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title="Discard Unsaved Changes?"
      content="Your changes have not been saved."
      icon="warning"
      cancelText="Keep editing"
      disableBackdropClick
      action={
        <Button
          variant="contained"
          color="inherit"
          onClick={onDiscard}
          startIcon={<Iconify icon={GlobalIcons.delete} />}
        >
          Discard changes
        </Button>
      }
    />
  );
}
