import type { GuidedAllocationPreviewDto } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { FormSectionCard } from 'src/components/form-section-card';

type Assignment = GuidedAllocationPreviewDto['assignments'][number];

export function SeatingPreviewGrid({ assignments }: { assignments: Assignment[] }) {
  /** Memoization Justification: group and sort a potentially large plan only when its proposal
   * changes, avoiding repeated array copies and sorting when validation updates the Review step. */
  const rooms = useMemo(() => {
    const grouped = new Map<string, Assignment[]>();
    assignments.forEach((assignment) => {
      const items = grouped.get(assignment.roomId);
      if (items) items.push(assignment);
      else grouped.set(assignment.roomId, [assignment]);
    });
    return [...grouped.entries()].map(
      ([roomId, items]) =>
        [roomId, items.toSorted((left, right) => left.seatNumber - right.seatNumber)] as const
    );
  }, [assignments]);

  if (assignments.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No seats were proposed.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5} aria-label="Proposed room seating">
      {rooms.map(([roomId, roomAssignments]) => (
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
            {roomAssignments.map((assignment) => (
              <Stack
                key={`${assignment.roomId}-${assignment.seatNumber}`}
                spacing={0.25}
                sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
              >
                <Typography variant="overline" color="text.primary">
                  Seat {assignment.seatNumber}
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{ overflowWrap: 'anywhere', textAlign: 'left' }}
                >
                  {assignment.studentName || `Student ${assignment.studentId.slice(0, 6)}`}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.primary"
                  sx={{ textAlign: 'left', overflowWrap: 'anywhere' }}
                >
                  {assignment.rollNo != null ? `Roll ${assignment.rollNo}` : 'Roll —'}
                  {assignment.divisionName ? ` · Div ${assignment.divisionName}` : ''}
                </Typography>
              </Stack>
            ))}
          </Box>
        </FormSectionCard>
      ))}
    </Stack>
  );
}
