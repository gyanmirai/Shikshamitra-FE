import React, { useState } from 'react';
import { Box, Switch } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import EditNotificationDialog from 'src/screens/student/student-notification/editNotificationDialog';
import {
  NotificationStatusType,
  NotificationStatusOptions,
} from 'src/enums/notification-status-type';

export const attendanceNotificationsData = [
  {
    id: '1',
    event: 'Student Absent',
    triggerCondition: 'When a student is marked absent for the day.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Parent',
        message:
          'Dear Parent, your child [Student Name] was marked absent on [Date]. Please contact the school if needed.',
        communicationChannel: ['In-App', 'SMS', 'Email'],
        placeHolder: ['[Student Name]', '[Date]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Date]', label: 'Date' },
        ],
        isEnable: true,
      },
      {
        name: 'Teacher',
        message: 'Student [Student Name] from [Class] - [Division] is absent today ([Date]).',
        communicationChannel: ['In-App'],
        placeHolder: ['[Student Name]', '[Class]', '[Division]', '[Date]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Class]', label: 'Class' },
          { value: '[Division]', label: 'Division' },
          { value: '[Date]', label: 'Date' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '2',
    event: 'Late Arrival',
    triggerCondition: 'When a student arrives after the designated school start time.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Parent',
        message:
          'Dear Parent, [Student Name] arrived late to school on [Date] at [Arrival Time]. Please ensure punctuality.',
        communicationChannel: ['In-App', 'SMS'],
        placeHolder: ['[Student Name]', '[Date]', '[Arrival Time]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Date]', label: 'Date' },
          { value: '[Arrival Time]', label: 'Arrival Time' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message:
          'Late arrival recorded: [Student Name] - [Class]/[Division] at [Arrival Time] on [Date].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Student Name]', '[Class]', '[Division]', '[Arrival Time]', '[Date]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Class]', label: 'Class' },
          { value: '[Division]', label: 'Division' },
          { value: '[Arrival Time]', label: 'Arrival Time' },
          { value: '[Date]', label: 'Date' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '3',
    event: 'Early Departure',
    triggerCondition: 'When a student leaves school before the designated end time.',
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Parent',
        message:
          'Dear Parent, [Student Name] left school early on [Date] at [Departure Time]. Reason: [Reason].',
        communicationChannel: ['In-App', 'SMS'],
        placeHolder: ['[Student Name]', '[Date]', '[Departure Time]', '[Reason]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Date]', label: 'Date' },
          { value: '[Departure Time]', label: 'Departure Time' },
          { value: '[Reason]', label: 'Reason' },
        ],
        isEnable: true,
      },
      {
        name: 'Teacher',
        message: 'Early departure: [Student Name] left at [Departure Time] on [Date].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Student Name]', '[Departure Time]', '[Date]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Departure Time]', label: 'Departure Time' },
          { value: '[Date]', label: 'Date' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '4',
    event: 'Chronic Absenteeism Alert',
    triggerCondition: 'When a student has been absent for more than [Threshold] consecutive days.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Parent',
        message:
          'Dear Parent, [Student Name] has been absent for [Absent Days] consecutive days. Please contact the class teacher.',
        communicationChannel: ['In-App', 'SMS', 'Email'],
        placeHolder: ['[Student Name]', '[Absent Days]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Absent Days]', label: 'Absent Days' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message:
          'Chronic absenteeism: [Student Name] - [Class]/[Division] has [Absent Days] consecutive absences.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]', '[Class]', '[Division]', '[Absent Days]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Class]', label: 'Class' },
          { value: '[Division]', label: 'Division' },
          { value: '[Absent Days]', label: 'Absent Days' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '5',
    event: 'Leave Application Submitted',
    triggerCondition: 'When a parent or student submits a leave application.',
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Teacher',
        message:
          'Leave application received for [Student Name] from [From Date] to [To Date]. Reason: [Reason].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Student Name]', '[From Date]', '[To Date]', '[Reason]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[From Date]', label: 'From Date' },
          { value: '[To Date]', label: 'To Date' },
          { value: '[Reason]', label: 'Reason' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message:
          'New leave request: [Student Name] - [Class]/[Division] for [From Date] to [To Date].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Student Name]', '[Class]', '[Division]', '[From Date]', '[To Date]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Class]', label: 'Class' },
          { value: '[Division]', label: 'Division' },
          { value: '[From Date]', label: 'From Date' },
          { value: '[To Date]', label: 'To Date' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '6',
    event: 'Leave Approved',
    triggerCondition: "When a student's leave application is approved by the teacher or admin.",
    isActive: NotificationStatusType.Active,
    recipient: [
      {
        name: 'Parent',
        message:
          'Your leave application for [Student Name] from [From Date] to [To Date] has been approved.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]', '[From Date]', '[To Date]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[From Date]', label: 'From Date' },
          { value: '[To Date]', label: 'To Date' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '7',
    event: 'Leave Rejected',
    triggerCondition: "When a student's leave application is rejected.",
    isActive: NotificationStatusType.Inactive,
    recipient: [
      {
        name: 'Parent',
        message:
          'The leave application for [Student Name] from [From Date] to [To Date] has been rejected. Reason: [Reason].',
        communicationChannel: ['In-App', 'Email', 'SMS'],
        placeHolder: ['[Student Name]', '[From Date]', '[To Date]', '[Reason]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[From Date]', label: 'From Date' },
          { value: '[To Date]', label: 'To Date' },
          { value: '[Reason]', label: 'Reason' },
        ],
        isEnable: true,
      },
    ],
  },
];

const AttendanceNotificationManagement = ({ dialog, setIsViewMode }: any) => {
  const [selectedData, setSelectedData] = useState<any>(null);
  const [view, setView] = useState(false);
  const [notifications, setNotifications] = useState(attendanceNotificationsData);

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
          tableId="attendance-auto-notification-configuration"
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

export default AttendanceNotificationManagement;
