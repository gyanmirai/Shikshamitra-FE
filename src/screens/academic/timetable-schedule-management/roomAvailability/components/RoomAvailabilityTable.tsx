'use client';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Stack, Tooltip, IconButton, Typography } from '@mui/material';

import { RoomStatusChip } from './RoomStatusChip';
import { resolveFacility } from '../roomAvailability.constants';

import type { RoomAvailabilityItem } from '../types';

interface RoomAvailabilityTableProps {
  data: RoomAvailabilityItem[];
  isLoading?: boolean;
  canReserve?: boolean;
  canMaintenance?: boolean;
  canApprove?: boolean;
  onViewRoom?: (roomId: string) => void;
  onReserveRoom?: (item: RoomAvailabilityItem) => void;
  onViewSchedule?: (roomId: string) => void;
  onMarkMaintenance?: (item: RoomAvailabilityItem) => void;
  onCancelReservation?: (item: RoomAvailabilityItem) => void;
}

const FacilityIcons = ({ facilities }: { facilities: string[] }) => (
  <Stack direction="row" spacing={0.5} flexWrap="wrap">
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
  canMaintenance = false,
  canApprove = false,
  onViewRoom,
  onReserveRoom,
  onViewSchedule,
  onMarkMaintenance,
  onCancelReservation,
}: RoomAvailabilityTableProps) => (
  <CustomizableTable
    tableId="room-availability-enhanced-table"
    tableTitle="Room Availability"
    data={data}
    isLoading={isLoading}
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
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Iconify icon="mdi:seat" width={14} color="text.secondary" />
            <Typography variant="body2">{v}</Typography>
          </Stack>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        minWidth: 140,
        render: (_v, row) => <RoomStatusChip status={row.status} />,
      },
      {
        id: 'actions',
        label: 'Actions',
        minWidth: 160,
        isSort: false,
        isFilter: false,
        sticky: true,
        stickyPosition: 'right',
        render: (_v, row) => (
          <Stack direction="row" spacing={0.5} justifyContent="center">
            <Tooltip title="View Room Details">
              <IconButton size="small" onClick={() => onViewRoom?.(row.roomId)}>
                <Iconify icon={GlobalIcons.eye} width={18} />
              </IconButton>
            </Tooltip>

            {canReserve && (
              <Tooltip title={row.status !== 'available' ? 'Room not available' : 'Reserve Room'}>
                <span>
                  <IconButton
                    size="small"
                    disabled={row.status !== 'available'}
                    onClick={() => onReserveRoom?.(row as RoomAvailabilityItem)}
                    color="primary"
                  >
                    <Iconify icon="mdi:calendar-plus" width={18} />
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {canApprove && row.status === 'pendingApproval' && (
              <Tooltip title="View Approval">
                <IconButton
                  size="small"
                  color="info"
                  onClick={() => onCancelReservation?.(row as RoomAvailabilityItem)}
                >
                  <Iconify icon="mdi:check-decagram" width={18} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        ),
      },
    ]}
  />
);
