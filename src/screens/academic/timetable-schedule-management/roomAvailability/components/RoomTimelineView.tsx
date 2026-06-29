'use client';

import { Iconify } from 'src/components/iconify';
import { Box, Chip, Stack, Paper, Tooltip, Typography } from '@mui/material';

import { MOCK_SCHEDULES } from '../roomAvailability.mock';
import { SCHEDULE_STATUS_COLORS } from '../roomAvailability.constants';

import type { RoomAvailabilityItem } from '../types';

const PERIODS = [
  { key: 'p1', label: 'P1', time: '09:00–09:45' },
  { key: 'p2', label: 'P2', time: '10:00–10:45' },
  { key: 'p3', label: 'P3', time: '11:00–11:45' },
  { key: 'p4', label: 'P4', time: '12:00–12:45' },
  { key: 'p5', label: 'P5', time: '13:30–14:15' },
];

const STATUS_BG: Record<string, string> = {
  free: 'success.lighter',
  class: 'warning.lighter',
  exam: 'info.lighter',
  event: 'grey.200',
  maintenance: 'error.lighter',
  reserved: 'primary.lighter',
};

interface RoomTimelineViewProps {
  rooms: RoomAvailabilityItem[];
  onBlockClick?: (roomId: string, period: string) => void;
  onEmptySlotClick?: (roomId: string, period: string, startTime: string) => void;
}

export const RoomTimelineView = ({
  rooms,
  onBlockClick,
  onEmptySlotClick,
}: RoomTimelineViewProps) => (
  <Box sx={{ overflowX: 'auto' }}>
    <Box sx={{ minWidth: 700 }}>
      {/* Header row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '160px repeat(5, 1fr)',
          gap: 0.5,
          mb: 0.5,
        }}
      >
        <Box sx={{ p: 1 }} />
        {PERIODS.map((p) => (
          <Box
            key={p.key}
            sx={{
              p: 1,
              textAlign: 'center',
              borderRadius: 1,
              bgcolor: 'action.hover',
            }}
          >
            <Typography variant="caption" fontWeight={700}>
              {p.label}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {p.time}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Room rows */}
      {rooms.map((room) => {
        const schedule = MOCK_SCHEDULES[room.roomId];
        const slots = schedule?.slots || [];

        return (
          <Box
            key={room.roomId}
            sx={{
              display: 'grid',
              gridTemplateColumns: '160px repeat(5, 1fr)',
              gap: 0.5,
              mb: 0.5,
            }}
          >
            {/* Room label */}
            <Box
              sx={{
                p: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                borderRadius: 1,
                border: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Iconify icon="mdi:door" width={16} color="text.secondary" />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" fontWeight={600} noWrap>
                  {room.roomName}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" noWrap>
                  {room.capacity} seats
                </Typography>
              </Box>
            </Box>

            {/* Period blocks */}
            {PERIODS.map((p, idx) => {
              const slot = slots[idx];
              const status = slot?.status || 'free';
              const isEmpty = !slot || status === 'free';

              return (
                <Tooltip
                  key={p.key}
                  title={
                    isEmpty
                      ? `Click to reserve ${room.roomName} at ${p.time}`
                      : `${room.roomName} · ${p.time} · ${slot?.details}`
                  }
                  arrow
                >
                  <Paper
                    elevation={0}
                    onClick={() => {
                      if (isEmpty) {
                        onEmptySlotClick?.(room.roomId, p.key, p.time.split('–')[0]);
                      } else {
                        onBlockClick?.(room.roomId, p.key);
                      }
                    }}
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      border: 1,
                      borderColor: isEmpty ? 'divider' : `${SCHEDULE_STATUS_COLORS[status]}.light`,
                      bgcolor: isEmpty ? 'background.paper' : STATUS_BG[status],
                      cursor: 'pointer',
                      minHeight: 48,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      transition: 'all 0.15s',
                      '&:hover': {
                        opacity: 0.85,
                        transform: 'scale(1.01)',
                      },
                    }}
                  >
                    {isEmpty ? (
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="center"
                        spacing={0.5}
                      >
                        <Iconify icon="mdi:plus" width={14} color="text.disabled" />
                        <Typography variant="caption" color="text.disabled">
                          Free
                        </Typography>
                      </Stack>
                    ) : (
                      <>
                        <Chip
                          size="small"
                          label={slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}
                          color={SCHEDULE_STATUS_COLORS[slot.status]}
                          variant="soft"
                          sx={{ fontSize: 9, height: 16, mb: 0.25 }}
                        />
                        <Typography variant="caption" noWrap sx={{ fontSize: 10 }}>
                          {slot.details}
                        </Typography>
                        {slot.teacher && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            sx={{ fontSize: 9 }}
                          >
                            {slot.teacher}
                          </Typography>
                        )}
                      </>
                    )}
                  </Paper>
                </Tooltip>
              );
            })}
          </Box>
        );
      })}

      {rooms.length === 0 && (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Iconify icon="mdi:calendar-blank" width={48} color="text.disabled" />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            No rooms to display in timeline.
          </Typography>
        </Box>
      )}
    </Box>

    {/* Legend */}
    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
      {['free', 'class', 'exam', 'event', 'maintenance', 'reserved'].map((s) => (
        <Chip
          key={s}
          size="small"
          label={s.charAt(0).toUpperCase() + s.slice(1)}
          color={SCHEDULE_STATUS_COLORS[s] as any}
          variant="soft"
          sx={{ fontSize: 10 }}
        />
      ))}
    </Stack>
  </Box>
);
