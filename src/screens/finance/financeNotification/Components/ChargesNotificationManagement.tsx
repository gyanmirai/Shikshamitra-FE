import React, { useState } from 'react';
import { Box, Card, Switch } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import EditNotificationDialog from 'src/screens/student/studentNotification/editNotificationDialog';
import {
  NotificationStatusType,
  NotificationStatusOptions,
} from 'src/enums/notification-status-type';

export const chargesNotificationsData = [
  {
    id: '1',
    event: 'New charge applied',
    triggerCondition:
      'When a charge (Late Fee / Misc Fee / Damage Fee / Transport Penalty etc.) is added.',
    recipient: [
      {
        name: 'Accountant',
        message: 'A new charge has been applied to [Student Name].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
      {
        name: 'Parent',
        message:
          'A new fee/penalty has been added for [Student Name]. Please review it in the portal.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
      {
        name: 'Class Teacher',
        message: 'A new charge has been added for your student [Student Name].',
        communicationChannel: ['In-App'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '2',
    event: 'Charge updated',
    triggerCondition: 'When charge amount, description, or category is updated or modified.',
    recipient: [
      {
        name: 'Accountant',
        message: 'A charge for [Student Name] has been updated.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
      {
        name: 'Parent',
        message: 'A previously created charge for [Student Name] has been updated. Check details.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '3',
    event: 'Charge waived / removed',
    triggerCondition: 'When a charge is waived or removed for the student.',
    recipient: [
      {
        name: 'Accountant',
        message: 'A charge for [Student Name] has been waived or removed.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
      {
        name: 'Parent',
        message: 'A charge previously applied to [Student Name] has been waived by the school.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
      {
        name: 'Principal',
        message: 'A charge has been waived for [Student Name]. Please review if needed.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '4',
    event: 'Charge approved',
    triggerCondition: 'When Principal/Admin approves an added charge.',
    recipient: [
      {
        name: 'Finance Staff',
        message: 'The charge added for [Student Name] has been approved by Admin/Principal.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
      {
        name: 'Parent',
        message: 'A new charge for [Student Name] has been approved.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '5',
    event: 'Charge rejected',
    triggerCondition: 'When Principal/Admin rejects a charge request.',
    recipient: [
      {
        name: 'Finance Staff',
        message: 'The charge request for [Student Name] has been rejected by Admin/Principal.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
      {
        name: 'Parent',
        message: 'The charge added for [Student Name] has been rejected and will not be applied.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '8',
    event: 'Charge overdue',
    triggerCondition: 'When a charge remains unpaid beyond its due date.',
    recipient: [
      {
        name: 'Parent',
        message: 'A charge for [Student Name] is overdue. Please pay it at the earliest.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
      {
        name: 'Accountant',
        message: 'A charge for [Student Name] is still unpaid past the due date.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
    ],
  },
];

const ChargesNotificationManagement = ({ dialog, setIsViewMode }: any) => {
  const [tableData, setTableData] = useState(chargesNotificationsData);
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
          tableId="charges-auto-notification-configuration"
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

export default ChargesNotificationManagement;
