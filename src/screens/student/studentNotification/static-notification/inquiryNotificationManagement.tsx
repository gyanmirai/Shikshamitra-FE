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

// Add isActive property to each notification object
const initialNotificationsData = [
  {
    id: '1',
    event: 'Submit Inquiry',
    triggerCondition: 'When Adding a New inquiry.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'parent',
        message:
          'Dear [Parent Name], we have received your inquiry for [Student Name]. Our team will contact you soon.',
        communicationChannel: ['WhatsApp', 'Email', 'Message'],
        placeHolder: ['[Student Name]', '[Parent Name]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Parent Name]', label: 'Parent Name' },
        ],
        isEnable: true,
      },
      {
        name: 'admin',
        message: 'A new inquiry for [Student Name] has been submitted.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Parent Name]', label: 'Parent Name' },
          { value: '[Parent Name1]', label: 'Parent Name1' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '2',
    event: 'Close Inquiry',
    triggerCondition: 'When closing a particular inquiry.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'parent',
        message:
          'Dear [Parent Name], your inquiry for [Student Name] has been closed. Let us know if you need any further assistance.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Student Name]', '[Parent Name]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Parent Name]', label: 'Parent Name' },
        ],
        isEnable: true,
      },
      {
        name: 'admin',
        message: 'Inquiry for [Student Name] has been closed.',
        communicationChannel: ['Email'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '3',
    event: 'Move to Registration',
    triggerCondition: 'When the inquiry is converted to a registration.',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'admin',
        message: 'The inquiry for [Student Name] has been moved to registration.',
        communicationChannel: ['Email'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
      {
        name: 'parent',
        message:
          'Dear [Parent Name], your inquiry for [Student Name] has been successfully moved to the registration process.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Student Name]', '[Parent Name]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Parent Name]', label: 'Parent Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '4',
    event: 'Move to Admission',
    triggerCondition: 'When the student moves to admission.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'admin',
        message: 'The student [Student Name] has been moved to admission.',
        communicationChannel: ['Email'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
      {
        name: 'parent',
        message:
          'Dear [Parent Name], congratulations! [Student Name] has been moved to admission. Please check your email for further steps.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Student Name]', '[Parent Name]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Parent Name]', label: 'Parent Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '5',
    event: 'Modify Inquiry Details',
    triggerCondition: 'When any changes occur in the inquiry details.',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'admin',
        message: "Details for [Student Name]'s inquiry have been updated.",
        communicationChannel: ['Email'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
      {
        name: 'parent',
        message:
          'Dear [Parent Name], there has been an update to your inquiry for [Student Name]. Please review the details.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Student Name]', '[Parent Name]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Parent Name]', label: 'Parent Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '6',
    event: 'Change Inquiry Status',
    triggerCondition: 'When status changes (Interested, Pending, Not Interested).',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'admin',
        message: 'The status for [Student Name] has been changed to [New Status].',
        communicationChannel: ['Email'],
        placeHolder: ['[Student Name]', '[New Status]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[New Status]', label: 'New Status' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '7',
    event: 'Follow-up Reminder',
    triggerCondition: 'When the next follow-up date is approaching.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'admin',
        message: 'Reminder: Follow-up for [Student Name] is due on [Date].',
        communicationChannel: ['Email'],
        placeHolder: ['[Student Name]', '[Date]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Date]', label: 'Date' },
        ],
        isEnable: true,
      },
      {
        name: 'parent',
        message:
          'Dear [Parent Name], just a reminder that we have a follow-up scheduled for [Student Name] on [Date]. Let us know if you have any questions.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Student Name]', '[Parent Name]', '[Date]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Parent Name]', label: 'Parent Name' },
          { value: '[Date]', label: 'Date' },
        ],
        isEnable: true,
      },
    ],
  },
];

interface NewStudentNotificationForInquiryProps {
  dialog?: any;
}

const NewStudentNotificationForInquiry = ({ dialog }: NewStudentNotificationForInquiryProps) => {
  // State variables to manage the dialog and selected notification data
  const [open, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [view, setView] = useState(false);
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

  // Handler function to close the dialog and reset selected data and view state
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

export default NewStudentNotificationForInquiry;
