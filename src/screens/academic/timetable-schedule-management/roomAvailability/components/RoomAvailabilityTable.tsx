'use client';

import { Box, MenuList, MenuItem, Stack, Tooltip, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

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
  canMaintenance = false,
  canApprove = false,
  onViewRoom,
  onReserveRoom,
  onViewSchedule,
  onMarkMaintenance,
  onCancelReservation,
}: RoomAvailabilityTableProps) => {
  // Row action menu — rendered inside the ThreeDotsActions popover. Each item
  // closes the popover before firing its handler. Visibility/`disabled` mirror
  // the previous Tooltip+IconButton gating.
  const renderRowActions = ({ popover, row }: { popover: any; row: RoomAvailabilityItem }) => {
    const close = () => popover.onClose();
    const underMaintenance = row.status === 'maintenance';

    return (
      <MenuList>
        {canReserve && (
          <Tooltip
            title={underMaintenance ? 'Room under maintenance — reservations blocked' : 'Reserve Room'}
            placement="left"
          >
            <span>
              <MenuItem
                disabled={underMaintenance}
                onClick={() => {
                  close();
                  onReserveRoom?.(row);
                }}
              >
                <Iconify icon="mdi:calendar-plus" />
                Reserve Room
              </MenuItem>
            </span>
          </Tooltip>
        )}

        {onViewSchedule && (
          <MenuItem
            onClick={() => {
              close();
              onViewSchedule(row.roomId);
            }}
          >
            <Iconify icon="mdi:calendar-clock" />
            View Schedule
          </MenuItem>
        )}

        {canMaintenance && (
          <MenuItem
            onClick={() => {
              close();
              onMarkMaintenance?.(row);
            }}
          >
            <Iconify icon="mdi:wrench" />
            Mark Maintenance
          </MenuItem>
        )}

        {canApprove && row.status === 'pendingApproval' && (
          <MenuItem
            onClick={() => {
              close();
              onCancelReservation?.(row);
            }}
          >
            <Iconify icon="mdi:check-decagram" />
            View Approval
          </MenuItem>
        )}
      </MenuList>
    );
  };

  return (
    <CustomizableTable
      tableContainerProps={{ sx: { height: '100%' } }}
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
          minWidth: 50,
          width: 50,
          isSort: false,
          isFilter: false,
          sticky: true,
          stickyPosition: 'right',
          render: (_v, row) => {
            const item = row as RoomAvailabilityItem;
            return (
              <ThreeDotsActions
                showViewIcon
                showThreeDots={Boolean(
                  canReserve || canMaintenance || canApprove || onViewSchedule
                )}
                handleViewClick={() => onViewRoom?.(item.roomId)}
                actions={(prop) => renderRowActions({ ...prop, row: item })}
                placement="left-top"
              />
            );
          },
        },
      ]}
    />
  );
};
