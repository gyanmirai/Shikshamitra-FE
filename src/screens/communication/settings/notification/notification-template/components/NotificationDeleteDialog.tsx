import React from 'react';
import { LoadingButton } from '@mui/lab';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import type { INotificationTemplate } from '../types';

interface NotificationDeleteDialogProps {
  open: boolean;
  deleteTemplate: INotificationTemplate | null;
  isDeleteLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const NotificationDeleteDialog = ({
  open,
  deleteTemplate,
  isDeleteLoading,
  onClose,
  onConfirm,
}: NotificationDeleteDialogProps) => (
  <ConfirmDialog
    open={open}
    onClose={onClose}
    title="Delete"
    content={
      <>
        Are you sure you want to delete template <strong>{deleteTemplate?.templateName}</strong>?
      </>
    }
    action={
      <LoadingButton
        loading={isDeleteLoading}
        variant="contained"
        color="error"
        size="small"
        onClick={onConfirm}
      >
        Yes
      </LoadingButton>
    }
  />
);
