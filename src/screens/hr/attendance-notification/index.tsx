'use client';

import React from 'react';
import { Box } from '@mui/material';
import { Label } from 'src/components/label';
import CustomizableTable from 'src/components/customizable-table';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetEmployeeNotificationHistoryQuery } from 'src/redux/hr/employeeApi';

const HrAttendanceNotificationScreen = () => {
  useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeNotificationHistoryQuery,
  });

  const dummyData = [
    {
      id: 1,
      name: 'John Doe',
      date: '2023-05-15',
      recipient: 'Parent',
      notificationType: 'Absent',
      status: 'Delivered',
    },
    {
      id: 2,
      name: 'Jane Smith',
      date: '2023-05-16',
      recipient: 'Student',
      notificationType: 'Late Arrival',
      status: 'Pending',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      date: '2023-05-17',
      recipient: 'Teacher',
      notificationType: 'Early Departure',
      status: 'Delivered',
    },
  ];

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Notifications History"
        links={[{ name: 'HR' }, { name: 'Attendance & Leave' }, { name: 'Notifications History' }]}
      />
      <CustomizableTable
        tableId="hr-attendance-notification"
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
        data={dummyData}
      />
    </Box>
  );
};

export default HrAttendanceNotificationScreen;
