import type { IColumn } from 'src/components/customizable-table/types';

import React, { useMemo, useState } from 'react';
import { Box, Card, Switch } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import EditNotificationDialog from 'src/screens/student/student-notification/editNotificationDialog';
import {
  NotificationStatusType,
  NotificationStatusOptions,
} from 'src/enums/notification-status-type';

import { EVENT_NOTIFICATIONS_DATA } from '../constants';

import type {
  INotificationData,
  INotificationRecipient,
  INotificationComponentProps,
} from '../types';

const EventNotification = ({ dialog, setIsViewMode }: INotificationComponentProps) => {
  const [selectedData, setSelectedData] = useState<INotificationData | null>(null);
  const [view, setView] = useState(false);
  const [notifications, setNotifications] = useState<INotificationData[]>(EVENT_NOTIFICATIONS_DATA);

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

  /**
   * Memoization Justification:
   * Columns configuration involves stable callbacks and JSX, but dependencies like 'dialog'
   * and 'setIsViewMode' change. Using useMemo ensures columns are strictly referentially stable
   * unless these dependencies change, avoiding unnecessary table re-renders.
   */
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
          return row.recipient.map((recipient: INotificationRecipient) => (
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
                setSelectedData(row as INotificationData);
                dialog.onTrue();
                setView(false);
                setIsViewMode(false);
              }}
              showViewIcon
              handleViewClick={() => {
                setSelectedData(row as INotificationData);
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {dialog.value ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <EditNotificationDialog
            data={
              selectedData
                ? {
                    ...selectedData,
                    communicationChannel: Array.from(
                      new Set(selectedData.recipient.flatMap((r) => r.communicationChannel))
                    ),
                  }
                : null
            }
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
          columns={columns}
        />
      )}
    </Box>
  );
};

export default EventNotification;
