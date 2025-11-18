import React, { useState } from 'react';
import { Box, Card, Switch } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import EditNotificationDialog from 'src/screens/student/studentNotification/editNotificationDialog';
import {
  NotificationStatusType,
  NotificationStatusOptions,
} from 'src/enums/notification-status-type';

export const transactionNotificationsData = [
  {
    id: '1',
    event: 'Book Issued',
    triggerCondition: 'When a book is successfully issued to a member.',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Member',
        message:
          'You have successfully borrowed "[Book Title]". Due date: [Due Date]. Please return on time to avoid fines.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Book Title]', '[Due Date]'],
        placeHolderOptions: [
          { value: '[Book Title]', label: 'Book Title' },
          { value: '[Due Date]', label: 'Due Date' },
        ],
        isEnable: true,
      },
      {
        name: 'Librarian',
        message: 'Book issued: "[Book Title]" to [Member Name] - Due: [Due Date]',
        communicationChannel: ['In-App'],
        placeHolder: ['[Book Title]', '[Member Name]', '[Due Date]'],
        placeHolderOptions: [
          { value: '[Book Title]', label: 'Book Title' },
          { value: '[Member Name]', label: 'Member Name' },
          { value: '[Due Date]', label: 'Due Date' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '2',
    event: 'Book Return Due Reminder',
    triggerCondition: 'When a book return is due within 2 days.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Member',
        message:
          'Reminder: "[Book Title]" is due for return on [Due Date]. Please return to avoid late fees.',
        communicationChannel: ['In-App', 'Email', 'SMS'],
        placeHolder: ['[Book Title]', '[Due Date]'],
        placeHolderOptions: [
          { value: '[Book Title]', label: 'Book Title' },
          { value: '[Due Date]', label: 'Due Date' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '3',
    event: 'Book Overdue',
    triggerCondition: 'When a book is not returned by the due date.',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Member',
        message:
          'Overdue notice: "[Book Title]" was due on [Due Date]. Please return immediately. Fine: [Fine Amount] per day.',
        communicationChannel: ['In-App', 'Email', 'SMS'],
        placeHolder: ['[Book Title]', '[Due Date]', '[Fine Amount]'],
        placeHolderOptions: [
          { value: '[Book Title]', label: 'Book Title' },
          { value: '[Due Date]', label: 'Due Date' },
          { value: '[Fine Amount]', label: 'Fine Amount' },
        ],
        isEnable: true,
      },
      {
        name: 'Librarian',
        message:
          'Overdue book: "[Book Title]" by [Member Name]. Due: [Due Date]. Days overdue: [Overdue Days]',
        communicationChannel: ['In-App'],
        placeHolder: ['[Book Title]', '[Member Name]', '[Due Date]', '[Overdue Days]'],
        placeHolderOptions: [
          { value: '[Book Title]', label: 'Book Title' },
          { value: '[Member Name]', label: 'Member Name' },
          { value: '[Due Date]', label: 'Due Date' },
          { value: '[Overdue Days]', label: 'Overdue Days' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '4',
    event: 'Book Returned',
    triggerCondition: 'When a book is successfully returned by a member.',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Member',
        message: 'Thank you for returning "[Book Title]". Your account has been updated.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Book Title]'],
        placeHolderOptions: [{ value: '[Book Title]', label: 'Book Title' }],
        isEnable: true,
      },
      {
        name: 'Librarian',
        message: 'Book returned: "[Book Title]" by [Member Name] - Return Date: [Return Date]',
        communicationChannel: ['In-App'],
        placeHolder: ['[Book Title]', '[Member Name]', '[Return Date]'],
        placeHolderOptions: [
          { value: '[Book Title]', label: 'Book Title' },
          { value: '[Member Name]', label: 'Member Name' },
          { value: '[Return Date]', label: 'Return Date' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '5',
    event: 'Book Returned with Fine',
    triggerCondition: 'When a book is returned late and fines are applied.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Member',
        message:
          'Book "[Book Title]" returned late. Fine amount: [Fine Amount]. Please pay at the library desk.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Book Title]', '[Fine Amount]'],
        placeHolderOptions: [
          { value: '[Book Title]', label: 'Book Title' },
          { value: '[Fine Amount]', label: 'Fine Amount' },
        ],
        isEnable: true,
      },
      {
        name: 'Librarian',
        message: 'Late return: "[Book Title]" by [Member Name] - Fine: [Fine Amount]',
        communicationChannel: ['In-App'],
        placeHolder: ['[Book Title]', '[Member Name]', '[Fine Amount]'],
        placeHolderOptions: [
          { value: '[Book Title]', label: 'Book Title' },
          { value: '[Member Name]', label: 'Member Name' },
          { value: '[Fine Amount]', label: 'Fine Amount' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '6',
    event: 'Book Reservation Confirmed',
    triggerCondition: 'When a member successfully reserves a book that is currently unavailable.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Member',
        message:
          'Your reservation for "[Book Title]" has been confirmed. You will be notified when it becomes available.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Book Title]'],
        placeHolderOptions: [{ value: '[Book Title]', label: 'Book Title' }],
        isEnable: true,
      },
      {
        name: 'Librarian',
        message: 'Book reserved: "[Book Title]" by [Member Name]',
        communicationChannel: ['In-App'],
        placeHolder: ['[Book Title]', '[Member Name]'],
        placeHolderOptions: [
          { value: '[Book Title]', label: 'Book Title' },
          { value: '[Member Name]', label: 'Member Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '7',
    event: 'Reserved Book Available',
    triggerCondition: 'When a reserved book becomes available for collection.',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Member',
        message:
          'Good news! "[Book Title]" is now available for collection. Please collect within 2 days or your reservation will be cancelled.',
        communicationChannel: ['In-App', 'Email', 'SMS'],
        placeHolder: ['[Book Title]'],
        placeHolderOptions: [{ value: '[Book Title]', label: 'Book Title' }],
        isEnable: true,
      },
      {
        name: 'Librarian',
        message: 'Reserved book ready: "[Book Title]" for [Member Name]',
        communicationChannel: ['In-App'],
        placeHolder: ['[Book Title]', '[Member Name]'],
        placeHolderOptions: [
          { value: '[Book Title]', label: 'Book Title' },
          { value: '[Member Name]', label: 'Member Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '8',
    event: 'Reservation Cancelled',
    triggerCondition: 'When a book reservation is cancelled by the member or system.',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Member',
        message: 'Your reservation for "[Book Title]" has been cancelled.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Book Title]'],
        placeHolderOptions: [{ value: '[Book Title]', label: 'Book Title' }],
        isEnable: true,
      },
      {
        name: 'Librarian',
        message:
          'Reservation cancelled: "[Book Title]" by [Member Name] - Reason: [Cancellation Reason]',
        communicationChannel: ['In-App'],
        placeHolder: ['[Book Title]', '[Member Name]', '[Cancellation Reason]'],
        placeHolderOptions: [
          { value: '[Book Title]', label: 'Book Title' },
          { value: '[Member Name]', label: 'Member Name' },
          { value: '[Cancellation Reason]', label: 'Cancellation Reason' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '9',
    event: 'Book Renewal Successful',
    triggerCondition: 'When a member successfully renews a borrowed book.',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Member',
        message: 'Book "[Book Title]" renewed successfully. New due date: [New Due Date]',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Book Title]', '[New Due Date]'],
        placeHolderOptions: [
          { value: '[Book Title]', label: 'Book Title' },
          { value: '[New Due Date]', label: 'New Due Date' },
        ],
        isEnable: true,
      },
      {
        name: 'Librarian',
        message: 'Book renewed: "[Book Title]" by [Member Name] - New due date: [New Due Date]',
        communicationChannel: ['In-App'],
        placeHolder: ['[Book Title]', '[Member Name]', '[New Due Date]'],
        placeHolderOptions: [
          { value: '[Book Title]', label: 'Book Title' },
          { value: '[Member Name]', label: 'Member Name' },
          { value: '[New Due Date]', label: 'New Due Date' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '10',
    event: 'Book Renewal Denied',
    triggerCondition:
      'When a renewal request is denied (max renewals reached or book reserved by others).',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Member',
        message:
          'Renewal denied for "[Book Title]". Reason: [Denial Reason]. Please return by [Due Date].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Book Title]', '[Denial Reason]', '[Due Date]'],
        placeHolderOptions: [
          { value: '[Book Title]', label: 'Book Title' },
          { value: '[Denial Reason]', label: 'Denial Reason' },
          { value: '[Due Date]', label: 'Due Date' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '11',
    event: 'Book Lost/Damaged Report',
    triggerCondition: 'When a member reports a book as lost or damaged.',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Librarian',
        message: 'Book reported: "[Book Title]" - Status: [Status] - Member: [Member Name]',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Book Title]', '[Status]', '[Member Name]'],
        placeHolderOptions: [
          { value: '[Book Title]', label: 'Book Title' },
          { value: '[Status]', label: 'Status' },
          { value: '[Member Name]', label: 'Member Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: 'Book [Status]: "[Book Title]" by [Member Name]. Penalty: [Penalty Amount]',
        communicationChannel: ['In-App'],
        placeHolder: ['[Status]', '[Book Title]', '[Member Name]', '[Penalty Amount]'],
        placeHolderOptions: [
          { value: '[Status]', label: 'Status' },
          { value: '[Book Title]', label: 'Book Title' },
          { value: '[Member Name]', label: 'Member Name' },
          { value: '[Penalty Amount]', label: 'Penalty Amount' },
        ],
        isEnable: true,
      },
      {
        name: 'Member',
        message: 'Your report for "[Book Title]" has been received. Penalty: [Penalty Amount]',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Book Title]', '[Penalty Amount]'],
        placeHolderOptions: [
          { value: '[Book Title]', label: 'Book Title' },
          { value: '[Penalty Amount]', label: 'Penalty Amount' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '12',
    event: 'Bulk Issue Completed',
    triggerCondition: 'When multiple books are issued to a member in a single transaction.',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Member',
        message: 'You have borrowed [Book Count] books. Please check your account for due dates.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Book Count]'],
        placeHolderOptions: [{ value: '[Book Count]', label: 'Book Count' }],
        isEnable: true,
      },
      {
        name: 'Librarian',
        message: 'Bulk issue: [Book Count] books issued to [Member Name]',
        communicationChannel: ['In-App'],
        placeHolder: ['[Book Count]', '[Member Name]'],
        placeHolderOptions: [
          { value: '[Book Count]', label: 'Book Count' },
          { value: '[Member Name]', label: 'Member Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '13',
    event: 'Transaction Cancelled',
    triggerCondition: 'When a book issue/return transaction is cancelled.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Librarian',
        message:
          'Transaction cancelled: [Transaction Type] for "[Book Title]" - Member: [Member Name]',
        communicationChannel: ['In-App'],
        placeHolder: ['[Transaction Type]', '[Book Title]', '[Member Name]'],
        placeHolderOptions: [
          { value: '[Transaction Type]', label: 'Transaction Type' },
          { value: '[Book Title]', label: 'Book Title' },
          { value: '[Member Name]', label: 'Member Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: 'Transaction [Transaction Type] cancelled by [Cancelled By] for [Member Name]',
        communicationChannel: ['In-App'],
        placeHolder: ['[Transaction Type]', '[Cancelled By]', '[Member Name]'],
        placeHolderOptions: [
          { value: '[Transaction Type]', label: 'Transaction Type' },
          { value: '[Cancelled By]', label: 'Cancelled By' },
          { value: '[Member Name]', label: 'Member Name' },
        ],
        isEnable: true,
      },
    ],
  },
];

const TransactionNotificationManagement = ({ dialog, setIsViewMode }: any) => {
  const [selectedData, setSelectedData] = useState<any>(null);
  const [view, setView] = useState(false);
  const [notifications, setNotifications] = useState(transactionNotificationsData);

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
          tableId="transaction-auto-notification-configuration"
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

export default TransactionNotificationManagement;
