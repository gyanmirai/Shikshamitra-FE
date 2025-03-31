'use client';

import React from 'react';

import CustomizableTable from 'src/components/customizabaleTable';

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
  return <CustomizableTable tableId="notification-history" data={data} columns={column} />;
};

export default NotificationHistoryScreen;
