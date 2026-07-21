import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Chip, Stack, Tooltip, Collapse, Typography, IconButton } from '@mui/material';

import {
  ROOM_STATUS_ICONS,
  ROOM_STATUS_LABELS,
  ROOM_STATUS_COLORS,
} from '../roomAvailability.constants';

import type { RoomStatus } from '../types';

const STATUS_TOOLTIPS: Record<RoomStatus, string> = {
  available: 'Room is free and can be booked.',
  occupied: 'Room is in use per timetable.',
  reserved: 'Room has an approved reservation.',
  maintenance: 'Room is blocked for maintenance work.',
  blocked: 'Room is administratively blocked.',
  conflict: 'There is a scheduling conflict with this room.',
  pendingApproval: 'Reservation is awaiting approval.',
  checkedIn: 'Occupant has checked in.',
  noShow: 'No one checked in after the grace period.',
  completed: 'Session has ended and room is released.',
};

const VISIBLE_STATUSES: RoomStatus[] = [
  'available',
  'occupied',
  'reserved',
  'maintenance',
  'conflict',
  'blocked',
  'pendingApproval',
  'noShow',
  'completed',
];

export const RoomStatusLegend = () => {
  const show = useBoolean(false);

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="caption" color="text.secondary">
          Status Legend
        </Typography>
        <IconButton size="small" onClick={show.onToggle} sx={{ p: 0.25 }}>
          <Iconify icon={show.value ? 'mdi:chevron-up' : 'mdi:chevron-down'} width={16} />
        </IconButton>
      </Stack>

      <Collapse in={show.value}>
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
          {VISIBLE_STATUSES.map((status) => (
            <Tooltip key={status} title={STATUS_TOOLTIPS[status]} arrow>
              <Chip
                size="small"
                label={ROOM_STATUS_LABELS[status]}
                color={ROOM_STATUS_COLORS[status]}
                variant="soft"
                icon={<Iconify icon={ROOM_STATUS_ICONS[status]} width={13} />}
                sx={{ cursor: 'help' }}
              />
            </Tooltip>
          ))}
        </Stack>
      </Collapse>
    </Box>
  );
};
