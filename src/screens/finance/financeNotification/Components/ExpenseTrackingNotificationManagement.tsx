import React, { useState } from 'react';
import { Box, Card, Switch } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import EditNotificationDialog from 'src/screens/student/studentNotification/editNotificationDialog';
import {
  NotificationStatusType,
  NotificationStatusOptions,
} from 'src/enums/notification-status-type';

export const expenseTrackingNotificationsData = [
  {
    id: '6',
    event: 'New expense recorded',
    triggerCondition:
      'An expense is added under a category (festival, event, maintenance, repair, etc.).',
    recipient: [
      {
        name: 'Accountant',
        message: 'A new expense of [Amount] has been recorded under [Category].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Amount]', '[Category]'],
        placeHolderOptions: [
          { value: '[Amount]', label: 'Amount' },
          { value: '[Category]', label: 'Category' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message:
          'A new expense entry has been recorded under [Category]. Please review if required.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Category]'],
        placeHolderOptions: [{ value: '[Category]', label: 'Category' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '7',
    event: 'Expense updated',
    triggerCondition: 'Expense amount, vendor, receipt, or category is updated.',
    recipient: [
      {
        name: 'Accountant',
        message: 'An expense entry under [Category] has been updated. New Amount: [Amount].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Category]', '[Amount]'],
        placeHolderOptions: [
          { value: '[Category]', label: 'Category' },
          { value: '[Amount]', label: 'Amount' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '8',
    event: 'Expense deleted',
    triggerCondition: 'An expense record has been removed from the system.',
    recipient: [
      {
        name: 'Finance Admin',
        message: 'An expense entry under [Category] for [Amount] has been deleted.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Category]', '[Amount]'],
        placeHolderOptions: [
          { value: '[Category]', label: 'Category' },
          { value: '[Amount]', label: 'Amount' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '9',
    event: 'Expense exceeds limit',
    triggerCondition: 'An expense goes above the approved budget limit.',
    recipient: [
      {
        name: 'Principal',
        message:
          'Expense under [Category] has exceeded the approved limit. Recorded Amount: [Amount].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Category]', '[Amount]'],
        placeHolderOptions: [
          { value: '[Category]', label: 'Category' },
          { value: '[Amount]', label: 'Amount' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: 'Alert! An expense under [Category] has crossed the approved limit.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Category]'],
        placeHolderOptions: [{ value: '[Category]', label: 'Category' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '10',
    event: 'Expense category created/updated',
    triggerCondition: 'A new expense category is created or an existing category is updated.',
    recipient: [
      {
        name: 'Admin',
        message: 'Expense category “[Category]” has been created or updated.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Category]'],
        placeHolderOptions: [{ value: '[Category]', label: 'Category Name' }],
        isEnable: true,
      },
      {
        name: 'Accountant',
        message: 'Expense category “[Category]” is now added or updated in the system.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Category]'],
        placeHolderOptions: [{ value: '[Category]', label: 'Category Name' }],
        isEnable: true,
      },
    ],
  },
];

const ExpenseTrackingNotificationManagement = ({ dialog, setIsViewMode }: any) => {
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
          tableId="expense-tracking-auto-notification-configuration"
          data={expenseTrackingNotificationsData}
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

export default ExpenseTrackingNotificationManagement;
