'use client';

import React from 'react';

import CustomizableTable from 'src/components/customizabaleTable';

const NotificationHistoryScreen = () => {
  console.log('NotificationHistoryScreen');

  const data = [
    {
      date: '08-01-2025',
      time: '12:00 PM',
      message: 'This is a notification message.',
      communicationChannel: 'Email',
      sentTo: 'John Doe',
      receivedFrom: 'Admin',
    },
    {
      date: '08-01-2025',
      time: '12:00 PM',
      message: 'This is a notification message.',
      communicationChannel: 'Email',
      sentTo: ['abc', 'def'],
      receivedFrom: 'Admin',
    },
  ];

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
