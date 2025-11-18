import React, { useState } from 'react';
import { Box, Card, Switch } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import EditNotificationDialog from 'src/screens/student/studentNotification/editNotificationDialog';
import {
  NotificationStatusType,
  NotificationStatusOptions,
} from 'src/enums/notification-status-type';

const eventNotificationsData = [
  {
    id: '1',
    event: 'New Event Created',
    triggerCondition: 'When a new event is scheduled.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Admin',
        message: 'A new event "[Event Title]" has been scheduled.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Event Title]'],
        placeHolderOptions: [{ value: '[Event Title]', label: 'Event Title' }],
        isEnable: true,
      },
      {
        name: 'Staff',
        message: 'Event: "[Event Title]" has been added to the calendar.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Event Title]'],
        placeHolderOptions: [{ value: '[Event Title]', label: 'Event Title' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '2',
    event: 'Event Updated',
    triggerCondition: 'When an event is modified.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Admin',
        message: 'Event "[Event Title]" has been updated.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Event Title]'],
        placeHolderOptions: [{ value: '[Event Title]', label: 'Event Title' }],
        isEnable: true,
      },
      {
        name: 'Staff',
        message: 'Updated event: "[Event Title]"',
        communicationChannel: ['In-App'],
        placeHolder: ['[Event Title]'],
        placeHolderOptions: [{ value: '[Event Title]', label: 'Event Title' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '3',
    event: 'Event Cancelled',
    triggerCondition: 'When an event is cancelled.',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Admin',
        message: 'Event "[Event Title]" has been cancelled.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Event Title]'],
        placeHolderOptions: [{ value: '[Event Title]', label: 'Event Title' }],
        isEnable: true,
      },
      {
        name: 'Staff',
        message: 'Cancelled event: "[Event Title]"',
        communicationChannel: ['In-App'],
        placeHolder: ['[Event Title]'],
        placeHolderOptions: [{ value: '[Event Title]', label: 'Event Title' }],
        isEnable: true,
      },
    ],
  },
];

const EventNotification = ({ dialog, setIsViewMode }: any) => {
  const [selectedData, setSelectedData] = useState<any>(null);
  const [view, setView] = useState(false);
  const [notifications, setNotifications] = useState(eventNotificationsData);

  const handleToggleActive = (id: string, checked: boolean) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              isActive: checked ? NotificationStatusType.Active : NotificationStatusType.Inactive,
            }
          : notification
      )
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {dialog.value ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <EditNotificationDialog
            data={selectedData}
            onClose={() => {
              dialog.onFalse();
              setSelectedData(null);
            }}
            isFromView={view}
          />
        </Card>
      ) : (
        <CustomizableTable
          tableId="event-auto-notification-configuration"
          data={notifications}
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
                  <Box key={recipient.name}>{recipient.name.toUpperCase()}</Box>
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
                  <Switch
                    checked={NotificationStatusType.Active === row.isActive}
                    onChange={(event) => {
                      handleToggleActive(row.id, event.target.checked);
                    }}
                  />
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
                      dialog.onTrue();
                      setView(false);
                      setIsViewMode(false);
                    }}
                    showViewIcon
                    handleViewClick={() => {
                      setSelectedData(row);
                      setView(true);
                      dialog.onTrue();
                      setIsViewMode(true);
                    }}
                  />
                );
              },
            },
          ]}
        />
      )}
    </Box>
  );
};

export default EventNotification;
