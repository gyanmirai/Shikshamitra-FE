'use client';

import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import {
  Box,
  Tab,
  Chip,
  Tabs,
  Stack,
  Alert,
  Drawer,
  Button,
  Divider,
  Tooltip,
  Skeleton,
  IconButton,
  Typography,
  LinearProgress,
} from '@mui/material';

import { RoomStatusChip } from './RoomStatusChip';
import { RoomAuditLogPanel } from './RoomAuditLogPanel';
import { useRoomSchedule } from '../roomAvailability.hooks';
import { resolveFacility, SCHEDULE_STATUS_COLORS } from '../roomAvailability.constants';

import type { RoomAvailabilityItem } from '../types';

interface RoomDetailDrawerProps {
  open: boolean;
  room: RoomAvailabilityItem | null;
  onClose: () => void;
  onReserve?: (room: RoomAvailabilityItem) => void;
  onMaintenance?: (room: RoomAvailabilityItem) => void;
  onViewFullSchedule?: (roomId: string) => void;
}

export const RoomDetailDrawer = ({
  open,
  room,
  onClose,
  onReserve,
  onMaintenance,
  onViewFullSchedule,
}: RoomDetailDrawerProps) => {
  const tabState = useBoolean(false); // false=schedule, true=audit
  const activeTab = tabState.value ? 'audit' : 'details';

  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(dayjs());
  const scheduleHook = useRoomSchedule(room?.roomId || null, selectedDate?.format('YYYY-MM-DD'));

  useEffect(() => {
    if (open && room) {
      setSelectedDate(dayjs());
      scheduleHook.fetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, room?.roomId]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 460 },
          display: 'flex',
          flexDirection: 'column',
          borderTopLeftRadius: { sm: 16 },
          borderBottomLeftRadius: { sm: 16 },
        },
      }}
    >
      {/* ── Header ───────────────────────────────────────── */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 2.5,
          py: 2,
          borderBottom: 1,
          borderColor: 'divider',
          background: (theme) =>
            `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'primary.main',
              boxShadow: (theme) => `0 8px 16px 0 ${alpha(theme.palette.primary.main, 0.24)}`,
            }}
          >
            <Iconify icon="mdi:door" width={22} sx={{ color: 'common.white' }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              {room?.roomName || '—'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {room?.buildingName} · {room?.floorName}
            </Typography>
          </Box>
        </Stack>
        <IconButton
          onClick={onClose}
          sx={{
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Iconify icon="mdi:close" width={20} />
        </IconButton>
      </Stack>

      {/* ── Status Banner ─────────────────────────────────── */}
      {room && (
        <Box sx={{ px: 2.5, pt: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <RoomStatusChip status={room.status} />
            <Chip size="small" label={room.type} variant="outlined" sx={{ borderRadius: 1 }} />
            <Chip
              size="small"
              icon={<Iconify icon="mdi:seat" width={13} />}
              label={`${room.capacity} seats`}
              variant="outlined"
              sx={{ borderRadius: 1 }}
            />
            {room.utilizationPercentage != null && (
              <Chip
                size="small"
                label={`${room.utilizationPercentage}% utilization`}
                variant="outlined"
                sx={{ borderRadius: 1 }}
              />
            )}
          </Stack>
        </Box>
      )}

      {/* ── Tabs ─────────────────────────────────────────── */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => (v === 'audit' ? tabState.onTrue() : tabState.onFalse())}
        sx={{ px: 2, mt: 1.5 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab value="details" label="Details & Schedule" />
        <Tab value="audit" label="Audit Trail" />
      </Tabs>

      <Divider />

      {/* ── Content ──────────────────────────────────────── */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 2.5, py: 2, bgcolor: 'background.neutral' }}>
        {activeTab === 'details' && room && (
          <Stack spacing={2.5}>
            {/* Facilities */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Facilities
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {room.facilities?.length ? (
                  room.facilities.map((f) => {
                    const { label, icon } = resolveFacility(f);
                    return (
                      <Chip
                        key={f}
                        size="small"
                        icon={<Iconify icon={icon} width={14} />}
                        label={label}
                        variant="soft"
                        color="default"
                      />
                    );
                  })
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No facilities listed.
                  </Typography>
                )}
              </Stack>
            </Box>

            {/* Current Usage / Conflict — shown as a single banner when they describe the same thing */}
            {(() => {
              const usageText = room.occupiedBy || room.reservationPurpose;
              const isSameAsConflict = usageText && room.conflictReason && usageText === room.conflictReason;

              return (
                <>
                  {usageText && !isSameAsConflict && (
                    <Alert
                      severity={room.status === 'maintenance' ? 'warning' : 'info'}
                      icon={<Iconify icon="mdi:information" />}
                      sx={{ borderRadius: 1.5 }}
                    >
                      <Typography variant="subtitle2" gutterBottom>
                        Current Usage
                      </Typography>
                      <Typography variant="body2">{usageText}</Typography>
                      {room.source && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Source: {room.source}
                        </Typography>
                      )}
                    </Alert>
                  )}

                  {room.conflictReason && (
                    <Alert
                      severity={room.conflictSeverity === 'critical' ? 'error' : 'warning'}
                      sx={{ borderRadius: 1.5 }}
                    >
                      {isSameAsConflict && (
                        <Typography variant="subtitle2" gutterBottom>
                          Current Usage
                        </Typography>
                      )}
                      <Typography variant="body2">{room.conflictReason}</Typography>
                      {isSameAsConflict && room.source && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Source: {room.source}
                        </Typography>
                      )}
                      {room.nextAvailableAt && (
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                          Next available: {room.nextAvailableAt}
                        </Typography>
                      )}
                    </Alert>
                  )}
                </>
              );
            })()}

            {/* Utilization */}
            {room.utilizationPercentage != null && (
              <Box sx={{ p: 2, borderRadius: 2, border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Utilization
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="text.secondary">
                    {room.utilizationPercentage}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={room.utilizationPercentage}
                  color={
                    room.utilizationPercentage >= 80
                      ? 'error'
                      : room.utilizationPercentage >= 50
                        ? 'warning'
                        : 'success'
                  }
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            )}

            {/* Schedule Timeline */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                Schedule Timeline
              </Typography>
              <DatePicker
                label="Select Date"
                value={selectedDate}
                onChange={(newDate) => setSelectedDate(newDate)}
                slotProps={{ textField: { size: 'small', fullWidth: true, sx: { mb: 2 } } }}
              />
              {scheduleHook.isLoading ? (
                <Stack spacing={1}>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} height={44} sx={{ borderRadius: 1.5 }} />
                  ))}
                </Stack>
              ) : scheduleHook.data?.slots?.length ? (
                <Stack spacing={1}>
                  {scheduleHook.data.slots.map((slot) => {
                    const accentColor = `${SCHEDULE_STATUS_COLORS[slot.status]}.main`;
                    return (
                      <Box
                        key={slot.period}
                        sx={{
                          p: 1.5,
                          borderRadius: 1.5,
                          border: 1,
                          borderColor: 'divider',
                          borderLeft: 3,
                          borderLeftColor: accentColor,
                          bgcolor: 'background.paper',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                        }}
                      >
                        <Box sx={{ minWidth: 34 }}>
                          <Typography variant="caption" fontWeight={700} display="block">
                            {slot.period}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 92 }}>
                          <Typography variant="caption" color="text.secondary">
                            {slot.time}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ flex: 1 }}>
                          {slot.details}
                        </Typography>
                        <Chip
                          size="small"
                          label={slot.status}
                          color={SCHEDULE_STATUS_COLORS[slot.status]}
                          variant="soft"
                          sx={{ fontSize: 10, height: 20, flexShrink: 0 }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No schedule data.
                </Typography>
              )}
            </Box>
          </Stack>
        )}

        {activeTab === 'audit' && room && (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <RoomAuditLogPanel roomId={room.roomId} />
          </Box>
        )}
      </Box>

    </Drawer>
  );
};
