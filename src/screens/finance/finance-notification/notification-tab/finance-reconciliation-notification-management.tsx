'use client';

import React, { useState } from 'react';

import { Box, Card, Switch } from '@mui/material';

import EditNotificationDialog from 'src/screens/student/studentNotification/edit-notification-dialog';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const notificationData = [
  {
    id: '14',
    event: 'Bounce Check',
    triggerCondition: 'When a check bounces.',
    recipient: [
      {
        name: 'admin',
        message:
          'A check [Check No.] from [Payer Name] for [Amount] has bounced due to [Reason]. Please take necessary action.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Check No.]', '[Payer Name]', '[Amount]', '[Reason]'],
        placeHolderOptions: [
          { value: '[Check No.]', label: 'Check Number' },
          { value: '[Payer Name]', label: 'Payer Name' },
          { value: '[Amount]', label: 'Amount' },
          { value: '[Reason]', label: 'Reason for Bounce' },
        ],
        isEnable: true,
      },

      {
        name: 'parent',
        message:
          'Your check [Check No.] for [Amount] has bounced due to [Reason]. Please clear dues at the earliest.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Check No.]', '[Amount]', '[Reason]'],
        placeHolderOptions: [
          { value: '[Check No.]', label: 'Check Number' },
          { value: '[Amount]', label: 'Amount' },
          { value: '[Reason]', label: 'Reason for Bounce' },
        ],
        isEnable: true,
      },
    ],
  },

  {
    id: '15',
    event: 'Clear Check',
    triggerCondition: 'When a check is cleared successfully.',
    recipient: [
      {
        name: 'admin',
        message: 'The check [Check No.] from [Payer Name] has been cleared successfully.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Check No.]', '[Payer Name]'],
        placeHolderOptions: [
          { value: '[Check No.]', label: 'Check Number' },
          { value: '[Payer Name]', label: 'Payer Name' },
        ],
        isEnable: true,
      },

      {
        name: 'parent',
        message:
          'Your check [Check No.] has been successfully processed. Thank you for clearing the dues.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Check No.]'],
        placeHolderOptions: [{ value: '[Check No.]', label: 'Check Number' }],
        isEnable: true,
      },
    ],
  },
];

const FinanceReconciliationNotificationManagement = () => {
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

export default FinanceReconciliationNotificationManagement;
