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
    id: '2',
    event: 'Update Student Details',
    triggerCondition: 'When any change occurs in student records.',
    recipient: [
      {
        name: 'admin',
        message: 'Student details for [Student Name] have been updated.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
      {
        name: 'parent',
        message:
          'Dear [Parent Name], the details for [Student Name] have been updated. Please review the changes in the student portal.',
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
    id: '3',
    event: 'Generate GR Number',
    triggerCondition: 'When a new GR number is assigned.',
    recipient: [
      {
        name: 'admin',
        message: 'A GR number has been assigned to [Student Name]: [GR Number].',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Student Name]', '[GR Number]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[GR Number]', label: 'GR Number' },
        ],
        isEnable: true,
      },
      {
        name: 'parent',
        message:
          'Dear [Parent Name], the GR number for [Student Name] has been assigned as [GR Number]. Please keep this for future reference.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Student Name]', '[Parent Name]', '[GR Number]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Parent Name]', label: 'Parent Name' },
          { value: '[GR Number]', label: 'GR Number' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '4',
    event: 'Generate Roll Number',
    triggerCondition: 'When a new roll number is assigned.',
    recipient: [
      {
        name: 'admin',
        message: 'A roll number has been assigned to [Student Name]: [Roll Number].',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Student Name]', '[Roll Number]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Roll Number]', label: 'Roll Number' },
        ],
        isEnable: true,
      },
      {
        name: 'parent',
        message:
          'Dear [Parent Name], the roll number for [Student Name] has been assigned as [Roll Number]. Please use this for future communication.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Student Name]', '[Parent Name]', '[Roll Number]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Parent Name]', label: 'Parent Name' },
          { value: '[Roll Number]', label: 'Roll Number' },
        ],
        isEnable: true,
      },
    ],
  },
];

const StudentRecordNotificationManagement = () => {
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

export default StudentRecordNotificationManagement;
