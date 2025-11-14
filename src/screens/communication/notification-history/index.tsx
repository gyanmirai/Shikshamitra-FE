'use client';

import React from 'react';
import { Box } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { data } from './dummy_data/notification_data';

const NotificationHistoryScreen = () => {
  const column = [
    { id: 'date', label: 'Date' },
    { id: 'time', label: 'Time' },
    { id: 'message', label: 'Message' },
    { id: 'communicationChannel', label: 'Medium' },
    { id: 'sentTo', label: 'Sent To' },
    { id: 'receivedFrom', label: 'Received From' },
  ];
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Notification History"
        description="Track the history of all notifications sent to users, including details such as the date, time, message content, and the communication channel used."
        links={[
          { name: 'Communication', href: '/communication/dashboard' },
          { name: 'Notification' },
          { name: 'Notification History' },
        ]}
        sx={{ mb: 2 }}
      />
      <CustomizableTable tableId="notification-history" data={data} columns={column} />
    </Box>
  );
};

export default NotificationHistoryScreen;
