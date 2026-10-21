import { Iconify } from 'src/components/iconify';
import { Box, Stack, Tooltip, IconButton, Typography } from '@mui/material';

import type { SeatingRoomLayout } from '../../types';

interface Props {
  room: SeatingRoomLayout;
  occupied: number;
  usable: number;
  zoom: number;
  onZoom: (zoom: number) => void;
}

export function RoomStudioToolbar({ room, occupied, usable, zoom, onZoom }: Props) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      flexWrap="wrap"
      useFlexGap
      gap={1}
      sx={{ pb: 1.5 }}
    >
      <Stack spacing={0.25}>
        <Typography variant="subtitle2">{room.roomName}</Typography>
        <Typography
          variant="caption"
          color={occupied > usable ? 'error.main' : 'text.secondary'}
          aria-live="polite"
        >
          {occupied} occupied · {Math.max(0, usable - occupied)} open · {room.benchCapacity} per
          bench
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Tooltip title="Zoom out">
          <IconButton
            size="small"
            aria-label="Zoom out"
            disabled={zoom <= 0.7}
            onClick={() => onZoom(Math.max(0.7, zoom - 0.1))}
          >
            <Iconify icon="mdi:magnify-minus-outline" width={18} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Reset zoom">
          <IconButton size="small" aria-label="Reset zoom" onClick={() => onZoom(1)}>
            <Iconify icon="mdi:fit-to-page-outline" width={18} />
          </IconButton>
        </Tooltip>
        <Typography variant="caption" sx={{ minWidth: 36, textAlign: 'center' }}>
          {Math.round(zoom * 100)}%
        </Typography>
        <Tooltip title="Zoom in">
          <IconButton
            size="small"
            aria-label="Zoom in"
            disabled={zoom >= 1.35}
            onClick={() => onZoom(Math.min(1.35, zoom + 0.1))}
          >
            <Iconify icon="mdi:magnify-plus-outline" width={18} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
}

export function RoomStudioLegend() {
  return (
    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ pt: 1.5 }}>
      {[
        { label: 'Empty', color: 'text.secondary', fill: false },
        { label: 'Assigned', color: 'success.main', fill: true },
        { label: 'Reserved', color: 'warning.main', fill: true },
        { label: 'Disabled', color: 'text.disabled', fill: true },
        { label: 'Other plan', color: 'text.secondary', fill: true },
      ].map(({ label, color, fill }) => (
        <Stack key={label} direction="row" spacing={0.75} alignItems="center">
          <Box aria-hidden="true" sx={{ width: 10, height: 10, borderRadius: 0.25,
            border: '1px solid', borderColor: color, bgcolor: fill ? color : 'transparent' }} />
          <Typography variant="caption" color="text.secondary">{label}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}
