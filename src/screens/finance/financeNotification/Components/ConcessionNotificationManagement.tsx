import React, { useState } from 'react';
import { Box, Card, Switch } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import EditNotificationDialog from 'src/screens/student/studentNotification/editNotificationDialog';
import {
  NotificationStatusType,
  NotificationStatusOptions,
} from 'src/enums/notification-status-type';

export const concessionNotificationsData = [
  {
    id: '1',
    event: 'Concession requested',
    triggerCondition: 'When a teacher/accountant submits a concession request for a student.',
    recipient: [
      {
        name: 'Principal',
        message: 'A concession request has been submitted for [Student Name].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: 'A concession request for [Student Name] is awaiting your review.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
      {
        name: 'Student',
        message:
          'A concession request has been submitted on your behalf. The school will notify you once it is reviewed.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: [],
        placeHolderOptions: [],
        isEnable: true,
      },
      {
        name: 'Parent',
        message: 'A concession request for [Student Name] has been submitted and is under review.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '2',
    event: 'Concession request received',
    triggerCondition: 'Confirmation to the requester that the request is logged.',
    recipient: [
      {
        name: 'Requester',
        message:
          'Your concession request for [Student Name] has been received. You will be notified once reviewed.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '3',
    event: 'Concession approved',
    triggerCondition: 'Principal/Admin approves the concession (percentage or fixed amount).',
    recipient: [
      {
        name: 'Requester',
        message: 'Your concession request for [Student Name] has been approved.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
      {
        name: 'Accountant',
        message:
          'A concession has been approved for [Student Name]. Please update the fee records.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
      {
        name: 'Parent',
        message:
          'A concession has been approved for [Student Name]. Updated fee details are available.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '4',
    event: 'Concession rejected',
    triggerCondition: 'Principal/Admin rejects the concession request.',
    recipient: [
      {
        name: 'Requester',
        message: 'The concession request for [Student Name] has been rejected.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '6',
    event: 'Concession revoked (after approval)',
    triggerCondition: 'Approved concession is removed or cancelled by Principal/Admin.',
    recipient: [
      {
        name: 'Accountant',
        message: 'The previously approved concession for [Student Name] has been revoked.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
      {
        name: 'Parent',
        message: 'The concession for [Student Name] has been revoked by the school.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
      {
        name: 'Requester',
        message:
          'Your previously approved concession request for [Student Name] has been cancelled.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
    ],
  },
];

const ConcessionNotificationManagement = ({ dialog, setIsViewMode }: any) => {
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
          tableId="concession-auto-notification-configuration"
          data={concessionNotificationsData}
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
                    onChange={(event) => console.log(event.target.checked)}
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

export default ConcessionNotificationManagement;
