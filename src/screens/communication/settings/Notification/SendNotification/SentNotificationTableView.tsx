'use client';

import type { INotification } from 'src/screens/communication/NotificationHistory/type';

import { Box } from '@mui/material';
import React, { useCallback } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import communicationData from 'src/json/communication/dummy-data/communicationData.json';

import ViewNotificationDialog from './Components/ViewNotificationDialog';
import { useSentNotificationTable } from './hooks/useSentNotificationTable';
import { useSentNotificationTableColumns } from './Components/SentNotificationTableColumns';

/**
 * Component: SentNotificationTableView
 * Responsibilities:
 * - High-level layout for the sent notifications table
 * - Connecting logic hooks with UI components
 * - Orchestrating the table and detail dialog
 */
const SentNotificationTableView = () => {
  const {
    // notificationData, // Note: Ready for API integration when JSON is replaced
    viewNotificationDialog,
    selectedNotification,
    setSelectedNotification,
  } = useSentNotificationTable();

  /**
   * Memoization Justification:
   * This callback is passed to the `useSentNotificationTableColumns` hook.
   * Memoizing it prevents the columns array from being re-created on every render
   * of this view, which in turn prevents unnecessary re-renders of the table.
   */
  const handleViewDetails = useCallback(
    (row: INotification) => {
      setSelectedNotification(row);
      viewNotificationDialog.onTrue();
    },
    [setSelectedNotification, viewNotificationDialog]
  );

  const columns = useSentNotificationTableColumns({ onView: handleViewDetails });

  /**
   * Memoization Justification:
   * This callback is passed to `ViewNotificationDialog`.
   * It ensures the dialog closure logic is stable and doesn't cause
   * unnecessary re-renders of the dialog component.
   */
  const handleCloseDialog = useCallback(() => {
    setSelectedNotification(null);
    viewNotificationDialog.onFalse();
  }, [setSelectedNotification, viewNotificationDialog]);

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomizableTable
        tableId="sent-notification-table"
        noDataText="No Notifications Found"
        columns={columns}
        data={communicationData?.sentNotificationData || []}
      />

      <ViewNotificationDialog
        open={viewNotificationDialog.value}
        onClose={handleCloseDialog}
        notification={selectedNotification}
      />
    </Box>
  );
};

export default SentNotificationTableView;
