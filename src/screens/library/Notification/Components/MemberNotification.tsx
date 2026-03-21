import React, { useState } from 'react';
import { Box, Card, Switch } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import EditNotificationDialog from 'src/screens/student/student-notification/editNotificationDialog';
import {
  NotificationStatusType,
  NotificationStatusOptions,
} from 'src/enums/notification-status-type';

export const memberNotificationsData = [
  {
    id: '1',
    event: 'New Member Registered',
    triggerCondition: 'When a new member is registered in the library system.',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Librarian',
        message: 'New library member registered: [Member Name] - ID: [Member ID]',
        communicationChannel: ['In-App'],
        placeHolder: ['[Member Name]', '[Member ID]'],
        placeHolderOptions: [
          { value: '[Member Name]', label: 'Member Name' },
          { value: '[Member ID]', label: 'Member ID' },
        ],
        isEnable: true,
      },
      {
        name: 'Member',
        message:
          'Welcome to the library! Your membership ID is [Member ID]. You can now borrow books.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Member ID]'],
        placeHolderOptions: [{ value: '[Member ID]', label: 'Member ID' }],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: 'New member registration: [Member Name] - Type: [Member Type]',
        communicationChannel: ['In-App'],
        placeHolder: ['[Member Name]', '[Member Type]'],
        placeHolderOptions: [
          { value: '[Member Name]', label: 'Member Name' },
          { value: '[Member Type]', label: 'Member Type' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '2',
    event: 'Member Profile Updated',
    triggerCondition: "When a member's profile information is modified.",
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Member',
        message: 'Your library profile has been updated successfully.',
        communicationChannel: ['In-App'],
        placeHolder: [],
        placeHolderOptions: [],
        isEnable: true,
      },
      {
        name: 'Librarian',
        message: 'Member profile updated: [Member Name] - Updated by: [Updated By]',
        communicationChannel: ['In-App'],
        placeHolder: ['[Member Name]', '[Updated By]'],
        placeHolderOptions: [
          { value: '[Member Name]', label: 'Member Name' },
          { value: '[Updated By]', label: 'Updated By' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '3',
    event: 'Membership Expiring Soon',
    triggerCondition: "When a member's library membership is expiring within 7 days.",
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Member',
        message:
          'Your library membership expires on [Expiry Date]. Please renew to continue access.',
        communicationChannel: ['In-App', 'Email', 'SMS'],
        placeHolder: ['[Expiry Date]'],
        placeHolderOptions: [{ value: '[Expiry Date]', label: 'Expiry Date' }],
        isEnable: true,
      },
      {
        name: 'Librarian',
        message: 'Membership expiring: [Member Name] - Expiry Date: [Expiry Date]',
        communicationChannel: ['In-App'],
        placeHolder: ['[Member Name]', '[Expiry Date]'],
        placeHolderOptions: [
          { value: '[Member Name]', label: 'Member Name' },
          { value: '[Expiry Date]', label: 'Expiry Date' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '4',
    event: 'Membership Expired',
    triggerCondition: "When a member's library membership has expired.",
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Member',
        message: 'Your library membership has expired. Please renew to continue borrowing books.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: [],
        placeHolderOptions: [],
        isEnable: true,
      },
      {
        name: 'Librarian',
        message: 'Membership expired: [Member Name] - ID: [Member ID]',
        communicationChannel: ['In-App'],
        placeHolder: ['[Member Name]', '[Member ID]'],
        placeHolderOptions: [
          { value: '[Member Name]', label: 'Member Name' },
          { value: '[Member ID]', label: 'Member ID' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '5',
    event: 'Membership Renewed',
    triggerCondition: "When a member's library membership is successfully renewed.",
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Member',
        message: 'Your library membership has been renewed. New expiry date: [New Expiry Date]',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[New Expiry Date]'],
        placeHolderOptions: [{ value: '[New Expiry Date]', label: 'New Expiry Date' }],
        isEnable: true,
      },
      {
        name: 'Librarian',
        message: 'Membership renewed: [Member Name] - Valid until: [New Expiry Date]',
        communicationChannel: ['In-App'],
        placeHolder: ['[Member Name]', '[New Expiry Date]'],
        placeHolderOptions: [
          { value: '[Member Name]', label: 'Member Name' },
          { value: '[New Expiry Date]', label: 'New Expiry Date' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '6',
    event: 'Membership Suspended',
    triggerCondition: "When a member's account is suspended due to violations or unpaid fines.",
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Member',
        message:
          'Your library membership has been suspended. Reason: [Suspension Reason]. Contact the library for details.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Suspension Reason]'],
        placeHolderOptions: [{ value: '[Suspension Reason]', label: 'Suspension Reason' }],
        isEnable: true,
      },
      {
        name: 'Librarian',
        message: 'Member suspended: [Member Name] - Reason: [Suspension Reason]',
        communicationChannel: ['In-App'],
        placeHolder: ['[Member Name]', '[Suspension Reason]'],
        placeHolderOptions: [
          { value: '[Member Name]', label: 'Member Name' },
          { value: '[Suspension Reason]', label: 'Suspension Reason' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message: 'Member account suspended: [Member Name] - ID: [Member ID] - By: [Suspended By]',
        communicationChannel: ['In-App'],
        placeHolder: ['[Member Name]', '[Member ID]', '[Suspended By]'],
        placeHolderOptions: [
          { value: '[Member Name]', label: 'Member Name' },
          { value: '[Member ID]', label: 'Member ID' },
          { value: '[Suspended By]', label: 'Suspended By' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '7',
    event: 'Membership Reactivated',
    triggerCondition: 'When a suspended member account is reactivated.',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Member',
        message:
          'Good news! Your library membership has been reactivated. You can now borrow books again.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: [],
        placeHolderOptions: [],
        isEnable: true,
      },
      {
        name: 'Librarian',
        message: 'Member reactivated: [Member Name] - Reactivated by: [Reactivated By]',
        communicationChannel: ['In-App'],
        placeHolder: ['[Member Name]', '[Reactivated By]'],
        placeHolderOptions: [
          { value: '[Member Name]', label: 'Member Name' },
          { value: '[Reactivated By]', label: 'Reactivated By' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '8',
    event: 'Member Deleted',
    triggerCondition: 'When a member is permanently removed from the library system.',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Admin',
        message: 'Member account deleted: [Member Name] - ID: [Member ID]',
        communicationChannel: ['In-App'],
        placeHolder: ['[Member Name]', '[Member ID]'],
        placeHolderOptions: [
          { value: '[Member Name]', label: 'Member Name' },
          { value: '[Member ID]', label: 'Member ID' },
        ],
        isEnable: true,
      },
      {
        name: 'Librarian',
        message: 'Member removed from system: [Member Name] - Deleted by: [Deleted By]',
        communicationChannel: ['In-App'],
        placeHolder: ['[Member Name]', '[Deleted By]'],
        placeHolderOptions: [
          { value: '[Member Name]', label: 'Member Name' },
          { value: '[Deleted By]', label: 'Deleted By' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '9',
    event: 'Fine Accumulated',
    triggerCondition: 'When a member accumulates fines for overdue books.',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Member',
        message:
          'You have accumulated a fine of [Fine Amount] for overdue book(s). Please pay to continue borrowing.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Fine Amount]'],
        placeHolderOptions: [{ value: '[Fine Amount]', label: 'Fine Amount' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '10',
    event: 'Fine Paid',
    triggerCondition: 'When a member successfully pays their library fine.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Member',
        message: 'Thank you! Your fine of [Fine Amount] has been paid successfully.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Fine Amount]'],
        placeHolderOptions: [{ value: '[Fine Amount]', label: 'Fine Amount' }],
        isEnable: true,
      },
      {
        name: 'Librarian',
        message: 'Fine payment received: [Member Name] - Amount: [Fine Amount]',
        communicationChannel: ['In-App'],
        placeHolder: ['[Member Name]', '[Fine Amount]'],
        placeHolderOptions: [
          { value: '[Member Name]', label: 'Member Name' },
          { value: '[Fine Amount]', label: 'Fine Amount' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '11',
    event: 'Borrowing Limit Reached',
    triggerCondition: 'When a member reaches their maximum book borrowing limit.',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Member',
        message:
          'You have reached your borrowing limit of [Max Books] books. Please return some books to borrow more.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Max Books]'],
        placeHolderOptions: [{ value: '[Max Books]', label: 'Max Books' }],
        isEnable: true,
      },
    ],
  },
];

const MemberNotificationManagement = ({ dialog, setIsViewMode }: any) => {
  const [selectedData, setSelectedData] = useState<any>(null);
  const [view, setView] = useState(false);
  const [notifications, setNotifications] = useState(memberNotificationsData);

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
          tableId="member-auto-notification-configuration"
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

export default MemberNotificationManagement;
