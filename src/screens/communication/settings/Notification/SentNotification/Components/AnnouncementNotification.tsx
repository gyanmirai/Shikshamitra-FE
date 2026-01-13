import type { IColumn } from 'src/components/customizabaleTable/type';

import React, { useMemo, useState } from 'react';
import { Box, Card, Switch } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import EditNotificationDialog from 'src/screens/student/studentNotification/editNotificationDialog';
import {
  NotificationStatusType,
  NotificationStatusOptions,
} from 'src/enums/notification-status-type';

const announcementNotificationsData = [
  {
    id: '1',
    event: 'New Announcement',
    triggerCondition: 'When a new announcement is published.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Admin',
        message: 'A new announcement "[Announcement Title]" has been published.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Announcement Title]'],
        placeHolderOptions: [{ value: '[Announcement Title]', label: 'Announcement Title' }],
        isEnable: true,
      },
      {
        name: 'Staff',
        message: 'Announcement: "[Announcement Title]"',
        communicationChannel: ['In-App'],
        placeHolder: ['[Announcement Title]'],
        placeHolderOptions: [{ value: '[Announcement Title]', label: 'Announcement Title' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '2',
    event: 'Announcement Updated',
    triggerCondition: 'When an existing announcement is modified.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Admin',
        message: 'Announcement "[Announcement Title]" has been updated.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Announcement Title]'],
        placeHolderOptions: [{ value: '[Announcement Title]', label: 'Announcement Title' }],
        isEnable: true,
      },
      {
        name: 'Staff',
        message: 'Updated announcement: "[Announcement Title]"',
        communicationChannel: ['In-App'],
        placeHolder: ['[Announcement Title]'],
        placeHolderOptions: [{ value: '[Announcement Title]', label: 'Announcement Title' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '3',
    event: 'Announcement Deleted',
    triggerCondition: 'When an announcement is deleted.',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Admin',
        message: 'Announcement "[Announcement Title]" has been deleted.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Announcement Title]'],
        placeHolderOptions: [{ value: '[Announcement Title]', label: 'Announcement Title' }],
        isEnable: true,
      },
    ],
  },
];

const AnnouncementNotification = ({ dialog, setIsViewMode }: any) => {
  const [selectedData, setSelectedData] = useState<any>(null);
  const [view, setView] = useState(false);
  const [notifications, setNotifications] = useState(announcementNotificationsData);

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

  const columns: IColumn[] = useMemo(
    () => [
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
    ],
    [dialog, setIsViewMode]
  );

  return (
    <Box sx={{ height: '100%' }}>
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
          tableId="announcement-auto-notification-configuration"
          data={notifications}
          columns={columns}
        />
      )}
    </Box>
  );
};

export default AnnouncementNotification;
