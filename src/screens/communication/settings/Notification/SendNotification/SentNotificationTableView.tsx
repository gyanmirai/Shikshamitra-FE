'use client';

import type { LabelColor } from 'src/components/label';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { INotification } from 'src/screens/communication/NotificationHistory/type';

import { Label } from 'src/components/label';
import { Box, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import NotificationCard from 'src/screens/communication/NotificationHistory/NotificationCardHistory';
import { useGetSentNotificationHistoryQuery } from 'src/redux/communication/setting/importanceLevel';
import {
  DeliveryStatus,
  DeliveryStatusColor,
  DeliveryStatusOptions,
} from 'src/enums/notification-delivery-status';

import communicationData from '../../../../../../communicationData.json';

const SentNotificationTableView = () => {
  const viewNotificationDialog = useBoolean(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: notificationData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSentNotificationHistoryQuery,
  });
  const [selectedHotification, setSelectedHotification] = useState<INotification | null>(null);
  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'role',
        label: 'Role',
        align: 'left',
        sticky: true,
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {Array.isArray(value) ? value.join(', ') : value}
          </Typography>
        ),
      },
      {
        id: 'title',
        label: 'Title',
        align: 'left',
        minWidth: 200,
      },
      {
        id: 'importanceLevel',
        label: 'Importance Level',
        align: 'left',
        minWidth: 160,
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'subject',
        label: 'Subject',
        align: 'left',
        minWidth: 150,
      },
      {
        id: 'sentBy',
        label: 'Sent By',
        align: 'left',
        minWidth: 150,
      },
      {
        id: 'category',
        label: 'Template',
        align: 'left',
      },
      {
        id: 'channels',
        label: 'Channels',
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {Array.isArray(value) ? value.join(', ') : value}
          </Typography>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        align: 'left',
        filterType: 'enum',
        enumOptions: DeliveryStatusOptions,
        sticky: true,
        render: (value) => (
          <Label variant="soft" color={DeliveryStatusColor[value as DeliveryStatus] as LabelColor}>
            {DeliveryStatus[value as DeliveryStatus]}
          </Label>
        ),
      },
      {
        id: 'action',
        label: 'Action',
        align: 'center',
        isSort: false,
        sticky: true,
        isFilter: false,
        render: (value, row) => (
          <ThreeDotsActions
            showThreeDots={false}
            placement="right-top"
            showViewIcon
            handleViewClick={() => {
              viewNotificationDialog.onTrue();
              setSelectedHotification(row as INotification);
            }}
          />
        ),
      },
    ],
    [viewNotificationDialog]
  );
  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomizableTable
        tableId="announcement-data-table"
        noDataText="No Announcements Found"
        columns={columns}
        data={communicationData?.sentNotificationData || []}
      />
      <CustomDialog
        title={`${selectedHotification?.title || ''}`}
        open={viewNotificationDialog.value}
        handleClose={() => {
          setSelectedHotification(null);
          viewNotificationDialog.onFalse();
        }}
        maxWidth="md"
      >
        <NotificationCard data={selectedHotification} />
      </CustomDialog>
    </Box>
  );
};

export default SentNotificationTableView;
