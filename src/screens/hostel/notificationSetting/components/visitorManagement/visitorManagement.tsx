import type { TabComponentType } from 'src/screens/hr/leave-request';

import { useState } from 'react';
import { Box, Switch } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  NotificationStatusType,
  NotificationStatusOptions,
} from 'src/enums/notification-status-type';

import EditNotificationDialog from '../feeManagement/editNotification';

const VisitorManagementNotificationSetting = (props: TabComponentType) => {
  const [open, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [view, setView] = useState(false);

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
          noDataText="No visitor management notification data found"
          tableId="visitor-notification-table"
          data={[
            {
              id: '2',
              event: 'When Visitor Check my Child',
              triggerCondition: 'Based on visit time (instant notification)',
              recipient: [
                {
                  name: 'parent',
                  message:
                    'Dear [Parent Name], [Visitor Name] has checked on [Student Name] at [Visit Time].',
                  communicationChannel: ['Email', 'WhatsApp'],
                  placeHolder: [
                    '[Parent Name]',
                    '[Student Name]',
                    '[Visitor Name]',
                    '[Visit Time]',
                  ],
                  placeHolderOptions: [
                    { value: '[Parent Name]', label: 'Parent Name' },
                    { value: '[Student Name]', label: 'Student Name' },
                    { value: '[Visitor Name]', label: 'Visitor Name' },
                    { value: '[Visit Time]', label: 'Visit Time' },
                  ],
                  isEnable: true,
                },
              ],
              isActive: NotificationStatusType.Active,
            },
            {
              id: '3',
              event: 'Visitor Overstay',
              triggerCondition: 'Overtime for visitor (Instant)',
              recipient: [
                {
                  name: 'visitor',
                  message:
                    'Dear [Visitor Name], your visit duration has exceeded the allotted time. Please report to the front desk.',
                  communicationChannel: ['Message', 'WhatsApp'],
                  placeHolder: ['[Visitor Name]'],
                  placeHolderOptions: [{ value: '[Visitor Name]', label: 'Visitor Name' }],
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

export default VisitorManagementNotificationSetting;
