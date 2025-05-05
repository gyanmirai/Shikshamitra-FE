import type { TabComponentType } from 'src/screens/hr/leave-request';

import { useState } from 'react';

import { Box, Switch } from '@mui/material';

import {
  NotificationStatusType,
  NotificationStatusOptions,
} from 'src/enums/notification-status-type';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import EditNotificationDialog from '../feeManagement/editNotification';

const MaintenanceNotificationSetting = (props: TabComponentType) => {
  // State to control the dialog open/close
  const [open, setOpen] = useState(false);
  // State to store the selected notification data
  const [selectedData, setSelectedData] = useState<any>(null);
  // State to control view/edit mode
  const [view, setView] = useState(false);

  // Handler to close the dialog and reset states
  const closeHandler = () => {
    setOpen(false);
    setSelectedData(null);
    setView(false);
  };

  const data = [
    {
      id: '4',
      event: 'Escalated High/Critical Incident',
      triggerCondition: 'Notified only of escalated high/Critical Incident',
      recipient: [
        {
          name: 'principal',
          message:
            'Dear [Principal Name], a critical incident involving [Student Name] has been escalated. Immediate attention is required.',
          communicationChannel: ['Email', 'Message'],
          placeHolder: ['[Principal Name]', '[Student Name]'],
          placeHolderOptions: [
            { value: '[Principal Name]', label: 'Principal Name' },
            { value: '[Student Name]', label: 'Student Name' },
          ],
          isEnable: true,
        },
      ],
      isActive: NotificationStatusType.Active,
    },
    {
      id: '5',
      event: 'Safety or Emergency Incident',
      triggerCondition: 'My child involved in a safety or emergency incident',
      recipient: [
        {
          name: 'parent',
          message:
            'Dear [Parent Name], your child [Student Name] has been involved in a safety/emergency incident. Please contact the administration.',
          communicationChannel: ['WhatsApp', 'Email'],
          placeHolder: ['[Parent Name]', '[Student Name]'],
          placeHolderOptions: [
            { value: '[Parent Name]', label: 'Parent Name' },
            { value: '[Student Name]', label: 'Student Name' },
          ],
          isEnable: true,
        },
      ],
      isActive: NotificationStatusType.Active,
    },
  ];

  return (
    <>
      {open ? (
        <EditNotificationDialog data={selectedData} onClose={closeHandler} isFromView={view} />
      ) : (
        <CustomizableTable
          noDataText="No maintenance notification data found"
          tableId="maintenance-notification-table"
          data={data}
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

export default MaintenanceNotificationSetting;
