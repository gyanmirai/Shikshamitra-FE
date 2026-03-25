import React, { useState } from 'react';
import { Box, Card, Switch } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import EditNotificationDialog from 'src/screens/student/studentNotification/editNotificationDialog';
import {
  NotificationStatusType,
  NotificationStatusOptions,
} from 'src/enums/notification-status-type';

export const feeCollectionNotificationsData = [
  {
    id: '2',
    event: 'Fee successfully collected',
    triggerCondition: 'When the payment is fully processed for the selected term(s).',
    recipient: [
      {
        name: 'Accountant',
        message: 'Fee has been successfully collected for [Student Name].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
      {
        name: 'Class Teacher',
        message: '[Student Name] has successfully paid the fee.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '4',
    event: 'Receipt generated',
    triggerCondition: 'After successful payment and receipt/PDF generated.',
    recipient: [
      {
        name: 'Accountant',
        message: 'Receipt generated for [Student Name]. Receipt No: [Receipt Number].',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]', '[Receipt Number]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Receipt Number]', label: 'Receipt Number' },
        ],
        isEnable: true,
      },
      {
        name: 'Student/Parent',
        message: 'Your payment receipt [Receipt Number] for [Student Name] is ready for download.',
        communicationChannel: ['In-App', 'Email'],
        placeHolder: ['[Student Name]', '[Receipt Number]'],
        placeHolderOptions: [
          { value: '[Student Name]', label: 'Student Name' },
          { value: '[Receipt Number]', label: 'Receipt Number' },
        ],
        isEnable: true,
      },
    ],
  },
  {
    id: '5',
    event: 'Payment failed',
    triggerCondition: 'When any online/UPI/POS payment attempt fails.',
    recipient: [
      {
        name: 'Accountant',
        message:
          'A payment attempt for [Student Name] has failed. Please assist the parent if required.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
      {
        name: 'Parent',
        message:
          'Your payment attempt for [Student Name] has failed. Please try again or contact the school.',
        communicationChannel: ['In-App'],
        placeHolder: ['[Student Name]'],
        placeHolderOptions: [{ value: '[Student Name]', label: 'Student Name' }],
        isEnable: true,
      },
    ],
  },
];

const FeeCollectionNotificationManagement = ({ dialog, setIsViewMode }: any) => {
  const [tableData, setTableData] = useState(feeCollectionNotificationsData);
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
          tableId="fee-collection-auto-notification-configuration"
          data={tableData}
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

export default FeeCollectionNotificationManagement;
