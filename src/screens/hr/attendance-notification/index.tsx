'use client';

import React from 'react';
import { Box } from '@mui/material';
import { Label } from 'src/components/label';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetEmployeeNotificationHistoryQuery } from 'src/redux/hr/employeeApi';

const HrAttendanceNotificationScreen = () => {
  const { data: notificationHistory, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeNotificationHistoryQuery,
  });
  const rows = Array.isArray(notificationHistory)
    ? notificationHistory
    : notificationHistory?.items || [];

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Notifications History"
        links={[
          { name: 'HR' },
          { name: 'Attendance Management' },
          { name: 'Notifications History' },
        ]}
      />
      <CustomizableTable
        tableId="hr-attendance-notification"
        isLoading={isLoading}
        noDataText="No attendance notification history found."
        columns={[
          { id: 'name', label: 'Name' },
          { id: 'date', label: 'Date' },
          // { id: 'recipient', label: 'Recipient' },
          { id: 'notificationType', label: 'Notification Type' },
          {
            id: 'status',
            label: 'Status',
            render(value, row) {
              return <Label color={value === 'Delivered' ? 'success' : 'warning'}>{value}</Label>;
            },
          },
        ]}
        data={rows}
      />
    </Box>
  );
};

export default HrAttendanceNotificationScreen;
