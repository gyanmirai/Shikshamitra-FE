'use client';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Chip, Stack, Tooltip, IconButton, Typography, LinearProgress } from '@mui/material';

import { RoomStatusChip, ConflictSeverityChip } from './RoomStatusChip';
import { FACILITY_ICONS, FACILITY_LABELS } from '../roomAvailability.constants';

import type { RoomFacility, RoomAvailabilityItem } from '../types';

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

const FacilityIcons = ({ facilities }: { facilities: RoomFacility[] }) => (
  <Stack direction="row" spacing={0.5} flexWrap="wrap">
    {facilities.slice(0, 4).map((f) => (
      <Tooltip key={f} title={FACILITY_LABELS[f]} arrow>
        <Box sx={{ color: 'text.secondary', display: 'grid', placeItems: 'center' }}>
          <Iconify icon={FACILITY_ICONS[f]} width={15} />
        </Box>
      </Tooltip>
    ))}
    {facilities.length > 4 && (
      <Typography variant="caption" color="text.secondary">
        +{facilities.length - 4}
      </Typography>
    )}
  </Stack>
);

const UtilizationBar = ({ value }: { value?: number }) => {
  if (value == null)
    return (
      <Typography variant="caption" color="text.disabled">
        —
      </Typography>
    );
  const color = value >= 80 ? 'error' : value >= 50 ? 'warning' : 'success';
  return (
    <Box sx={{ minWidth: 80 }}>
      <Stack direction="row" alignItems="center" spacing={0.75}>
        <LinearProgress
          variant="determinate"
          value={value}
          color={color as any}
          sx={{ flex: 1, height: 6, borderRadius: 3 }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
          {value}%
        </Typography>
      </Stack>
    </Box>
  );
};

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
        id: 'occupiedBy',
        label: 'Occupied By',
        minWidth: 200,
        render: (_v, row) =>
          row.occupiedBy || row.reservationPurpose ? (
            <Typography variant="body2" noWrap sx={{ maxWidth: 190 }}>
              {row.occupiedBy || row.reservationPurpose}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.disabled">
              —
            </Typography>
          ),
      },
      {
        id: 'source',
        label: 'Source',
        minWidth: 140,
        render: (v) => (
          <Chip size="small" label={v || 'Free'} variant="outlined" sx={{ fontSize: 11 }} />
        ),
      },
      {
        id: 'conflictReason',
        label: 'Conflict Reason',
        minWidth: 220,
        render: (_v, row) =>
          row.conflictReason ? (
            <Stack direction="row" alignItems="flex-start" spacing={0.75}>
              {row.conflictSeverity && <ConflictSeverityChip severity={row.conflictSeverity} />}
              <Typography variant="caption" color="error.main" sx={{ maxWidth: 150 }} noWrap>
                {row.conflictReason}
              </Typography>
            </Stack>
          ) : (
            <Typography variant="body2" color="text.disabled">
              No conflict
            </Typography>
          ),
      },
      {
        id: 'nextAvailableAt',
        label: 'Next Available',
        minWidth: 130,
        render: (v) =>
          v ? (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Iconify icon="mdi:clock-outline" width={14} color="text.secondary" />
              <Typography variant="body2">{v}</Typography>
            </Stack>
          ) : (
            <Typography variant="body2" color="success.main">
              Now
            </Typography>
          ),
      },
      {
        id: 'utilizationPercentage',
        label: 'Utilization',
        minWidth: 130,
        render: (_v, row) => <UtilizationBar value={row.utilizationPercentage} />,
      },
      {
        id: 'lastUpdatedAt',
        label: 'Last Updated',
        minWidth: 120,
        render: (v) => (
          <Typography variant="caption" color="text.secondary">
            {v || '—'}
          </Typography>
        ),
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
                    onClick={() => onReserveRoom?.(row)}
                    color="primary"
                  >
                    <Iconify icon="mdi:calendar-plus" width={18} />
                  </IconButton>
                </span>
              </Tooltip>
            )}

            <Tooltip title="View Schedule">
              <IconButton size="small" onClick={() => onViewSchedule?.(row.roomId)}>
                <Iconify icon="mdi:calendar-month" width={18} />
              </IconButton>
            </Tooltip>

            {canMaintenance && (
              <Tooltip title="Mark Maintenance">
                <span>
                  <IconButton
                    size="small"
                    disabled={row.status === 'maintenance'}
                    onClick={() => onMarkMaintenance?.(row)}
                    color="warning"
                  >
                    <Iconify icon="mdi:wrench" width={18} />
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {canApprove && row.status === 'pendingApproval' && (
              <Tooltip title="View Approval">
                <IconButton size="small" color="info" onClick={() => onCancelReservation?.(row)}>
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
