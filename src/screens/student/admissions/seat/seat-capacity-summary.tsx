import type { AdmissionSeatStage } from 'src/redux/student/admissions/admission-seat-types';

import { Box, Stack, Typography, LinearProgress } from '@mui/material';

export function SeatCapacitySummary({ state }: { state: AdmissionSeatStage }) {
  const used = state.reservedCount + state.confirmedCount;
  const progress = state.capacity ? Math.min(100, (used / state.capacity) * 100) : 0;
  return (
    <Stack spacing={1.25}>
      <Stack direction="row" justifyContent="space-between" gap={2}>
        <Box><Typography variant="h4">{state.remainingCapacity}</Typography>
          <Typography variant="caption" color="text.secondary">Seats available</Typography></Box>
        <Stack direction="row" spacing={3} textAlign="right">
          <Box><Typography variant="subtitle1">{state.reservedCount}</Typography><Typography variant="caption" color="text.secondary">Reserved</Typography></Box>
          <Box><Typography variant="subtitle1">{state.confirmedCount}</Typography><Typography variant="caption" color="text.secondary">Confirmed</Typography></Box>
          <Box><Typography variant="subtitle1">{state.capacity}</Typography><Typography variant="caption" color="text.secondary">Capacity</Typography></Box>
        </Stack>
      </Stack>
      <LinearProgress variant="determinate" value={progress} color={state.isOverCapacity ? 'error' : progress >= 90 ? 'warning' : 'primary'}
        sx={{ height: 8, borderRadius: 1 }} />
      {state.isOverCapacity && <Typography variant="caption" color="error">Current occupancy exceeds configured capacity.</Typography>}
    </Stack>
  );
}
