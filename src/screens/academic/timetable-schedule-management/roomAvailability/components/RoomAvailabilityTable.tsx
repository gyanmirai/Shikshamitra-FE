'use client';

import { Iconify } from 'src/components/iconify';
import { Box, Stack, Tooltip, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

import { RoomStatusChip } from './RoomStatusChip';
import { resolveFacility } from '../roomAvailability.constants';

import type { RoomAvailabilityItem } from '../types';

interface RoomAvailabilityTableProps {
  data: RoomAvailabilityItem[];
  isLoading?: boolean;
  canReserve?: boolean;
  canApprove?: boolean;
  onViewRoom?: (roomId: string) => void;
  onReserveRoom?: (item: RoomAvailabilityItem) => void;
  onViewSchedule?: (roomId: string) => void;
  onCancelReservation?: (item: RoomAvailabilityItem) => void;
}

const FacilityIcons = ({ facilities }: { facilities: string[] }) => (
  <Stack direction="row" spacing={1} flexWrap="wrap">
    {facilities.slice(0, 4).map((f) => {
      const { label, icon } = resolveFacility(f);
      return (
        <Tooltip key={f} title={label} arrow>
          <Box sx={{ color: 'text.secondary', display: 'grid', placeItems: 'center' }}>
            <Iconify icon={icon} width={15} />
          </Box>
        </Tooltip>
      );
    })}
    {facilities.length > 4 && (
      <Typography variant="caption" color="text.secondary">
        +{facilities.length - 4}
      </Typography>
    )}
  </Stack>
);

export const RoomAvailabilityTable = ({
  data,
  isLoading,
  canReserve = true,
  canApprove = false,
  onViewRoom,
  onReserveRoom,
  onViewSchedule,
  onCancelReservation,
}: RoomAvailabilityTableProps) => (
  <CustomizableTable
    tableContainerProps={{ sx: { height: '100%' } }}
    tableId="room-availability-enhanced-table"
    tableTitle="Room Availability"
    data={data}
    isLoading={isLoading}
    handleRowClick={(row) => onViewRoom?.((row as RoomAvailabilityItem).roomId)}
    rowProps={(row) => ({
      tabIndex: onViewRoom ? 0 : -1,
      'aria-label': `View details for ${(row as RoomAvailabilityItem).roomName}`,
      onKeyDown: (event) => {
        if (event.target !== event.currentTarget || !onViewRoom) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onViewRoom((row as RoomAvailabilityItem).roomId);
        }
      },
      sx: {
        cursor: onViewRoom ? 'pointer' : 'default',
        '&:focus-visible': {
          outline: (theme) => `2px solid ${theme.palette.primary.main}`,
          outlineOffset: -2,
        },
      },
    })}
    columns={[
      {
        id: 'roomName',
        label: 'Room',
        minWidth: 160,
        sticky: true,
        render: (_v, row) => (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'action.hover',
                flexShrink: 0,
              }}
            >
              <Iconify icon="mdi:door" width={18} color="text.secondary" />
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={600} noWrap>
                {row.roomName}
              </Typography>
              {row.roomCode && (
                <Typography variant="caption" color="text.secondary">
                  {row.roomCode}
                </Typography>
              )}
            </Box>
          </Stack>
        ),
      },
      { id: 'buildingName', label: 'Building', minWidth: 120 },
      {
        id: 'floorName',
        label: 'Floor',
        minWidth: 90,
        render: (v) => v || '—',
      },
      { id: 'type', label: 'Type', minWidth: 130 },
      {
        id: 'facilities',
        label: 'Facilities',
        filterType: 'string' as const,
        minWidth: 130,
        minWidth: 130,
        isSort: false,
        isFilter: false,
        render: (_v, row) => <FacilityIcons facilities={row.facilities || []} />,
      },
      {
        id: 'capacity',
        label: 'Capacity',
        filterType: 'number',
        minWidth: 100,
        render: (v) => (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="mdi:seat" width={14} color="text.secondary" />
            <Typography variant="body2">{v}</Typography>
          </Stack>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        minWidth: 120,
        filterType: 'enum',
        sticky: true,
        stickyPosition: 'right',
        enumOptions: [
          { label: 'Available', value: 'available' },
          { label: 'Occupied', value: 'occupied' },
          { label: 'Pending Approval', value: 'pendingApproval' },
          { label: 'Maintenance', value: 'maintenance' },
        ],
        render: (_v, row) => <RoomStatusChip status={row.status} />,
      },
      {
        id: 'actions',
        label: 'Actions',
        minWidth: 120,
        width: 120,
        isSort: false,
        isFilter: false,
        sticky: true,
        stickyPosition: 'right',
        render: (_v, row) => {
          const item = row as RoomAvailabilityItem;
          const underMaintenance = item.status === 'maintenance';
          const actions = [
            ...(onViewSchedule
              ? [
                  {
                    id: 'schedule',
                    label: `View schedule for ${item.roomName}`,
                    icon: 'solar:calendar-bold-duotone',
                    onClick: () => onViewSchedule(item.roomId),
                  },
                ]
              : []),
            ...(canReserve
              ? [
                  {
                    id: 'reserve',
                    label: `Reserve ${item.roomName}`,
                    icon: 'mdi:calendar-plus',
                    disabled: underMaintenance,
                    tooltip: underMaintenance
                      ? 'Room under maintenance — reservations blocked'
                      : 'Reserve room',
                    onClick: () => onReserveRoom?.(item),
                  },
                ]
              : []),
            ...(canApprove && item.status === 'pendingApproval'
              ? [
                  {
                    id: 'approval',
                    label: `View approval for ${item.roomName}`,
                    icon: 'mdi:check-decagram',
                    onClick: () => onCancelReservation?.(item),
                  },
                ]
              : []),
          ];

          return (
            <AdaptiveThreeDotsActions
              moreLabel={`More actions for ${item.roomName}`}
              actions={actions}
              placement="left-top"
            />
          );
        },
      },
    ]}
  />
);
