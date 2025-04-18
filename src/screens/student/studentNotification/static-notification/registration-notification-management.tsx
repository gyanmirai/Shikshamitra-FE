'use client';

import React, { useState } from 'react';

import { Box, Switch } from '@mui/material';

import {
  NotificationStatusType,
  NotificationStatusOptions,
} from 'src/enums/notification-status-type';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import EditNotificationDialog from '../edit-notification-dialog';

const notificationsData = [
  {
    id: '1',
    event: 'New Registration Entry',
    triggerCondition: 'When a new registration detail is entered.',
    recipient: [
      {
        name: 'admin',
        message: 'A new registration entry has been created for [Student Name].',
        communicationChannel: ['Email'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
      },

      {
        name: 'parent',
        message:
          'Dear [Parent Name], your registration for [Student Name] has been successfully submitted.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Parent Name]', label: 'Parent Name' },
        ],
      },
    ],
  },
  {
    id: '2',
    event: 'Modify Registration Details',
    triggerCondition: 'When an existing registration entry is updated.',
    recipient: [
      {
        name: 'admin',
        message: 'Registration details for [Student Name] have been updated.',
        communicationChannel: ['Email'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
      },

      {
        name: 'parent',
        message:
          'Dear [Parent Name], your registration details for [Student Name] have been updated. Please review the changes.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Parent Name]', label: 'Parent Name' },
        ],
      },
    ],
  },
  {
    id: '3',
    event: 'Move to Admission',
    triggerCondition: 'When the student progresses to admission.',
    recipient: [
      {
        name: 'admin',
        message: 'The student [Student Name] has been moved to admission.',
        communicationChannel: ['Email'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
      },

      {
        name: 'parent',
        message:
          'Dear [Parent Name], congratulations! [Student Name] has been moved to admission. Please check your email for further steps.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Parent Name]', label: 'Parent Name' },
        ],
      },
    ],
  },
  {
    id: '4',
    event: 'Schedule Exam',
    triggerCondition: 'When an exam is scheduled.',
    recipient: [
      {
        name: 'admin',
        message: 'An exam has been scheduled for [Student Name] on [Date].',
        communicationChannel: ['Email'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Parent Name]', label: 'Parent Name' },
        ],
      },

      {
        name: 'parent',
        message:
          'Dear [Parent Name], an exam for [Student Name] has been scheduled on [Date]. Please ensure timely preparation.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Parent Name]', label: 'Parent Name' },
          { value: '[Date]', label: 'Date' },
        ],
      },
    ],
  },
  {
    id: '5',
    event: 'Upload Exam Result',
    triggerCondition: 'When exam results are uploaded.',
    recipient: [
      {
        name: 'admin',
        message: 'Exam results for [Student Name] have been uploaded.',
        communicationChannel: ['Email'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
      },
      {
        name: 'parent',
        message:
          'Dear [Parent Name], the exam results for [Student Name] are now available. Please check the portal for details.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Parent Name]', label: 'Parent Name' },
        ],
      },
    ],
  },
];

interface RegistrationNotificationManagementProps {}

const RegistrationNotificationManagement = () => {
  // State variable to control the visibility of the EditNotificationDialog.
  const [open, setOpen] = useState(false);
  // State variable to store the data of the selected notification for editing.
  const [selectedData, setSelectedData] = useState<any>(null);
  // State variable to determine whether the dialog is in view mode or edit mode.
  const [view, setView] = useState(false);

  // Handler function to close the EditNotificationDialog and reset related states.
  const closeHandler = () => {
    setOpen(false);
    setSelectedData(null);
    setView(false);
  };

  return (
    <>
      {open ? (
        <EditNotificationDialog data={selectedData} onClose={closeHandler} isFromView={view} />
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
                      checked={NotificationStatusType.Active === row.isActive}
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

export default RegistrationNotificationManagement;
