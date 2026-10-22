import { Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';

export function SubjectDiscardDialog({
  onKeepEditing,
  onDiscard,
}: {
  onKeepEditing: () => void;
  onDiscard: () => void;
}) {
  return (
    <ConfirmDialog
      open
      title="Discard Unsaved Changes?"
      content="Your subject changes have not been saved. Keep editing or discard this draft."
      icon="warning"
      cancelText="Keep Editing"
      disableBackdropClick
      onClose={onKeepEditing}
      action={
        <Button
          type="button"
          variant="contained"
          color="error"
          onClick={onDiscard}
          startIcon={<Iconify icon={GlobalIcons.delete} width={16} />}
        >
          Discard Changes
        </Button>
      }
    />
  );
}
