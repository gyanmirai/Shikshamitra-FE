'use client';

import React, { useState } from 'react';
import { Box, Card, Switch } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import EditNotificationDialog from 'src/screens/student/studentNotification/edit-notification-dialog';

const TransportVehicleNotificationManagementScreen = () => {
  const notificationData = [
    {
      event: 'New Maintenance Record Added For Vehicle',
      triggerCondition: 'When a new maintenance record is added for a vehicle.',
      recipient: [
        {
          name: 'Admin',
          message: 'A maintenance record has been added for [Vehicle Number].',
          communicationChannel: ['Email'],
          placeHolder: {
            '[Vehicle Number]': 'Vehicle Number',
          },
          placeHolderOptions: [{ value: '[Vehicle Number]', label: 'Vehicle Number' }],
          isEnable: true,
        },
        {
          name: 'Driver',
          message:
            'Maintenance has been scheduled for [Vehicle Number]. Avoid using the vehicle during this period.',
          communicationChannel: ['Email'],
          placeHolder: {
            '[Vehicle Number]': 'Vehicle Number',
          },
          placeHolderOptions: [{ value: '[Vehicle Number]', label: 'Vehicle Number' }],
          isEnable: true,
        },
      ],
    },
    {
      event: 'Modification in Maintenance Record Vehicle',
      triggerCondition: 'When a maintenance record is updated for a vehicle.',
      recipient: [
        {
          name: 'Admin',
          message: 'The maintenance record for [Vehicle Number] has been updated.',
          communicationChannel: ['Email'],
          placeHolder: {
            '[Vehicle Number]': 'Vehicle Number',
          },
          placeHolderOptions: [{ value: '[Vehicle Number]', label: 'Vehicle Number' }],
          isEnable: true,
        },
        {
          name: 'Driver',
          message:
            'The maintenance details for your vehicle [Vehicle Number] have changed. Check for updates.',
          communicationChannel: ['Email'],
          placeHolder: {
            '[Vehicle Number]': 'Vehicle Number',
          },
          placeHolderOptions: [{ value: '[Vehicle Number]', label: 'Vehicle Number' }],
          isEnable: true,
        },
      ],
    },
    {
      event: 'Daily Logbook Entry Added For Vehicle',
      triggerCondition: 'When a daily logbook entry is recorded.',
      recipient: [
        {
          name: 'Admin',
          message: 'A new daily logbook entry has been recorded.',
          communicationChannel: ['Email'],
          placeHolder: {},
          placeHolderOptions: [],
          isEnable: true,
        },
        {
          name: 'Driver',
          message: 'Your daily logbook entry for [Date] has been successfully submitted.',
          communicationChannel: ['Email'],
          placeHolder: {
            '[Date]': 'Date',
          },
          placeHolderOptions: [{ value: '[Date]', label: 'Date' }],
          isEnable: true,
        },
      ],
    },
    {
      event: 'New Driver Added',
      triggerCondition: 'When a new driver is added to the system.',
      recipient: [
        {
          name: 'Admin',
          message:
            '[Driver Name] has been added to the system. Assign a route and vehicle as needed.',
          communicationChannel: ['Email'],
          placeHolder: {
            '[Driver Name]': 'Driver Name',
          },
          placeHolderOptions: [{ value: '[Driver Name]', label: 'Driver Name' }],
          isEnable: true,
        },
        {
          name: 'Driver',
          message:
            'Welcome [Driver Name] You have been registered in the system. Expect route assignments soon.',
          communicationChannel: ['Email'],
          placeHolder: {
            '[Driver Name]': 'Driver Name',
          },
          placeHolderOptions: [{ value: '[Driver Name]', label: 'Driver Name' }],
          isEnable: true,
        },
      ],
    },
    {
      event: 'New Vehicle Added',
      triggerCondition: 'When a new vehicle is added to the fleet.',
      recipient: [
        {
          name: 'Admin',
          message:
            'A new vehicle [Vehicle Number] has been added to the fleet. Assign it to a driver when necessary.',
          communicationChannel: ['Email'],
          placeHolder: {
            '[Vehicle Number]': 'Vehicle Number',
          },
          placeHolderOptions: [{ value: '[Vehicle Number]', label: 'Vehicle Number' }],
          isEnable: true,
        },
        {
          name: 'Driver',
          message: 'A new vehicle has been added. Check with the admin for assignments.',
          communicationChannel: ['Email'],
          placeHolder: {},
          placeHolderOptions: [],
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

export default TransportVehicleNotificationManagementScreen;
