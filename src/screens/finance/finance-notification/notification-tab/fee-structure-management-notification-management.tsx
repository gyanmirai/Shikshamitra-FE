'use client';

import React, { useState } from 'react';

import { Box, Card, Switch } from '@mui/material';

import EditNotificationDialog from 'src/screens/student/studentNotification/edit-notification-dialog';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const notificationData = [
  {
    id: '3',
    event: 'Activate/Deactivate Fee Structure',
    triggerCondition: 'When changing the fee structure status.',
    recipient: [
      {
        name: 'admin',
        message: 'The fee structure [Fee Structure Name] has been [Activated/Deactivated].',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Fee Structure Name]', '[Activated/Deactivated]'],
        placeHolderOptions: [
          { value: '[Fee Structure Name]', label: 'Fee Structure Name' },
          { value: '[Activated/Deactivated]', label: 'Activated/Deactivated' },
        ],
        isEnable: true,
      },
      {
        name: 'finance Team',
        message: 'The fee structure [Fee Structure Name] has been [Activated/Deactivated].',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Fee Structure Name]', '[Activated/Deactivated]'],
        placeHolderOptions: [
          { value: '[Fee Structure Name]', label: 'Fee Structure Name' },
          { value: '[Activated/Deactivated]', label: 'Activated/Deactivated' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '4',
    event: 'Modify Fee Head Status',
    triggerCondition: 'When updating the status of a fee head in a structure.',
    recipient: [
      {
        name: 'admin',
        message:
          'The fee head [Fee Head Name] in [Fee Structure Name] has been updated to [Active/Inactive].',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Fee Head Name]', '[Fee Structure Name]', '[Active/Inactive]'],
        placeHolderOptions: [
          { value: '[Fee Head Name]', label: 'Fee Head Name' },
          { value: '[Fee Structure Name]', label: 'Fee Structure Name' },
          { value: '[Active/Inactive]', label: 'Active/Inactive' },
        ],
        isEnable: true,
      },
      {
        name: 'finance Team',
        message:
          'The fee head [Fee Head Name] in [Fee Structure Name] has been updated to [Active/Inactive].',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Fee Head Name]', '[Fee Structure Name]', '[Active/Inactive]'],
        placeHolderOptions: [
          { value: '[Fee Head Name]', label: 'Fee Head Name' },
          { value: '[Fee Structure Name]', label: 'Fee Structure Name' },
          { value: '[Active/Inactive]', label: 'Active/Inactive' },
        ],
        isEnable: true,
      },
    ],
  },
];

const FeeStructureManagementNotificationManagement = () => {
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

export default FeeStructureManagementNotificationManagement;
