import React, { useState } from 'react';
import { Box, Card, Switch } from '@mui/material';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import EditNotificationDialog from 'src/screens/student/studentNotification/editNotificationDialog';
import {
  NotificationStatusType,
  NotificationStatusOptions,
} from 'src/enums/notification-status-type';

export const incomeTrackingNotificationsData = [
  {
    id: '1',
    event: 'New income entry added',
    triggerCondition:
      'Any income is recorded (fees, donations, event income, transport income, etc.).',
    recipient: [
      {
        name: 'Accountant',
        message: 'A new income entry has been added under [Category] for [Amount] on [Date].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Category]', '[Amount]', '[Date]'],
        placeHolderOptions: [
          { value: '[Category]', label: 'Income Category' },
          { value: '[Amount]', label: 'Amount' },
          { value: '[Date]', label: 'Date' },
        ],
        isEnable: true,
      },
      {
        name: 'Finance Admin',
        message: 'A new income entry has been recorded under [Category] for [Amount].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Category]', '[Amount]'],
        placeHolderOptions: [
          { value: '[Category]', label: 'Income Category' },
          { value: '[Amount]', label: 'Amount' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '2',
    event: 'Income entry updated',
    triggerCondition: 'Income amount, category, or date is updated or modified.',
    recipient: [
      {
        name: 'Accountant',
        message: 'An income entry for [Category] has been updated. New Amount: [Amount].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Category]', '[Amount]'],
        placeHolderOptions: [
          { value: '[Category]', label: 'Income Category' },
          { value: '[Amount]', label: 'Amount' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '3',
    event: 'Income entry deleted',
    triggerCondition: 'An income entry is removed from the records.',
    recipient: [
      {
        name: 'Finance Admin',
        message: 'An income entry under [Category] for [Amount] has been deleted.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Category]', '[Amount]'],
        placeHolderOptions: [
          { value: '[Category]', label: 'Income Category' },
          { value: '[Amount]', label: 'Amount' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '4',
    event: 'Monthly income report generated',
    triggerCondition: 'A monthly account summary report has been generated.',
    recipient: [
      {
        name: 'Accountant',
        message: 'The monthly income report for [Month] has been generated successfully.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Month]'],
        placeHolderOptions: [{ value: '[Month]', label: 'Month' }],
        isEnable: true,
      },
      {
        name: 'Principal',
        message: 'Monthly income summary for [Month] is available for review.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Month]'],
        placeHolderOptions: [{ value: '[Month]', label: 'Month' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '5',
    event: 'Income category created/updated',
    triggerCondition: 'A new income category is created or an existing one is updated.',
    recipient: [
      {
        name: 'Admin',
        message: 'Income category “[Category]” has been created/updated.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Category]'],
        placeHolderOptions: [{ value: '[Category]', label: 'Category Name' }],
        isEnable: true,
      },
      {
        name: 'Accountant',
        message: 'Income category “[Category]” has been added/updated in the system.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Category]'],
        placeHolderOptions: [{ value: '[Category]', label: 'Category Name' }],
        isEnable: true,
      },
    ],
  },
];

const IncomeTrackingNotificationManagement = ({ dialog, setIsViewMode }: any) => {
  const [tableData, setTableData] = useState(incomeTrackingNotificationsData);
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
          getRowAction={(row) => ({
            label: `Open ${row.event || 'notification'}`,
            onClick: () => {
              setSelectedData(row);
              setView(true);
              dialog.onTrue();
              setIsViewMode(true);
            },
          })}
          tableId="income-tracking-auto-notification-configuration"
          data={tableData}
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
                    onChange={(event) => {
                      setTableData((prev: any) =>
                        prev.map((r: any) =>
                          r.id === row.id
                            ? {
                                ...r,
                                isActive: event.target.checked
                                  ? NotificationStatusType.Active
                                  : NotificationStatusType.Inactive,
                              }
                            : r
                        )
                      );
                    }}
                  />
                );
              },
            },
            {
              align: 'left',
              stickyPosition: 'right',
              excludeFromExport: true,
              id: 'action',
              label: 'Action',
              isFilter: false,
              isSort: false,
              sticky: true,
              minWidth: 60,
              render(value, row) {
                return (
                  <AdaptiveThreeDotsActions directActionLimit={3}
                    actions={[
                      {
                        id: 'edit',
                        label: 'Edit',
                        icon: 'solar:pen-bold',
                        onClick: () => {
                          setSelectedData(row);
                          dialog.onTrue();
                          setView(false);
                          setIsViewMode(false);
                        },
                      },
                    ]}
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

export default IncomeTrackingNotificationManagement;
