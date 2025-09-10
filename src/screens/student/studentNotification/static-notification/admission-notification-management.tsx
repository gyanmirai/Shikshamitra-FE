'use client';

import React, { useState } from 'react';
import { Box, Card, Switch } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  NotificationStatusType,
  NotificationStatusOptions,
} from 'src/enums/notification-status-type';

import EditNotificationDialog from '../edit-notification-dialog';

const notificationsData = [
  {
    id: '2',
    event: 'Move to Admission',
    triggerCondition: 'When the student is transitioned to admission.',
    recipient: [
      {
        name: 'admin',
        message: 'The student [Student Name] has been moved to admission.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
      {
        name: 'parent',
        message:
          'Dear [Parent Name], congratulations! [Student Name] has progressed to the admission stage. Please check for further steps.',
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
    event: 'Approve Admission',
    triggerCondition: 'When the admission is approved.',
    recipient: [
      {
        name: 'admin',
        message: 'Admission for [Student Name] has been approved.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
      {
        name: 'parent',
        message:
          "Dear [Parent Name], we are pleased to inform you that [Student Name]'s admission has been approved. Welcome to [School Name]!",
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Student Name]', '[Parent Name]', '[School Name]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Parent Name]', label: 'Parent Name' },
          { value: '[School Name]', label: 'School Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '4',
    event: 'Pending Admission',
    triggerCondition: 'When the admission is in a pending state.',
    recipient: [
      {
        name: 'admin',
        message: 'Admission for [Student Name] is currently pending.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
      {
        name: 'parent',
        message:
          "Dear [Parent Name], [Student Name]'s admission is under review. We will notify you once a decision is made.",
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
];

const AdmissionNotificationManagement = () => {
  // State variable to control the visibility of the dialog.
  const [open, setOpen] = useState(false);
  // State variable to store the selected notification data.
  const [selectedData, setSelectedData] = useState<any>(null);
  // State variable to determine whether the dialog is in view mode.
  const [view, setView] = useState(false);

  // Handler function to close the dialog and reset related states.
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

export default AdmissionNotificationManagement;
