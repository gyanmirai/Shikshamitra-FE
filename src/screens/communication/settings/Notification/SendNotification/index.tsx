'use client';

import Add from '@mui/icons-material/Add';
import { Box, Button } from '@mui/material';
import { useState, useCallback } from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import NotificationFormStepper from './NotificationFormStepper';
import SentNotificationTableView from './SentNotificationTableView';

/**
 * Component: SendNotification
 * Responsibilities:
 * - Root container for the "Sent Notification" module
 * - Managing the toggle between table view and creation form
 * - Providing layout-level navigation (breadcrumbs)
 */
const SendNotification = () => {
  const [showForm, setShowForm] = useState(false);

  /**
   * Memoization Justification:
   * This function is passed to the `action` prop of `CustomBreadcrumbs`.
   * Memoizing it prevents the button reference from changing, avoiding
   * unnecessary re-renders of the Breadcrumbs component when the parent updates.
   */
  const handleOpenForm = useCallback(() => {
    setShowForm(true);
  }, []);

  /**
   * Memoization Justification:
   * This function is passed as a prop to the `NotificationFormStepper` and `CustomBreadcrumbs` components.
   * Memoizing it with `useCallback` prevents unnecessary re-renders of these child components
   * when the parent `SendNotification` component re-renders due to state changes (e.g., `showForm`).
   * This is crucial for performance as `NotificationFormStepper` is a complex component managing form state.
   */
  const handleCloseDialog = useCallback((_e?: any, _isSubmit?: boolean) => {
    setShowForm(false);
  }, []);

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
              onClick={handleOpenForm}
              size="small"
              startIcon={<Add />}
              variant="contained"
              sx={{ px: '32px' }}
            >
              Send Notification
            </Button>
          }
          sx={{ px: 2 }}
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
              sx={{ px: 2 }}
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
