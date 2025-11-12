'use client';

import { Box, Card, Switch } from '@mui/material';
import React, { useState, useEffect } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  NotificationStatusType,
  NotificationStatusOptions,
} from 'src/enums/notification-status-type';

import EditNotificationDialog from '../editNotificationDialog';

const initialNotificationsData = [
  {
    id: '1',
    event: 'Leave Request',
    triggerCondition: 'When a student requests leave.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'admin',
        message: '[Student Name] has requested leave for [Date(s)]. Please review the request.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Student Name]', '[Date(s)]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Date(s)]', label: 'Leave Date(s)' },
        ],
        isEnable: true,
      },
      {
        name: 'parent',
        message:
          'Dear [Parent Name], a leave request has been submitted for [Student Name] for [Date(s)]. You can check the status in the portal.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Student Name]', '[Parent Name]', '[Date(s)]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Parent Name]', label: 'Parent Name' },
          { value: '[Date(s)]', label: 'Leave Date(s)' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '2',
    event: 'Approve Leave',
    triggerCondition: 'When a leave request is approved.',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'parent',
        message:
          "Dear [Parent Name], [Student Name]'s leave request for [Date(s)] has been approved.",
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Student Name]', '[Parent Name]', '[Date(s)]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Parent Name]', label: 'Parent Name' },
          { value: '[Date(s)]', label: 'Leave Date(s)' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '3',
    event: 'Reject Leave',
    triggerCondition: 'When a leave request is rejected.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'parent',
        message:
          "Dear [Parent Name], unfortunately, [Student Name]'s leave request for [Date(s)] has been rejected. Please contact the school for further details.",
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Student Name]', '[Parent Name]', '[Date(s)]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Parent Name]', label: 'Parent Name' },
          { value: '[Date(s)]', label: 'Leave Date(s)' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '4',
    event: 'Mark Attendance',
    triggerCondition: 'When attendance is recorded (present/absent).',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'parent',
        message:
          'Dear [Parent Name], [Student Name] has been marked [Present/Absent] for [Date]. You can check attendance records in the portal.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Student Name]', '[Parent Name]', '[Date]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Parent Name]', label: 'Parent Name' },
          { value: '[Date]', label: 'Attendance Date' },
        ],
        isEnable: true,
      },
    ],
  },
];

interface AttendanceNotificationManagementProps {
  dialog?: any;
}

const AttendanceNotificationManagement = ({ dialog }: AttendanceNotificationManagementProps) => {
  // State variable to control the visibility of the EditNotificationDialog.
  const [open, setOpen] = useState(false);
  // State variable to store the data of the selected notification for editing.
  const [selectedData, setSelectedData] = useState<any>(null);
  // State variable to determine whether the dialog is in view mode or edit mode.
  const [view, setView] = useState(false);
  // State variable to manage notifications data
  const [notificationsData, setNotificationsData] = useState(initialNotificationsData);

  // Sync local open state with parent dialog
  useEffect(() => {
    if (dialog) {
      if (open) {
        dialog.onTrue();
      } else {
        dialog.onFalse();
      }
    }
  }, [open, dialog]);

  // Handler function to close the EditNotificationDialog and reset related state variables.
  const closeHandler = () => {
    setOpen(false);
    setSelectedData(null);
    setView(false);
  };

  // Handler to toggle notification status
  const handleToggleStatus = (id: string) => {
    setNotificationsData((prevData) =>
      prevData.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              isActive:
                notification.isActive === NotificationStatusType.Active
                  ? NotificationStatusType.Inactive
                  : NotificationStatusType.Active,
            }
          : notification
      )
    );
  };

  return (
    <>
      {open ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <EditNotificationDialog data={selectedData} onClose={closeHandler} isFromView={view} />
        </Card>
      ) : (
        <CustomizableTable
          tableId="student-auto-notification-configuration"
          data={notificationsData}
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
              filterType: 'enum',
              isSort: false,
              enumOptions: NotificationStatusOptions,
              render(value, row) {
                return (
                  <Box>
                    <Switch
                      checked={row.isActive === NotificationStatusType.Active}
                      onChange={() => handleToggleStatus(row.id)}
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
              minWidth: 60,
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

export default AttendanceNotificationManagement;
