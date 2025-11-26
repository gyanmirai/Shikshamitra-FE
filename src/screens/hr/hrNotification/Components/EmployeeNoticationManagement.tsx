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
// EMPLOYEE NOTIFICATION DATA
// -------------------------------------------------------------------
export const employeeNotificationsData = [
  {
    id: '1',
    event: 'New employee added',
    triggerCondition:
      'When a new staff member is created in the Employee module with qualifications, role, and department.',
    recipient: [
      {
        name: 'Admin',
        message: 'A new employee [Employee Name] has been added to the staff list.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Employee Name]'],
        placeHolderOptions: [{ value: '[Employee Name]', label: 'Employee Name' }],
        isEnable: true,
      },
      {
        name: 'Principal',
        message: 'A new employee [Employee Name] has joined the institution.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Employee Name]'],
        placeHolderOptions: [{ value: '[Employee Name]', label: 'Employee Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '2',
    event: 'Employee details updated',
    triggerCondition:
      'When employee qualification, designation, salary, or personal details are edited.',
    recipient: [
      {
        name: 'Admin',
        message: 'Details of employee [Employee Name] have been updated.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Employee Name]'],
        placeHolderOptions: [{ value: '[Employee Name]', label: 'Employee Name' }],
        isEnable: true,
      },
      {
        name: 'Principal',
        message: 'Updated details for employee [Employee Name] have been saved.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Employee Name]'],
        placeHolderOptions: [{ value: '[Employee Name]', label: 'Employee Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '3',
    event: 'Employee status change',
    triggerCondition:
      'When an employee’s status (active, inactive, resigned, terminated) is changed.',
    recipient: [
      {
        name: 'Admin',
        message: 'The status of employee [Employee Name] has been updated to [Status].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Employee Name]', '[Status]'],
        placeHolderOptions: [
          { value: '[Employee Name]', label: 'Employee Name' },
          { value: '[Status]', label: 'Status' },
        ],
        isEnable: true,
      },
      {
        name: 'Principal',
        message: 'Employee [Employee Name] status changed to [Status].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Employee Name]', '[Status]'],
        placeHolderOptions: [
          { value: '[Employee Name]', label: 'Employee Name' },
          { value: '[Status]', label: 'Status' },
        ],
        isEnable: true,
      },
      {
        name: 'Employee',
        message: 'Your employment status has been updated to [Status].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Status]'],
        placeHolderOptions: [{ value: '[Status]', label: 'Status' }],
        isEnable: true,
      },
    ],
  },
];

// -------------------------------------------------------------------
// COMPONENT
// -------------------------------------------------------------------
const EmployeeNotificationManagement = ({ dialog, setIsViewMode }: any) => {
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
          tableId="employee-auto-notification-configuration"
          data={employeeNotificationsData}
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

export default EmployeeNotificationManagement;
