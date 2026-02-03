'use client';

import type { LabelColor } from 'src/components/label';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { INotification } from 'src/screens/communication/NotificationHistory/type';

import { useMemo } from 'react';
import { Typography } from '@mui/material';
import { Label } from 'src/components/label';
import ThreeDotsActions from 'src/components/three-dots-actions';
import {
  DeliveryStatus,
  DeliveryStatusColor,
  DeliveryStatusOptions,
} from 'src/enums/notification-delivery-status';

interface UseSentNotificationTableColumnsProps {
  onView: (row: INotification) => void;
}

/**
 * Hook: useSentNotificationTableColumns
 * Memoization Justification:
 * The columns array is a complex object structure with render functions.
 * Memoizing it prevents unnecessary recalculations and referential changes
 * that could trigger re-renders of the `CustomizableTable` component.
 * It depends on the `onView` callback to ensure actions are up-to-date.
 */
export const useSentNotificationTableColumns = ({ onView }: UseSentNotificationTableColumnsProps) =>
  useMemo<IColumn[]>(
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
        render: (_value, row) => (
          <ThreeDotsActions
            showThreeDots={false}
            placement="right-top"
            showViewIcon
            handleViewClick={() => onView(row as INotification)}
          />
        ),
      },
    ],
    [onView]
  );
