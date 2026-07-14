'use client';

import { Button } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';

interface UnsavedChangesDialogProps {
  open: boolean;
  onClose: () => void;
  onDiscard: () => void;
}

export default function UnsavedChangesDialog({ open, onClose, onDiscard }: UnsavedChangesDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      icon="warning"
      title="Unsaved Changes"
      content="You have unsaved elective assignment changes. Changing the class, division, or elective group will discard them. Do you want to continue?"
      action={
        <Button variant="contained" color="warning" onClick={onDiscard}>
          Discard and Continue
        </Button>
      }
    />
  );
}
