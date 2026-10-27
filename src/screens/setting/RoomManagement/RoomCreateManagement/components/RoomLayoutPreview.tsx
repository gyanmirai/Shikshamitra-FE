import { useState } from 'react';
import { Box, Alert, Stack, Button, Typography } from '@mui/material';

import { RoomLayoutCanvas } from './RoomLayoutCanvas';
import { totalRoomBenches } from '../services/room-layout';

export function RoomLayoutPreview({
  rows,
  benchCapacity,
}: {
  rows: (number | '')[];
  benchCapacity: number | '';
}) {
  const [zoom, setZoom] = useState<number | 'fit'>('fit');
  const columns = rows.map(Number);
  const students = Number(benchCapacity);
  if (
    benchCapacity === '' ||
    columns.length > 50 ||
    columns.some((count) => !Number.isInteger(count) || count < 1 || count > 100) ||
    !Number.isInteger(students) ||
    students < 0 ||
    students > 20
  ) {
    return (
      <Alert severity="info">
        Enter valid rows for each column and students per bench to preview the room.
      </Alert>
    );
  }
  const total = totalRoomBenches(rows, benchCapacity);
  if (total === 0) return <Alert severity="info">This room has no bench seating.</Alert>;
  const scale = zoom === 'fit' ? 1 : zoom;
  return (
    <Stack spacing={2}>
      <Box
        aria-live="polite"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' },
          gap: 1.5,
        }}
      >
        {[
          ['Columns', columns.length],
          ['Benches', total],
          ['Students per bench', students],
          ['Student capacity', total * students],
        ].map(([label, value]) => (
          <Box key={label}>
            <Typography component="div" variant="h6">
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
          </Box>
        ))}
      </Box>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
        <Button
          type="button"
          size="small"
          variant={zoom === 'fit' ? 'contained' : 'outlined'}
          onClick={() => setZoom('fit')}
        >
          Fit room
        </Button>
        <Button
          type="button"
          size="small"
          variant="outlined"
          aria-label="Zoom out"
          disabled={zoom !== 'fit' && scale <= 0.5}
          onClick={() => setZoom(Math.max(0.5, scale - 0.25))}
        >
          −
        </Button>
        <Typography variant="body2" sx={{ minWidth: 44, textAlign: 'center' }} aria-live="polite">
          {zoom === 'fit' ? 'Fit' : `${Math.round(zoom * 100)}%`}
        </Typography>
        <Button
          type="button"
          size="small"
          variant="outlined"
          aria-label="Zoom in"
          disabled={zoom !== 'fit' && scale >= 2}
          onClick={() => setZoom(Math.min(2, scale + 0.25))}
        >
          +
        </Button>
      </Stack>
      <Box
        role="region"
        aria-label="Room seating diagram"
        tabIndex={0}
        sx={{
          maxHeight: 'min(60vh, 640px)',
          overflow: 'auto',
          minWidth: 0,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1.5,
          bgcolor: 'background.neutral',
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'text.primary',
            outlineOffset: 2,
          },
        }}
      >
        <RoomLayoutCanvas columns={columns} students={students} zoom={zoom} />
      </Box>
      <Typography variant="caption" color="text.secondary">
        Figures show available student seats at each bench. This schematic is based on the entered
        layout.
      </Typography>
    </Stack>
  );
}
