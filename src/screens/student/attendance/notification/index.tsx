'use client';

import React, { useCallback } from 'react';

import { Box, MenuList, MenuItem } from '@mui/material';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const StudentAttendanceNotificationScreen = () => {
  const actions = useCallback(
    ({ popover }: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            // confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" sx={{ height: '16px', width: '16px' }} />
          Delete
        </MenuItem>

        <MenuItem
          onClick={() => {
            // modal.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
          Edit
        </MenuItem>
        {/* {children && (
              <MenuItem
                onClick={() => {
                  childModal.onTrue();
                  popover.onClose();
                }}
              >
                <Iconify icon="ic:baseline-add" sx={{ height: '16px', width: '16px' }} />
                Create {childEditData?.name}
              </MenuItem>
            )} */}
      </MenuList>
    ),
    []
  );

  const dummyData = [
    {
      id: 1,
      name: 'John Doe',
      date: '2023-05-15',
      recipient: 'Parent',
      notificationType: 'Absence',
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
        heading="Notifications"
        links={[{ name: 'Student' }, { name: 'Attendance' }, { name: 'Notifications' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <CustomizableTable
        columns={[
          { id: 'name', label: 'Name' },
          { id: 'date', label: 'Date' },
          { id: 'recipient', label: 'Recipient' },
          { id: 'notificationType', label: 'Notification Type' },
          {
            id: 'status',
            label: 'Status',
            render(value, row) {
              return <Label color={value === 'Delivered' ? 'success' : 'warning'}>{value}</Label>;
            },
          },
          {
            id: 'action',
            label: 'Action',
            render(value, row) {
              return <ThreeDotsActions actions={actions} />;
            },
          },
        ]}
        data={dummyData}
      />
    </Box>
  );
};

export default StudentAttendanceNotificationScreen;
