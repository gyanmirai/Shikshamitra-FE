import type { GuidedAllocationPreviewDto } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type Assignment = GuidedAllocationPreviewDto['assignments'][number];

export function SeatingPreviewGrid({ assignments }: { assignments: Assignment[] }) {
  const rooms = assignments.reduce<Record<string, Assignment[]>>((grouped, assignment) => {
    const roomKey = assignment.roomName || assignment.roomId;
    grouped[roomKey] = [...(grouped[roomKey] ?? []), assignment];
    return grouped;
  }, {});

  if (assignments.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No seats were proposed.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5} aria-label="Proposed room seating">
      {Object.entries(rooms).map(([roomName, roomAssignments]) => (
        <Paper key={roomName} variant="outlined" sx={{ p: 1.5 }}>
          <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mb: 1.5 }}>
            <Typography variant="subtitle1">{roomName}</Typography>
            <Chip size="small" variant="outlined" label={`${roomAssignments.length} students`} />
          </Stack>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(132px, 1fr))',
              gap: 1,
            }}
          >
            {roomAssignments
              .sort((left, right) => left.seatNumber - right.seatNumber)
              .map((assignment) => (
                <Stack
                  key={`${assignment.roomId}-${assignment.seatNumber}`}
                  spacing={0.25}
                  sx={{ p: 1, minHeight: 68, borderRadius: 1, bgcolor: 'action.selected' }}
                >
                  <Typography variant="overline" color="text.primary">
                    Seat {assignment.seatNumber}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    noWrap
                    title={assignment.studentName ?? undefined}
                  >
                    {assignment.studentName || `Student ${assignment.studentId.slice(0, 6)}`}
                  </Typography>
                  <Typography variant="caption" color="text.primary" noWrap>
                    {assignment.rollNo ? `Roll ${assignment.rollNo}` : 'Roll —'}
                    {assignment.divisionName ? ` · ${assignment.divisionName}` : ''}
                  </Typography>
                </Stack>
              ))}
          </Box>
        </Paper>
      ))}
    </Stack>
  );
}
