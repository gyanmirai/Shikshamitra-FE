'use client';

import React from 'react';
import { Box } from '@mui/material';
import { Label } from 'src/components/label';
import { hrPaths } from 'src/constants/hr-menus';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetEmployeeNotificationHistoryQuery } from 'src/redux/hr/employeeApi';

const HrAttendanceNotificationScreen = () => {
  const {
    data: notificationHistory,
    isLoading,
    error,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeNotificationHistoryQuery,
  });
  const rows = Array.isArray(notificationHistory)
    ? notificationHistory
    : notificationHistory?.items || [];

  return (
    <Box sx={{ height: 1, minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Notifications History"
        description="Review delivery status for staff attendance notifications."
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Attendance Management', href: hrPaths.attendance.dashboard },
          { name: 'Notifications History' },
        ]}
      />
      <CustomizableTable
        tableId="hr-attendance-notification"
        tableTitle="Attendance notifications"
        wrapperProps={{ sx: { flex: 1, minHeight: 0 } }}
        tableContainerProps={{ sx: { height: 1 } }}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        exportScope="loaded"
        exportLabel="Export loaded rows"
        noDataText="No attendance notification history found."
        columns={[
          { id: 'name', label: 'Name' },
          { id: 'date', filterType: 'date', label: 'Date' },
          // { id: 'recipient', label: 'Recipient' },
          { id: 'notificationType', label: 'Notification Type' },
          {
            id: 'status',
            label: 'Status',
            filterType: 'enum',
            enumOptions: [
              ...new Set<string>(rows.map((row: { status: string }) => row.status)),
            ].map((value) => ({ value, label: value })),
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
