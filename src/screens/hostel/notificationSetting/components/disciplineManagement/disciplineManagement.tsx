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

const DisciplinaryNotificationSetting = (props: TabComponentType) => {
  // State to control the dialog open/close
  const [open, setOpen] = useState(false);
  // State to store the selected notification data
  const [selectedData, setSelectedData] = useState<any>(null);
  // State to control if dialog is in view mode
  const [view, setView] = useState(false);

  // Handler to close the dialog and reset states
  const closeHandler = () => {
    setOpen(false);
    setSelectedData(null);
    setView(false);
  };

  const data = [
    {
      id: '6',
      event: 'Major Disciplinary Incidents',
      triggerCondition: 'Receive alert when my child is involved in a serious disciplinary issue',
      recipient: [
        {
          name: 'parent',
          message:
            'Dear [Parent Name], your child [Student Name] has been involved in a serious disciplinary issue. Please contact the school for further details.',
          communicationChannel: ['Email', 'WhatsApp'],
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
          noDataText="No disciplinary notification data found"
          tableId="disciplinary-notification-table"
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

export default DisciplinaryNotificationSetting;
