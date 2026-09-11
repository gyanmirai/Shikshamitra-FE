import { Button } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';

export function ReviewReloadConfirmation({
  open,
  onCancel,
  onConfirm,
  context = 'review',
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  context?: 'review' | 'application';
}) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onCancel}
      title={`Reload the latest ${context}?`}
      icon="warning"
      content={`This replaces your unsaved edits with the latest saved ${context} and its current state. Cancel to keep editing.`}
      action={
        <Button variant="contained" color="warning" onClick={onConfirm}>
          Discard edits and reload
        </Button>
      }
    />
  );
}
