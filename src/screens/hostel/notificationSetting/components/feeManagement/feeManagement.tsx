import type { TabComponentType } from 'src/screens/hr/leave-request';

import { useState } from 'react';

import { Box, Switch } from '@mui/material';

import {
  NotificationStatusType,
  NotificationStatusOptions,
} from 'src/enums/notification-status-type';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import EditNotificationDialog from './editNotification';

const HostelFeeManagementSetting = (props: TabComponentType) => {
  // State variables to manage the dialog and selected notification data
  const [open, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [view, setView] = useState(false);

  // Handler function to close the dialog and reset selected data and view state
  const closeHandler = () => {
    setOpen(false);
    setSelectedData(null);
    setView(false);
  };
  return (
    <>
      {open ? (
        <EditNotificationDialog data={selectedData} onClose={closeHandler} isFromView={view} />
      ) : (
        <CustomizableTable
          noDataText="No Fee management notification data found "
          tableId="student-auto-notification-configuration"
          data={[
            {
              id: '8',
              event: 'Fee Due',
              triggerCondition: 'When student fee due date is near or passed.',
              recipient: [
                {
                  name: 'parent',
                  message:
                    'Dear [Parent Name], the fee for [Student Name] is due on [Due Date]. Kindly make the payment to avoid any late charges.',
                  communicationChannel: ['WhatsApp', 'Email', 'Message'],
                  placeHolder: ['[Student Name]', '[Parent Name]', '[Due Date]'],
                  placeHolderOptions: [
                    { value: '[Student Name]', label: 'Student Name' },
                    { value: '[Parent Name]', label: 'Parent Name' },
                    { value: '[Due Date]', label: 'Due Date' },
                  ],
                  isEnable: true,
                },
              ],
              isActive: NotificationStatusType.Active,
            },
          ]}
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
                  <Box key={recipient.name}>
                    <Box>{recipient.name.toUpperCase()}</Box>
                  </Box>
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
                  <Box>
                    <Switch
                      checked={NotificationStatusType.Active === row.isActive}
                      onChange={(event) => {
                        console.log(event.target.checked);
                      }}
                    />
                  </Box>
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
                      setOpen(true);
                      setView(false);
                    }}
                    showViewIcon
                    handleViewClick={() => {
                      setSelectedData(row);
                      setView(true);
                      setOpen(true);
                    }}
                  />
                );
              },
            },
          ]}
        />
      )}
    </>
  );
};

export default HostelFeeManagementSetting;
