'use client';

import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { alpha } from '@mui/material/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomTooltip from 'src/components/custom-tooltip';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import {
  Box,
  Tab,
  Chip,
  Tabs,
  Stack,
  Alert,
  Drawer,
  Divider,
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
}

export const RoomDetailDrawer = ({ open, room, onClose }: RoomDetailDrawerProps) => {
  const tabState = useBoolean(false); // false=schedule, true=audit
  const activeTab = tabState.value ? 'audit' : 'details';

  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(dayjs());
  const [readyRoomId, setReadyRoomId] = useState<string | null>(null);
  const scheduleHook = useRoomSchedule(
    open && readyRoomId === room?.roomId ? readyRoomId : null,
    selectedDate?.format('YYYY-MM-DD')
  );

  useEffect(() => {
    if (open && room) {
      setSelectedDate(dayjs());
      setReadyRoomId(room.roomId);
    } else {
      setReadyRoomId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, room?.roomId]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: 'rgba(15, 23, 42, 0.44)',
            backdropFilter: 'blur(3px)',
          },
        },
      }}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 480 },
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          boxShadow: '-8px 0 24px -4px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      {/* ── Header ───────────────────────────────────────── */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 3,
          py: 2.5,
          borderBottom: 1,
          borderColor: 'divider',
          background: (theme) =>
            `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'primary.main',
              boxShadow: (theme) => `0 8px 16px 0 ${alpha(theme.palette.primary.main, 0.24)}`,
            }}
          >
            <Iconify icon="mdi:door" width={24} sx={{ color: 'common.white' }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                {room?.roomName || 'Room Details'}
              </Typography>
              <CustomTooltip
                title="Inspect real-time room capacity, facilities, active schedules, and audit log history."
                arrow
                placement="right"
              >
                <Iconify
                  icon={GlobalIcons.info}
                  color="info.main"
                  width={18}
                  height={18}
                  sx={{ cursor: 'pointer', mt: 0.25 }}
                />
              </CustomTooltip>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {room?.buildingName} · {room?.floorName}
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} sx={{ p: 0.5, color: 'text.secondary' }}>
          <Iconify icon="mdi:close" />
        </IconButton>
      </Stack>

      {/* ── Status Banner ─────────────────────────────────── */}
      {room && (
        <Box sx={{ px: 3, pt: 2 }}>
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
      <Box sx={{ flex: 1, overflow: 'auto', px: 3, py: 2.5, bgcolor: 'background.neutral' }}>
        {activeTab === 'details' && room && (
          <Stack spacing={2}>
            {/* Facilities */}
            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight={700}>
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

            {/* Current Usage / Conflict */}
            {(() => {
              const usageText = room.occupiedBy || room.reservationPurpose;
              const isSameAsConflict =
                usageText && room.conflictReason && usageText === room.conflictReason;

              return (
                <>
                  {usageText && !isSameAsConflict && (
                    <Alert
                      severity={room.status === 'maintenance' ? 'warning' : 'info'}
                      icon={<Iconify icon="mdi:information" />}
                      sx={{ borderRadius: 1.5 }}
                    >
                      <Typography variant="subtitle2" gutterBottom fontWeight={700}>
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
                        <Typography variant="subtitle2" gutterBottom fontWeight={700}>
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
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: 1,
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              >
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
              {!readyRoomId || scheduleHook.isLoading || scheduleHook.isFetching ? (
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
                          gap: 1,
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
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          sx={{ flex: 1 }}
                        >
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
