'use client';

import { useState } from 'react';
import Add from '@mui/icons-material/Add';
import { Box, Button } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import NotificationFormStepper from './NotificationFormStepper';
import SentNotificationTableView from './SentNotificationTableView';

const SendNotification = () => {
  const [showForm, setShowForm] = useState(false);

  // Back button and dialog close handler
  const handleCloseDialog = (_e?: any, isSubmit?: boolean) => {
    setShowForm(false);
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {!showForm && (
        <CustomBreadcrumbs
          heading="Sent Notification"
          description="Create and send notifications to selected audiences via preferred channels."
          links={[
            { name: 'Communication', href: '/communication/dashboard' },
            { name: 'Notifications' },
            { name: 'Sent Notification' },
          ]}
          action={
            <Button
              onClick={() => setShowForm(true)}
              size="small"
              startIcon={<Add />}
              variant="contained"
            >
              Sent Notification
            </Button>
          }
          sx={{ px: 1, mb: 1 }}
        />
      )}

      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {!showForm ? (
          <SentNotificationTableView />
        ) : (
          <>
            <CustomBreadcrumbs
              heading="Sent Notification"
              description="Create and send notifications to selected audiences via preferred channels."
              links={[
                { name: 'Communication', href: '/communication/dashboard' },
                { name: 'Notifications' },
                { name: 'Sent Notification' },
              ]}
              sx={{ mb: 2 }}
              isBack
              onBack={handleCloseDialog}
            />
            <NotificationFormStepper onBack={handleCloseDialog} />
          </>
        )}
      </Box>
    </Box>
  );
};

export default SendNotification;
