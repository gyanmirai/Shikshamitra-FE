import React from 'react';
import CustomDialog from 'src/components/customDialog';

import type { INotificationTemplate } from '../types';

interface NotificationViewDialogProps {
  open: boolean;
  viewTemplate: INotificationTemplate | null;
  onClose: () => void;
}

export const NotificationViewDialog = ({
  open,
  viewTemplate,
  onClose,
}: NotificationViewDialogProps) => (
  <CustomDialog
    title={`${viewTemplate?.templateName}`}
    open={open}
    handleClose={onClose}
    maxWidth="md"
  >
    {/* Placeholder as per original code 'ghjk' or similar empty content */}
    {/* Implement TemplateViewDetails here if available */}
    <div>{viewTemplate?.message}</div>
  </CustomDialog>
);
