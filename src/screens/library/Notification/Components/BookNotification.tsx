import React, { useState } from 'react';
import { Box, Switch } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import EditNotificationDialog from 'src/screens/student/student-notification/editNotificationDialog';
import {
  NotificationStatusType,
  NotificationStatusOptions,
} from 'src/enums/notification-status-type';

export const bookNotificationsData = [
  {
    id: '1',
    event: 'New Book Added',
    triggerCondition: 'When a new book is added to the library inventory.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Admin',
        message: 'A new book "[Book Title]" by [Author Name] has been added to the library.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Book Title]', '[Author Name]'],
        placeHolderOptions: [
          { value: '[Book Title]', label: 'Book Title' },
          { value: '[Author Name]', label: 'Author Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Librarian',
        message: 'New book added: "[Book Title]" - ISBN: [ISBN Number]',
        communicationChannel: ['In-App'],
        placeHolder: ['[Book Title]', '[ISBN Number]'],
        placeHolderOptions: [
          { value: '[Book Title]', label: 'Book Title' },
          { value: '[ISBN Number]', label: 'ISBN Number' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '2',
    event: 'Book Updated',
    triggerCondition: 'When book details (title, author, category, etc.) are modified.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Librarian',
        message: 'Book details updated: "[Book Title]" - Changes: [Changed Fields]',
        communicationChannel: ['In-App'],
        placeHolder: ['[Book Title]', '[Changed Fields]'],
        placeHolderOptions: [
          { value: '[Book Title]', label: 'Book Title' },
          { value: '[Changed Fields]', label: 'Changed Fields' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: 'Book information modified: "[Book Title]" by [Updated By]',
        communicationChannel: ['In-App'],
        placeHolder: ['[Book Title]', '[Updated By]'],
        placeHolderOptions: [
          { value: '[Book Title]', label: 'Book Title' },
          { value: '[Updated By]', label: 'Updated By' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '3',
    event: 'Book Stock Low',
    triggerCondition:
      'When book quantity falls below minimum threshold (e.g., less than 3 copies).',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Librarian',
        message:
          'Stock alert: "[Book Title]" has only [Quantity] copies remaining. Consider reordering.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Book Title]', '[Quantity]'],
        placeHolderOptions: [
          { value: '[Book Title]', label: 'Book Title' },
          { value: '[Quantity]', label: 'Quantity' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: 'Low stock warning: "[Book Title]" needs immediate attention.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Book Title]'],
        placeHolderOptions: [{ value: '[Book Title]', label: 'Book Title' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '4',
    event: 'Book Out of Stock',
    triggerCondition: 'When all copies of a book are currently issued and none available.',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Librarian',
        message: 'Out of stock: "[Book Title]" - All copies are currently issued.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Book Title]'],
        placeHolderOptions: [{ value: '[Book Title]', label: 'Book Title' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '5',
    event: 'Book Deleted/Removed',
    triggerCondition: 'When a book is permanently removed from the library system.',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Admin',
        message:
          'Book "[Book Title]" by [Author Name] has been removed from the library inventory.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Book Title]', '[Author Name]'],
        placeHolderOptions: [
          { value: '[Book Title]', label: 'Book Title' },
          { value: '[Author Name]', label: 'Author Name' },
        ],
        isEnable: true,
      },
      {
        name: 'Librarian',
        message: 'Book deletion confirmed: "[Book Title]" - ISBN: [ISBN Number]',
        communicationChannel: ['In-App'],
        placeHolder: ['[Book Title]', '[ISBN Number]'],
        placeHolderOptions: [
          { value: '[Book Title]', label: 'Book Title' },
          { value: '[ISBN Number]', label: 'ISBN Number' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '6',
    event: 'Book Status Changed',
    triggerCondition: 'When book status changes (Available → Lost/Damaged or vice versa).',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Librarian',
        message: 'Book status changed: "[Book Title]" - New Status: [New Status]',
        communicationChannel: ['In-App'],
        placeHolder: ['[Book Title]', '[New Status]'],
        placeHolderOptions: [
          { value: '[Book Title]', label: 'Book Title' },
          { value: '[New Status]', label: 'New Status' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: 'Book "[Book Title]" marked as [New Status] by [Updated By]',
        communicationChannel: ['In-App'],
        placeHolder: ['[Book Title]', '[New Status]', '[Updated By]'],
        placeHolderOptions: [
          { value: '[Book Title]', label: 'Book Title' },
          { value: '[New Status]', label: 'New Status' },
          { value: '[Updated By]', label: 'Updated By' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '7',
    event: 'New Book Category Created',
    triggerCondition: 'When a new book category/genre is added to the system.',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Librarian',
        message: 'New book category created: [Category Name]',
        communicationChannel: ['In-App'],
        placeHolder: ['[Category Name]'],
        placeHolderOptions: [{ value: '[Category Name]', label: 'Category Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '8',
    event: 'Book Reservation Available',
    triggerCondition:
      'When a previously unavailable book becomes available for members who reserved it.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Member',
        message:
          'Good news! "[Book Title]" is now available. Please collect within 2 days or your reservation will be cancelled.',
        communicationChannel: ['In-App', 'Email', 'SMS'],
        placeHolder: ['[Book Title]'],
        placeHolderOptions: [{ value: '[Book Title]', label: 'Book Title' }],
        isEnable: true,
      },
    ],
  },
];

const BookNotificationManagement = ({ dialog, setIsViewMode }: any) => {
  const [selectedData, setSelectedData] = useState<any>(null);
  const [view, setView] = useState(false);

  const [notifications, setNotifications] = useState(bookNotificationsData);

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
        <EditNotificationDialog
          data={selectedData}
          onClose={() => {
            dialog.onFalse();
            setSelectedData(null);
          }}
          isFromView={view}
        />
      ) : (
        <CustomizableTable
          tableId="book-auto-notification-configuration"
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

export default BookNotificationManagement;
