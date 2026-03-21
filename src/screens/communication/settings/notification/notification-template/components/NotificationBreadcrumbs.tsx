import React from 'react';
import { Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import type { INotificationTemplate } from '../types';

interface NotificationBreadcrumbsProps {
  open: boolean;
  editingTemplate: INotificationTemplate | null;
  setOpen: (open: boolean) => void;
  setEditingTemplate: (template: INotificationTemplate | null) => void;
  handleCloseDialog: (e: any, isSubmit?: boolean) => void;
}

export const NotificationBreadcrumbs = ({
  open,
  editingTemplate,
  setOpen,
  setEditingTemplate,
  handleCloseDialog,
}: NotificationBreadcrumbsProps) => {
  if (open) {
    return (
      <CustomBreadcrumbs
        heading={editingTemplate ? 'Update Template' : 'Add Template'}
        description={
          editingTemplate
            ? 'Update the existing message template for announcements, events, or reminders.'
            : 'Create a new message template to be used in announcements, events, or reminders.'
        }
        links={[
          { name: 'Communication', href: '/communication/dashboard' },
          { name: 'Notifications', href: '/communication/notification/send-notification' },
          {
            name: 'Templates',
            onClick(e) {
              setOpen(false);
              setEditingTemplate(null);
            },
          },
        ]}
        sx={{ px: 2 }}
        isBack
        onBack={() => {
          handleCloseDialog(null, false);
        }}
      />
    );
  }

  return (
    <CustomBreadcrumbs
      heading="Templates"
      description="View and manage reusable templates including exam notifications, fee reminders, and event announcements."
      links={[
        { name: 'Communication', href: '/communication/dashboard' },
        { name: 'Notifications', href: '/communication/notification/send-notification' },
        { name: 'Templates' },
      ]}
      sx={{ px: 2 }}
      action={
        <Button
          size="small"
          startIcon={<Add />}
          variant="contained"
          onClick={() => setOpen(true)}
          sx={{ px: '32px' }}
        >
          Template
        </Button>
      }
    />
  );
};
