'use client';

import React from 'react';

import { Box } from '@mui/material';

import { Label } from 'src/components/label';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const StudentAttendanceNotificationScreen = () => {
  const dummyData = [
    {
      id: 1,
      name: 'John Doe',
      date: '2023-05-15',
      recipient: 'Parent',
      notificationType: 'Absent',
      status: 'Delivered',
      notificationMethod: 'SMS',
    },
    {
      id: 2,
      name: 'Jane Smith',
      date: '2023-05-16',
      recipient: 'Student',
      notificationType: 'Late Arrival',
      status: 'Pending',
      notificationMethod: 'Email',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      date: '2023-05-17',
      recipient: 'Teacher',
      notificationType: 'Early Departure',
      status: 'Delivered',
      notificationMethod: 'SMS',
    },
  ];

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Notifications"
        links={[{ name: 'Student' }, { name: 'Attendance' }, { name: 'Notifications' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <CustomizableTable
        tableId="student-attendance-notification-table"
        searchFieldProps={{
          placeholder: 'Search by Name, Date, Recipient...',
          label: 'Search by Name, Date, Recipient...',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        columns={[
          { id: 'name', label: 'Name' },
          { id: 'date', label: 'Date' },
          { id: 'recipient', label: 'Recipient' },
          { id: 'notificationType', label: 'Notification Type' },
          { id: 'notificationMethod', label: 'Notification Method' },
          {
            id: 'status',
            label: 'Status',
            // Custom render function for status column with conditional styling
            render(value, row) {
              return <Label color={value === 'Delivered' ? 'success' : 'warning'}>{value}</Label>;
            },
          },
        ]}
        // Data source for the table
        data={dummyData}
      />{' '}
    </Box>
  );
};

export default StudentAttendanceNotificationScreen;
