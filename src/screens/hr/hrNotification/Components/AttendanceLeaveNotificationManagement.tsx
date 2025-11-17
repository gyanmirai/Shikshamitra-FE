import React, { useState } from 'react';
import { Box, Card, Switch } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import EditNotificationDialog from 'src/screens/student/studentNotification/editNotificationDialog';
import {
  NotificationStatusType,
  NotificationStatusOptions,
} from 'src/enums/notification-status-type';

// -------------------------------------------------------------------
// LEAVE NOTIFICATION DATA
// -------------------------------------------------------------------
export const attendanceLeaveNotificationsData = [
  {
    id: '1',
    event: 'Leave applied by employee',
    triggerCondition: 'Employee submits a leave request (Casual, Sick, Emergency, Social, etc.).',
    recipient: [
      {
        name: 'Principal',
        message:
          'Employee [Employee Name] has applied for [Leave Type] leave from [From Date] to [To Date].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Employee Name]', '[Leave Type]', '[From Date]', '[To Date]'],
        placeHolderOptions: [
          { value: '[Employee Name]', label: 'Employee Name' },
          { value: '[Leave Type]', label: 'Leave Type' },
          { value: '[From Date]', label: 'From Date' },
          { value: '[To Date]', label: 'To Date' },
        ],
        isEnable: true,
      },
      {
        name: 'Admin',
        message:
          'A new leave request has been submitted by [Employee Name] for [Leave Type] leave.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Employee Name]', '[Leave Type]'],
        placeHolderOptions: [
          { value: '[Employee Name]', label: 'Employee Name' },
          { value: '[Leave Type]', label: 'Leave Type' },
        ],
        isEnable: true,
      },
    ],
  },

  {
    id: '2',
    event: 'Leave request received',
    triggerCondition: 'Confirmation that the system has logged the request.',
    recipient: [
      {
        name: 'Employee',
        message:
          'Your leave request for [Leave Type] from [From Date] to [To Date] has been successfully submitted.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Leave Type]', '[From Date]', '[To Date]'],
        placeHolderOptions: [
          { value: '[Leave Type]', label: 'Leave Type' },
          { value: '[From Date]', label: 'From Date' },
          { value: '[To Date]', label: 'To Date' },
        ],
        isEnable: true,
      },
    ],
  },

  {
    id: '3',
    event: 'Leave approved',
    triggerCondition: 'Principal or Admin approves the leave request.',
    recipient: [
      {
        name: 'Employee',
        message: 'Your leave request for [Leave Type] has been approved.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Leave Type]'],
        placeHolderOptions: [{ value: '[Leave Type]', label: 'Leave Type' }],
        isEnable: true,
      },
    ],
  },

  {
    id: '4',
    event: 'Leave rejected',
    triggerCondition: 'Principal or Admin rejects the leave request.',
    recipient: [
      {
        name: 'Employee',
        message: 'Your leave request for [Leave Type] has been rejected. Reason: [Reason].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Leave Type]', '[Reason]'],
        placeHolderOptions: [
          { value: '[Leave Type]', label: 'Leave Type' },
          { value: '[Reason]', label: 'Reason' },
        ],
        isEnable: true,
      },
    ],
  },
];

// -------------------------------------------------------------------
// COMPONENT
// -------------------------------------------------------------------
const AttendanceLeaveNotificationManagement = ({ dialog, setIsViewMode }: any) => {
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
          tableId="attendance-leave-auto-notification-configuration"
          data={attendanceLeaveNotificationsData}
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
                      console.log(event.target.checked);
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

export default AttendanceLeaveNotificationManagement;
