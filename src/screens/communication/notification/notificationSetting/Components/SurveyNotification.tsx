import React, { useState } from 'react';
import { Box, Card, Switch } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import EditNotificationDialog from 'src/screens/student/studentNotification/editNotificationDialog';
import {
  NotificationStatusType,
  NotificationStatusOptions,
} from 'src/enums/notification-status-type';

const surveyNotificationsData = [
  {
    id: '1',
    event: 'New Survey Created',
    triggerCondition: 'When a new survey is published.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Admin',
        message: 'A new survey "[Survey Title]" has been published.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Survey Title]'],
        placeHolderOptions: [{ value: '[Survey Title]', label: 'Survey Title' }],
        isEnable: true,
      },
      {
        name: 'Staff',
        message: 'Survey: "[Survey Title]" is now available.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Survey Title]'],
        placeHolderOptions: [{ value: '[Survey Title]', label: 'Survey Title' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '2',
    event: 'Survey Updated',
    triggerCondition: 'When an existing survey is modified.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Admin',
        message: 'Survey "[Survey Title]" has been updated.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Survey Title]'],
        placeHolderOptions: [{ value: '[Survey Title]', label: 'Survey Title' }],
        isEnable: true,
      },
      {
        name: 'Staff',
        message: 'Updated survey: "[Survey Title]"',
        communicationChannel: ['In-App'],
        placeHolder: ['[Survey Title]'],
        placeHolderOptions: [{ value: '[Survey Title]', label: 'Survey Title' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '3',
    event: 'Survey Closed',
    triggerCondition: 'When a survey is closed.',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Admin',
        message: 'Survey "[Survey Title]" has been closed.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Survey Title]'],
        placeHolderOptions: [{ value: '[Survey Title]', label: 'Survey Title' }],
        isEnable: true,
      },
      {
        name: 'Staff',
        message: 'Closed survey: "[Survey Title]"',
        communicationChannel: ['In-App'],
        placeHolder: ['[Survey Title]'],
        placeHolderOptions: [{ value: '[Survey Title]', label: 'Survey Title' }],
        isEnable: true,
      },
    ],
  },
];

const SurveyNotification = ({ dialog, setIsViewMode }: any) => {
  const [selectedData, setSelectedData] = useState<any>(null);
  const [view, setView] = useState(false);
  const [notifications, setNotifications] = useState(surveyNotificationsData);

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
          tableId="survey-auto-notification-configuration"
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

export default SurveyNotification;
