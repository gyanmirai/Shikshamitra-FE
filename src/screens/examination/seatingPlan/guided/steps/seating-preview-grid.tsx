import type { GuidedAllocationPreviewDto } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { FormSectionCard } from 'src/components/form-section-card';

type Assignment = GuidedAllocationPreviewDto['assignments'][number];

export function SeatingPreviewGrid({ assignments }: { assignments: Assignment[] }) {
  const rooms = assignments.reduce<Record<string, Assignment[]>>((grouped, assignment) => {
    const roomKey = assignment.roomId;
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
      {Object.entries(rooms).map(([roomId, roomAssignments]) => (
        <FormSectionCard
          key={roomId}
          icon="mdi:seat"
          title={`${roomAssignments[0].roomName || 'Room'} · Proposed assignments`}
          descriptionTooltip="Check each student's seat number, name, roll number and division. These cards list assignments in seat-number order; their position does not represent the classroom layout."
          action={
            <Chip size="small" variant="outlined" label={`${roomAssignments.length} students`} />
          }
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(132px, 1fr))',
              gap: 1,
            }}
          >
            {roomAssignments
              .toSorted((left, right) => left.seatNumber - right.seatNumber)
              .map((assignment) => (
                <Stack
                  key={`${assignment.roomId}-${assignment.seatNumber}`}
                  spacing={0.25}
                  sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                >
                  <Typography variant="overline" color="text.primary">
                    Seat {assignment.seatNumber}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                    {assignment.studentName || `Student ${assignment.studentId.slice(0, 6)}`}
                  </Typography>
                  <Typography variant="caption" color="text.primary" noWrap>
                    {assignment.rollNo ? `Roll ${assignment.rollNo}` : 'Roll —'}
                    {assignment.divisionName ? ` · ${assignment.divisionName}` : ''}
                  </Typography>
                </Stack>
              ))}
          </Box>
        </FormSectionCard>
      ))}
    </Stack>
  );
}
