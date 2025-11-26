import React, { useState } from 'react';
import { Box, Card, Switch } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import EditNotificationDialog from 'src/screens/student/studentNotification/editNotificationDialog';
import {
  NotificationStatusType,
  NotificationStatusOptions,
} from 'src/enums/notification-status-type';

export const reconciliationNotificationsData = [
  {
    id: '1',
    event: 'Payment Approved',
    triggerCondition: 'When the reconciliation entry is approved.',
    recipient: [
      {
        name: 'Student/Parent',
        message:
          'Your payment has been approved during reconciliation. Receipt for [Student Name] is now verified.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: 'A reconciliation payment for [Student Name] has been approved.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '2',
    event: 'Payment Rejected',
    triggerCondition: 'When the reconciliation entry is rejected.',
    recipient: [
      {
        name: 'Student/Parent',
        message:
          'Your payment entry during reconciliation has been rejected. Please contact the school office.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: [],
        placeHolderOptions: [],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: 'A reconciliation payment entry for [Student Name] has been rejected.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
    ],
  },
];

const ReconciliationNotificationManagement = ({ dialog, setIsViewMode }: any) => {
  const [selectedData, setSelectedData] = useState<any>(null);
  const [view, setView] = useState(false);

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
          tableId="reconciliation-auto-notification-configuration"
          data={reconciliationNotificationsData}
          columns={[
            { id: 'event', label: 'Event' },
            { id: 'triggerCondition', label: 'Trigger Condition' },
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
                    onChange={(event) => {}}
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

export default ReconciliationNotificationManagement;
