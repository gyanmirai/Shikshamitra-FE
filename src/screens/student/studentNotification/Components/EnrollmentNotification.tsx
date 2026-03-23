import React, { useState } from 'react';
import { Box, Switch } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import EditNotificationDialog from 'src/screens/student/studentNotification/editNotificationDialog';
import {
  NotificationStatusType,
  NotificationStatusOptions,
} from 'src/enums/notification-status-type';

export const enrollmentNotificationsData = [
  {
    id: '1',
    event: 'New Inquiry Received',
    triggerCondition: 'When a new student inquiry/enquiry form is submitted.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Admin',
        message:
          'New inquiry received from [Parent Name] for student [Student Name] for class [Class]. Contact: [Phone].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Parent Name]', '[Student Name]', '[Class]', '[Phone]'],
        placeHolderOptions: [
          { value: '[Parent Name]', label: 'Parent Name' },
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Class]', label: 'Class' },
          { value: '[Phone]', label: 'Phone' },
        ],
        isEnable: true,
      },
      {
        name: 'Parent',
        message:
          'Thank you for your inquiry, [Parent Name]! We have received your request for [Student Name]. Our team will contact you shortly.',
        communicationChannel: ['In-App', 'Email', 'SMS'],
        placeHolder: ['[Parent Name]', '[Student Name]'],
        placeHolderOptions: [
          { value: '[Parent Name]', label: 'Parent Name' },
          { value: '[Student Name]', label: 'Student Name' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '2',
    event: 'Enrollment Form Submitted',
    triggerCondition: 'When a student enrollment/registration form is submitted for review.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Admin',
        message:
          'Enrollment form submitted for [Student Name] - Class [Class]. Form ID: [Form ID]. Pending review.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Student Name]', '[Class]', '[Form ID]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Class]', label: 'Class' },
          { value: '[Form ID]', label: 'Form ID' },
        ],
        isEnable: true,
      },
      {
        name: 'Parent',
        message:
          'Your enrollment form for [Student Name] has been successfully submitted. Reference ID: [Form ID]. We will notify you upon approval.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]', '[Form ID]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Form ID]', label: 'Form ID' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '3',
    event: 'Admission Confirmed',
    triggerCondition: 'When a student admission is officially confirmed by the school admin.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Parent',
        message:
          'Congratulations! Admission for [Student Name] to Class [Class] has been confirmed. Student ID: [Student ID]. Please complete the fee payment by [Due Date].',
        communicationChannel: ['In-App', 'Email', 'SMS'],
        placeHolder: ['[Student Name]', '[Class]', '[Student ID]', '[Due Date]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Class]', label: 'Class' },
          { value: '[Student ID]', label: 'Student ID' },
          { value: '[Due Date]', label: 'Due Date' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message:
          'Admission confirmed: [Student Name] - Class [Class]/[Division]. Student ID: [Student ID].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Student Name]', '[Class]', '[Division]', '[Student ID]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Class]', label: 'Class' },
          { value: '[Division]', label: 'Division' },
          { value: '[Student ID]', label: 'Student ID' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '4',
    event: 'Registration Rejected',
    triggerCondition: 'When a student registration or enrollment application is rejected.',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Parent',
        message:
          'We regret to inform you that the registration for [Student Name] has not been approved. Reason: [Reason]. Please contact the school for further assistance.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]', '[Reason]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Reason]', label: 'Reason' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message:
          'Registration rejected: [Student Name] - Reason: [Reason]. Rejected by: [Rejected By].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Student Name]', '[Reason]', '[Rejected By]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Reason]', label: 'Reason' },
          { value: '[Rejected By]', label: 'Rejected By' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '5',
    event: 'Document Submission Pending',
    triggerCondition: 'When required documents are not yet submitted for enrollment.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Parent',
        message:
          'Dear [Parent Name], your enrollment for [Student Name] is incomplete. Please submit the following documents: [Document List] by [Due Date].',
        communicationChannel: ['In-App', 'Email', 'SMS'],
        placeHolder: ['[Parent Name]', '[Student Name]', '[Document List]', '[Due Date]'],
        placeHolderOptions: [
          { value: '[Parent Name]', label: 'Parent Name' },
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Document List]', label: 'Document List' },
          { value: '[Due Date]', label: 'Due Date' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message:
          'Documents pending: [Student Name] - Missing: [Document List]. Enrollment cannot proceed.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Student Name]', '[Document List]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Document List]', label: 'Document List' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '6',
    event: 'Fee Payment Reminder',
    triggerCondition: 'When the enrollment fee or first installment payment is due.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Parent',
        message:
          'Reminder: Fee payment of [Fee Amount] for [Student Name] is due on [Due Date]. Please complete the payment to secure the admission.',
        communicationChannel: ['In-App', 'Email', 'SMS'],
        placeHolder: ['[Fee Amount]', '[Student Name]', '[Due Date]'],
        placeHolderOptions: [
          { value: '[Fee Amount]', label: 'Fee Amount' },
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Due Date]', label: 'Due Date' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '7',
    event: 'Student Class/Division Changed',
    triggerCondition: 'When a student is moved to a different class or division.',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Parent',
        message:
          '[Student Name] has been moved to Class [New Class] - [New Division] effective [Date].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]', '[New Class]', '[New Division]', '[Date]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[New Class]', label: 'New Class' },
          { value: '[New Division]', label: 'New Division' },
          { value: '[Date]', label: 'Date' },
        ],
        isEnable: true,
      },
      {
        name: 'Teacher',
        message:
          'Student transferred: [Student Name] moved from [Old Class]/[Old Division] to [New Class]/[New Division].',
        communicationChannel: ['In-App'],
        placeHolder: [
          '[Student Name]',
          '[Old Class]',
          '[Old Division]',
          '[New Class]',
          '[New Division]',
        ],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Old Class]', label: 'Old Class' },
          { value: '[Old Division]', label: 'Old Division' },
          { value: '[New Class]', label: 'New Class' },
          { value: '[New Division]', label: 'New Division' },
        ],
        isEnable: true,
      },
    ],
  },
];

const EnrollmentNotificationManagement = ({ dialog, setIsViewMode }: any) => {
  const [selectedData, setSelectedData] = useState<any>(null);
  const [view, setView] = useState(false);
  const [notifications, setNotifications] = useState(enrollmentNotificationsData);

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
          tableId="enrollment-auto-notification-configuration"
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

export default EnrollmentNotificationManagement;
