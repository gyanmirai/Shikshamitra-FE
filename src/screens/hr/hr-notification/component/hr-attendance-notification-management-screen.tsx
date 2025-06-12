'use client';

import React, { useState } from 'react';

import { Box, Card, Switch } from '@mui/material';

import EditNotificationDialog from 'src/screens/student/studentNotification/edit-notification-dialog';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const HrAttendanceNotificationManagementScreen = () => {
  const notificationData = [
    {
      event: 'Add New Leave Policy',
      triggerCondition: 'When a new leave policy is added.',
      recipient: [
        {
          name: 'Admin/HR',
          message: 'A new leave policy [Policy Name] has been added.',
          communicationChannel: ['Email'],
          placeHolder: { '[Policy Name]': 'Leave Policy Name' },
          placeHolderOptions: [{ value: '[Policy Name]', label: 'Leave Policy Name' }],
          isEnable: true,
        },
        {
          name: 'Employee',
          message:
            'A new leave policy [Policy Name] is now in effect. Check the policy document for details.',
          communicationChannel: ['Email'],
          placeHolder: { '[Policy Name]': 'Leave Policy Name' },
          placeHolderOptions: [{ value: '[Policy Name]', label: 'Leave Policy Name' }],
          isEnable: true,
        },
      ],
    },
    {
      event: 'Edit Leave Policy',
      triggerCondition: 'When an existing leave policy is modified.',
      recipient: [
        {
          name: 'Admin/HR',
          message: 'Leave policy [Policy Name] has been updated.',
          communicationChannel: ['Email'],
          placeHolder: { '[Policy Name]': 'Leave Policy Name' },
          placeHolderOptions: [{ value: '[Policy Name]', label: 'Leave Policy Name' }],
          isEnable: true,
        },
        {
          name: 'Employee',
          message: 'Leave policy [Policy Name] has been modified. Review the updated guidelines.',
          communicationChannel: ['Email'],
          placeHolder: { '[Policy Name]': 'Leave Policy Name' },
          placeHolderOptions: [{ value: '[Policy Name]', label: 'Leave Policy Name' }],
          isEnable: true,
        },
      ],
    },
    {
      event: 'Delete Leave Policy',
      triggerCondition: 'When a leave policy is deleted.',
      recipient: [
        {
          name: 'Admin/HR',
          message: 'Leave policy [Policy Name] has been removed from the system.',
          communicationChannel: ['Email'],
          placeHolder: { '[Policy Name]': 'Leave Policy Name' },
          placeHolderOptions: [{ value: '[Policy Name]', label: 'Leave Policy Name' }],
          isEnable: true,
        },
        {
          name: 'Employee',
          message: 'The leave policy [Policy Name] has been discontinued.',
          communicationChannel: ['Email'],
          placeHolder: { '[Policy Name]': 'Leave Policy Name' },
          placeHolderOptions: [{ value: '[Policy Name]', label: 'Leave Policy Name' }],
          isEnable: true,
        },
      ],
    },
    {
      event: 'Approve Leave Request',
      triggerCondition: "When an employee's leave request is approved.",
      recipient: [
        {
          name: 'Employee',
          message: 'Your leave request for [Date] has been approved.',
          communicationChannel: ['Email'],
          placeHolder: { '[Date]': 'Leave Date' },
          placeHolderOptions: [{ value: '[Date]', label: 'Leave Date' }],
          isEnable: true,
        },
        {
          name: 'HR/Manager',
          message: "[Employee Name]'s leave request for [Date] has been approved.",
          communicationChannel: ['Email'],
          placeHolder: {
            '[Employee Name]': 'Employee Name',
            '[Date]': 'Leave Date',
          },
          placeHolderOptions: [
            { value: '[Employee Name]', label: 'Employee Name' },
            { value: '[Date]', label: 'Leave Date' },
          ],
          isEnable: true,
        },
      ],
    },
    {
      event: 'Decline Leave Request',
      triggerCondition: "When an employee's leave request is declined.",
      recipient: [
        {
          name: 'Employee',
          message: 'Your leave request for [Date] has been declined. Contact HR for details.',
          communicationChannel: ['Email'],
          placeHolder: { '[Date]': 'Leave Date' },
          placeHolderOptions: [{ value: '[Date]', label: 'Leave Date' }],
          isEnable: true,
        },
        {
          name: 'HR/Manager',
          message: "[Employee Name]'s leave request for [Date] has been declined.",
          communicationChannel: ['Email'],
          placeHolder: {
            '[Employee Name]': 'Employee Name',
            '[Date]': 'Leave Date',
          },
          placeHolderOptions: [
            { value: '[Employee Name]', label: 'Employee Name' },
            { value: '[Date]', label: 'Leave Date' },
          ],
          isEnable: true,
        },
      ],
    },
    {
      event: 'Add Late Arrival Policy',
      triggerCondition: 'When a new late arrival policy is added.',
      recipient: [
        {
          name: 'Admin/HR',
          message: 'A new late arrival policy has been introduced.',
          communicationChannel: ['Email'],
          isEnable: true,
        },
        {
          name: 'Employee',
          message:
            'A new late arrival policy is now in effect. Review the details to avoid penalties.',
          communicationChannel: ['Email'],
          isEnable: true,
        },
      ],
    },
    {
      event: 'Edit Late Arrival Policy',
      triggerCondition: 'When an existing late arrival policy is modified.',
      recipient: [
        {
          name: 'Admin/HR',
          message: 'Late arrival policy has been updated.',
          communicationChannel: ['Email'],
          isEnable: true,
        },
        {
          name: 'Employee',
          message: 'The late arrival policy has been modified. Check the new rules.',
          communicationChannel: ['Email'],
          isEnable: true,
        },
      ],
    },
    {
      event: 'Delete Late Arrival Policy',
      triggerCondition: 'When a late arrival policy is removed.',
      recipient: [
        {
          name: 'Admin/HR',
          message: 'Late arrival policy has been deleted from the system.',
          communicationChannel: ['Email'],
          isEnable: true,
        },
        {
          name: 'Employee',
          message: 'The late arrival policy has been removed. Check for further updates.',
          communicationChannel: ['Email'],
          isEnable: true,
        },
      ],
    },
  ];

  const [open, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [view, setView] = useState(false);

  const closeHandler = () => {
    setOpen(false);
    setSelectedData(null);
    setView(false);
  };

  return (
    <>
      {open ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <EditNotificationDialog data={selectedData} onClose={closeHandler} isFromView={view} />
        </Card>
      ) : (
        <CustomizableTable
          noDataText={<>No Event Notification Found </>}
          tableId="student-auto-notification-configuration"
          data={notificationData}
          columns={[
            {
              id: 'event',
              label: 'Event',
            },
            {
              id: 'triggerCondition',

              label: 'Trigger Condition',
            },
            {
              id: 'recipient',
              label: 'Recipient',
              render(value, row) {
                return row.recipient.map((recipient: any) => (
                  <Box key={recipient.name}>
                    <Box>{recipient.name.toUpperCase()}</Box>
                  </Box>
                ));
              },
            },
            {
              id: 'isActive',
              label: 'Active',
              isFilter: false,
              isSort: false,
              render(value, row) {
                return (
                  <Box>
                    <Switch
                      checked={row.isActive}
                      onChange={(event) => {
                        console.log(event.target.checked);
                      }}
                    />
                  </Box>
                );
              },
            },
            {
              id: 'action',
              label: 'Action',
              isFilter: false,
              isSort: false,
              sticky: true,
              minWidth: 50,
              render(value, row) {
                return (
                  <ThreeDotsActions
                    showThreeDots={false}
                    showEditIcon
                    handleEditClick={() => {
                      setSelectedData(row);
                      setOpen(true);
                      setView(false);
                    }}
                    showViewIcon
                    handleViewClick={() => {
                      setSelectedData(row);
                      setView(true);
                      setOpen(true);
                    }}
                  />
                );
              },
            },
          ]}
        />
      )}
    </>
  );
};

export default HrAttendanceNotificationManagementScreen;
