'use client';

import React, { useState } from 'react';
import { Box, Card, Switch } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import EditNotificationDialog from 'src/screens/student/student-notification/editNotificationDialog';

const HrEventHolidayNotificationManagementScreen = () => {
  const notificationData = [
    {
      id: 10,
      event: 'Add New Event/Holiday',
      triggerCondition: 'When a new event/holiday is added to the calendar.',
      recipient: [
        {
          name: 'All Employees',
          message:
            'A new event/holiday [Event Name] has been added on [Date]. Check the calendar for details.',
          communicationChannel: ['Email'],
          placeHolder: ['[Event Name]', '[Date]'],
          placeHolderOptions: [
            { value: '[Event Name]', label: 'Event Name' },
            { value: '[Date]', label: 'Event Date' },
            // { value: "[Modified/Deleted]", label: "Modification Type" }
          ],
          isEnable: true,
        },
      ],
    },

    {
      id: 11,
      event: 'Modify or Delete Event/Holiday',
      triggerCondition: 'When an event/holiday is modified or removed.',
      recipient: [
        {
          name: 'All Employees',
          message:
            'An event/holiday [Event Name] on [Date] has been [Modified/Deleted]. Please check updates.',
          communicationChannel: ['Email'],
          placeHolder: ['[Event Name]', '[Date]', '[Modified/Deleted]'],
          placeHolderOptions: [
            { value: '[Event Name]', label: 'Event Name' },
            { value: '[Date]', label: 'Event Date' },
            { value: '[Modified/Deleted]', label: 'Modification Type' },
          ],
          isEnable: true,
        },
      ],
    },
    {
      id: 13,
      event: 'Event/Holiday Request Declined',
      triggerCondition: 'When a requested event/holiday is declined.',
      recipient: [
        {
          name: 'Requesting Employee',
          message:
            'Your event/holiday request for [Date] has been declined. Please check with HR for details.',
          communicationChannel: ['Email'],
          placeHolder: ['[Date]'],
          placeHolderOptions: [{ value: '[Date]', label: 'Event/Holiday Date' }],
          isEnable: true,
        },
      ],
    },
    {
      id: 15,
      event: 'Event/Holiday Request Approved',
      triggerCondition: 'When a requested event/holiday is approved.',
      recipient: [
        {
          name: 'Requesting Employee',
          message: 'Your event/holiday request for [Date] has been approved.',
          communicationChannel: ['Email'],
          placeHolder: ['[Date]'],
          placeHolderOptions: [{ value: '[Date]', label: 'Event/Holiday Date' }],
          isEnable: true,
        },
      ],
    },

    {
      id: 14,
      event: 'Submit Leave Request',
      triggerCondition: 'When an employee submits a leave request.',
      recipient: [
        {
          name: 'Admin',
          message: '[Employee Name] has submitted a leave request for [Date]. Please review.',
          communicationChannel: ['Email'],
          placeHolder: ['[Employee Name]', '[Date]'],
          placeHolderOptions: [
            { value: '[Employee Name]', label: 'Employee Name' },
            { value: '[Date]', label: 'Leave Date' },
          ],
          isEnable: true,
        },
        {
          name: 'HR',
          message: '[Employee Name] has submitted a leave request for [Date]. Please review.',
          communicationChannel: ['Email'],
          placeHolder: ['[Employee Name]', '[Date]'],
          placeHolderOptions: [
            { value: '[Employee Name]', label: 'Employee Name' },
            { value: '[Date]', label: 'Leave Date' },
          ],
          isEnable: true,
        },
        {
          name: 'Reporting Manager',
          message: '[Employee Name] has submitted a leave request for [Date]. Please review.',
          communicationChannel: ['Email'],
          placeHolder: ['[Employee Name]', '[Date]'],
          placeHolderOptions: [
            { value: '[Employee Name]', label: 'Employee Name' },
            { value: '[Date]', label: 'Leave Date' },
          ],
          isEnable: true,
        },
        {
          name: 'Employee',
          message: 'Your leave request for [Date] has been submitted successfully.',
          communicationChannel: ['Email'],
          placeHolder: ['[Date]'],
          placeHolderOptions: [{ value: '[Date]', label: 'Leave Date' }],
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
                    <Switch checked={row.isActive} onChange={(event) => {}} />
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

export default HrEventHolidayNotificationManagementScreen;
