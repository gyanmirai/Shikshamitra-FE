'use client';

import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { Box, Typography } from '@mui/material';
import { useBoolean } from 'src/hooks/useBoolean';
import CustomDialog from 'src/components/custom-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetNotificationHistoryQuery } from 'src/redux/communication/notification/notificationHistoryApi';
import {
  DeliveryStatus,
  DeliveryStatusColor,
  DeliveryStatusOptions,
} from 'src/enums/notification-delivery-status';

import NotificationCard from './NotificationCardHistory';

import type { INotification } from './type';

const NotificationHistory = () => {
  const viewNotificationDialog = useBoolean();
  const { data: notificationData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetNotificationHistoryQuery,
  });
  const [selectedHotification, setSelectedHotification] = useState<INotification | null>(null);
  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Notification History"
        description="View and manage notification history including exam notifications, fee reminders, and event announcements."
        links={[
          { name: 'Communication', href: '/communication/dashboard' },
          { name: 'Notification History' },
        ]}
        sx={{ px: 1 }}
      />
      <CustomizableTable
        tableId="announcement-data-table"
        noDataText="No Announcements Found"
        columns={[
          {
            id: 'dateTime',
            label: 'Date & Time',
            filterType: 'date',
            align: 'left',
            render: (value) => (
              <Typography fontSize="13px">{dayjs(value).format('DD-MM-YYYY hh:mm')}</Typography>
            ),
          },
          {
            id: 'title',
            label: 'Title',
            align: 'left',
          },
          {
            id: 'category',
            label: 'Category',
            align: 'left',
          },
          {
            id: 'sentBy',
            label: 'Sent by',
            align: 'left',
          },
          {
            id: 'recipients',
            label: 'Recipients',
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
              <Label
                variant="soft"
                color={DeliveryStatusColor[value as DeliveryStatus] as LabelColor}
              >
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
        ]}
        data={notificationData || []}
      />
      <CustomDialog
        title={`${selectedHotification?.title}`}
        open={viewNotificationDialog.value}
        handleClose={() => {
          setSelectedHotification(null);
          viewNotificationDialog.onFalse();
        }}
        maxWidth="md"
      >
        <NotificationCard data={selectedHotification} />
        {/* <TemplateViewDetails template={viewTemplate} /> */}
      </CustomDialog>
    </Box>
  );
};

export default NotificationHistory;
