'use client';

import type { INotification } from 'src/screens/communication/notification-history/type';

import React, { memo } from 'react';
import CustomDialog from 'src/components/custom-dialog';
import NotificationCard from 'src/screens/communication/notification-history/NotificationCardHistory';

interface ViewNotificationDialogProps {
  open: boolean;
  onClose: () => void;
  notification: INotification | null;
}

/**
 * Component: ViewNotificationDialog
 * Memoization Justification:
 * This component is a pure UI wrapper for the dialog.
 * Memoizing it prevents re-renders when the parent table updates
 * unless its specific props (open, notification) change.
 */
const ViewNotificationDialog = memo(
  ({ open, onClose, notification }: ViewNotificationDialogProps) => (
    <CustomDialog title={notification?.title || ''} open={open} handleClose={onClose} maxWidth="md">
      <NotificationCard data={notification} />
    </CustomDialog>
  )
);

ViewNotificationDialog.displayName = 'ViewNotificationDialog';

export default ViewNotificationDialog;
