'use client';

import type { INotification } from 'src/screens/communication/NotificationHistory/type';

import { useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetSentNotificationHistoryQuery } from 'src/redux/communication/setting/importanceLevel';

/**
 * Custom Hook: useSentNotificationTable
 * Responsibilities:
 * - Fetching sent notification history data
 * - Managing dialog state for viewing notification details
 * - Managing selected notification state for the detail view
 */
export const useSentNotificationTable = () => {
  const viewNotificationDialog = useBoolean(false);
  const [selectedNotification, setSelectedNotification] = useState<INotification | null>(null);

  const { data: notificationData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSentNotificationHistoryQuery,
  });

  return {
    notificationData,
    isLoading,
    viewNotificationDialog,
    selectedNotification,
    setSelectedNotification,
  };
};
