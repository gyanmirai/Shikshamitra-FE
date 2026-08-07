'use client';

import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import {
  Box,
  Card,
  Chip,
  Stack,
  Tooltip,
  Skeleton,
  Typography,
  CardContent,
  CardActionArea,
} from '@mui/material';

import { RoomStatusChip } from './RoomStatusChip';
import { FACILITY_ICONS, FACILITY_LABELS } from '../roomAvailability.constants';

import type { RoomAvailabilityItem } from '../types';

const STATUS_BORDER: Record<string, string> = {
  available: 'success.main',
  occupied: 'warning.main',
  reserved: 'info.main',
  maintenance: 'error.main',
  blocked: 'error.main',
  conflict: 'error.main',
  pendingApproval: 'warning.light',
  checkedIn: 'success.main',
  noShow: 'grey.500',
  completed: 'grey.400',
};

const STATUS_BG: Record<string, string> = {
  available: 'success.lighter',
  occupied: 'warning.lighter',
  reserved: 'info.lighter',
  maintenance: 'error.lighter',
  blocked: 'error.lighter',
  conflict: 'error.lighter',
  pendingApproval: 'warning.lighter',
  checkedIn: 'success.lighter',
  noShow: 'grey.100',
  completed: 'grey.50',
};

interface RoomFloorViewProps {
  rooms: RoomAvailabilityItem[];
  isLoading?: boolean;
  onRoomClick?: (room: RoomAvailabilityItem) => void;
  onReserveRoom?: (room: RoomAvailabilityItem) => void;
}

export const RoomFloorView = ({
  rooms,
  isLoading = false,
  onRoomClick,
  onReserveRoom,
}: RoomFloorViewProps) => {
  const [selectedBuilding, setSelectedBuilding] = useState('all');
  const [selectedFloor, setSelectedFloor] = useState('all');

  const buildings = ['all', ...new Set(rooms.map((r) => r.buildingName))];
  const buildingOpts = buildings.map((b) => ({
    value: b,
    label: b === 'all' ? 'All Buildings' : b,
  }));

  const filtered = rooms.filter((r) => {
    const matchBuilding = selectedBuilding === 'all' || r.buildingName === selectedBuilding;
    const matchFloor = selectedFloor === 'all' || r.floorName === selectedFloor;
    return matchBuilding && matchFloor;
  });

  // Group by building
  const grouped = filtered.reduce<Record<string, RoomAvailabilityItem[]>>((acc, room) => {
    const key = room.buildingName;
    if (!acc[key]) acc[key] = [];
    acc[key].push(room);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <Skeleton variant="rectangular" width={180} height={40} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={150} height={40} sx={{ borderRadius: 1 }} />
        </Stack>
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} variant="rectangular" height={130} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      {/* Controls */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1.5}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:floor-plan" width={20} color="primary.main" />
          <Typography variant="subtitle1" fontWeight={700}>
            Floor & Room Map
          </Typography>
          <CustomTooltip title="Visual grid layout of all rooms organized by building and floor." arrow placement="right">
            <Iconify icon={GlobalIcons.info} color="info.main" width={16} height={16} sx={{ cursor: 'pointer' }} />
          </CustomTooltip>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <CustomSelect
            label="Building"
            options={buildingOpts}
            value={selectedBuilding}
            onChange={(v) => setSelectedBuilding(v as string)}
            formControlProps={{ sx: { minWidth: 180 } }}
          />
          <CustomSelect
            label="Floor"
            options={[
              { value: 'all', label: 'All Floors' },
              ...Array.from(new Set(rooms.map((r) => r.floorName).filter(Boolean))).map((f) => ({
                value: f!,
                label: f!,
              })),
            ]}
            value={selectedFloor}
            onChange={(v) => setSelectedFloor(v as string)}
            formControlProps={{ sx: { minWidth: 150 } }}
          />
        </Stack>
      </Stack>

      {/* Building groups */}
      {Object.entries(grouped).map(([building, buildingRooms]) => (
        <Box key={building}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
            <Iconify icon="mdi:office-building" width={18} color="primary.main" />
            <Typography variant="subtitle1" fontWeight={600}>
              {building}
            </Typography>
            <Chip size="small" label={`${buildingRooms.length} rooms`} variant="outlined" />
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gap: 1,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
                lg: 'repeat(4, minmax(0, 1fr))',
              },
            }}
          >
            {buildingRooms.map((room) => (
              <Box key={room.roomId}>
                <Card
                  sx={{
                    border: 2,
                    borderColor: STATUS_BORDER[room.status] || 'divider',
                    bgcolor: STATUS_BG[room.status] || 'background.paper',
                    height: '100%',
                    transition: 'all 0.15s',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
                  }}
                >
                  <CardActionArea onClick={() => onRoomClick?.(room)} sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        sx={{ mb: 1 }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle2" fontWeight={700} noWrap>
                            {room.roomName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {room.floorName} · {room.type}
                          </Typography>
                        </Box>
                        <Iconify
                          icon={
                            room.status === 'available'
                              ? 'mdi:door-open'
                              : room.status === 'maintenance'
                                ? 'mdi:wrench'
                                : 'mdi:door-closed'
                          }
                          width={22}
                          color={STATUS_BORDER[room.status] || 'text.secondary'}
                          sx={{ flexShrink: 0 }}
                        />
                      </Stack>

                      <RoomStatusChip status={room.status} showIcon={false} />

                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                        <Iconify icon="mdi:seat" width={13} color="text.secondary" />
                        <Typography variant="caption" color="text.secondary">
                          {room.capacity} seats
                        </Typography>
                      </Stack>

                      {(room.occupiedBy || room.reservationPurpose) && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          display="block"
                          sx={{ mt: 0.5 }}
                        >
                          {room.occupiedBy || room.reservationPurpose}
                        </Typography>
                      )}

                      {room.nextAvailableAt && (
                        <Typography
                          variant="caption"
                          color="warning.main"
                          display="block"
                          sx={{ mt: 0.25 }}
                        >
                          Free at {room.nextAvailableAt}
                        </Typography>
                      )}

                      {/* Facilities */}
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                        {room.facilities?.slice(0, 4).map((f) => (
                          <Tooltip key={f} title={FACILITY_LABELS[f]} arrow>
                            <Box sx={{ color: 'text.secondary' }}>
                              <Iconify icon={FACILITY_ICONS[f]} width={13} />
                            </Box>
                          </Tooltip>
                        ))}
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>
      ))}

      {filtered.length === 0 && (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Iconify icon="mdi:office-building-outline" width={48} color="text.disabled" />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            No rooms match the selected building / floor.
          </Typography>
        </Box>
      )}
    </Stack>
  );
};
