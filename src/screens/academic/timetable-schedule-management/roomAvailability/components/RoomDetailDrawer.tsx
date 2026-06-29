'use client';

import { useEffect } from 'react';
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
import { useRoomSchedule, useRoomAuditLogs } from '../roomAvailability.hooks';
import {
  FACILITY_ICONS,
  FACILITY_LABELS,
  SCHEDULE_STATUS_COLORS,
} from '../roomAvailability.constants';

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

  const scheduleHook = useRoomSchedule(room?.roomId || null);
  const auditHook = useRoomAuditLogs(room?.roomId || null);

  useEffect(() => {
    if (open && room) {
      scheduleHook.fetch();
      auditHook.fetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, room?.roomId]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 460 }, display: 'flex', flexDirection: 'column' },
      }}
    >
      {/* ── Header ───────────────────────────────────────── */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2.5, py: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'primary.lighter',
            }}
          >
            <Iconify icon="mdi:door" width={22} color="primary.main" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
              {room?.roomName || '—'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {room?.buildingName} · {room?.floorName}
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose}>
          <Iconify icon="mdi:close" />
        </IconButton>
      </Stack>

      {/* ── Status Banner ─────────────────────────────────── */}
      {room && (
        <Box sx={{ px: 2.5, pt: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <RoomStatusChip status={room.status} />
            <Chip size="small" label={room.type} variant="outlined" />
            <Chip
              size="small"
              icon={<Iconify icon="mdi:seat" width={13} />}
              label={`${room.capacity} seats`}
              variant="outlined"
            />
            {room.utilizationPercentage != null && (
              <Chip
                size="small"
                label={`${room.utilizationPercentage}% utilization`}
                variant="outlined"
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
      <Box sx={{ flex: 1, overflow: 'auto', px: 2.5, py: 2 }}>
        {activeTab === 'details' && room && (
          <Stack spacing={2.5}>
            {/* Facilities */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Facilities
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {room.facilities?.length ? (
                  room.facilities.map((f) => (
                    <Chip
                      key={f}
                      size="small"
                      icon={<Iconify icon={FACILITY_ICONS[f]} width={14} />}
                      label={FACILITY_LABELS[f]}
                      variant="soft"
                      color="default"
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No facilities listed.
                  </Typography>
                )}
              </Stack>
            </Box>

            {/* Current Usage */}
            {(room.occupiedBy || room.reservationPurpose) && (
              <Alert
                severity={room.status === 'maintenance' ? 'warning' : 'info'}
                icon={<Iconify icon="mdi:information" />}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Current Usage
                </Typography>
                <Typography variant="body2">
                  {room.occupiedBy || room.reservationPurpose}
                </Typography>
                {room.source && (
                  <Typography variant="caption" color="text.secondary">
                    Source: {room.source}
                  </Typography>
                )}
              </Alert>
            )}

            {/* Conflict */}
            {room.conflictReason && (
              <Alert severity={room.conflictSeverity === 'critical' ? 'error' : 'warning'}>
                {room.conflictReason}
                {room.nextAvailableAt && (
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                    Next available: {room.nextAvailableAt}
                  </Typography>
                )}
              </Alert>
            )}

            {/* Utilization */}
            {room.utilizationPercentage != null && (
              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography variant="subtitle2">Utilization</Typography>
                  <Typography variant="body2" color="text.secondary">
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

            {/* Today Schedule */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Today Schedule
              </Typography>
              {scheduleHook.isLoading ? (
                <Stack spacing={1}>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} height={44} />
                  ))}
                </Stack>
              ) : scheduleHook.data?.slots?.length ? (
                <Stack spacing={1}>
                  {scheduleHook.data.slots.map((slot) => (
                    <Box
                      key={slot.period}
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        border: 1,
                        borderColor: 'divider',
                        display: 'grid',
                        gridTemplateColumns: '100px 110px 1fr auto',
                        gap: 1,
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="caption" fontWeight={600}>
                        {slot.period}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {slot.time}
                      </Typography>
                      <Typography variant="caption" noWrap>
                        {slot.details}
                      </Typography>
                      <Chip
                        size="small"
                        label={slot.status}
                        color={SCHEDULE_STATUS_COLORS[slot.status]}
                        variant="soft"
                        sx={{ fontSize: 10, height: 20 }}
                      />
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No schedule data.
                </Typography>
              )}
            </Box>
          </Stack>
        )}

        {activeTab === 'audit' && (
          <Stack spacing={1.5}>
            {auditHook.isLoading ? (
              [1, 2, 3].map((i) => <Skeleton key={i} height={60} />)
            ) : auditHook.data.length ? (
              auditHook.data.map((log) => (
                <Box
                  key={log.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="subtitle2">{log.action}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ ml: 1 }}>
                      {log.dateTime}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    By {log.user}
                  </Typography>
                  {log.newValue && (
                    <Typography
                      variant="caption"
                      color="text.primary"
                      display="block"
                      sx={{ mt: 0.5 }}
                    >
                      {log.newValue}
                    </Typography>
                  )}
                  {log.remarks && (
                    <Typography variant="caption" color="text.secondary">
                      {log.remarks}
                    </Typography>
                  )}
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No audit trail for this room.
              </Typography>
            )}
          </Stack>
        )}
      </Box>

      {/* ── Footer Actions ────────────────────────────────── */}
      <Divider />
      <Stack direction="row" spacing={1} sx={{ p: 2 }} flexWrap="wrap">
        {onReserve && room && (
          <Button
            size="small"
            variant="contained"
            disabled={room.status !== 'available'}
            startIcon={<Iconify icon="mdi:calendar-plus" />}
            onClick={() => onReserve(room)}
          >
            Reserve
          </Button>
        )}
        {onViewFullSchedule && room && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:calendar-month" />}
            onClick={() => onViewFullSchedule(room.roomId)}
          >
            Full Schedule
          </Button>
        )}
        {onMaintenance && room && (
          <Tooltip title="Mark for Maintenance">
            <Button
              size="small"
              variant="outlined"
              color="warning"
              startIcon={<Iconify icon="mdi:wrench" />}
              onClick={() => onMaintenance(room)}
            >
              Maintenance
            </Button>
          </Tooltip>
        )}
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<Iconify icon="mdi:qrcode" />}
        >
          QR Code
        </Button>
      </Stack>
    </Drawer>
  );
};
