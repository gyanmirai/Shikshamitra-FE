import React from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

type DeleteConfirmationDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
};

export function DeleteConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Delete',
  description = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <DialogTitle id="delete-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-dialog-description">{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {cancelText}
        </Button>
        <Button onClick={onConfirm} color="error" variant="outlined" autoFocus>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
