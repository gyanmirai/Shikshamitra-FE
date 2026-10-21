import { Box, Typography } from '@mui/material';

import SeatCard from './SeatCard';

import type { SeatingSeat, SeatingStudent, SeatingAssignment } from '../../types';

interface Props {
  roomId: string;
  seats: SeatingSeat[];
  studentsById: Map<string, SeatingStudent>;
  assignmentBySeat: Map<string, SeatingAssignment>;
  conflictSeatIds: Set<string>;
  isReadOnly?: boolean;
  onUnassign: (studentId: string) => void;
  onToggleReserve?: (roomId: string, seat: SeatingSeat) => void;
}

export default function RoomStudioBench({
  roomId,
  seats,
  studentsById,
  assignmentBySeat,
  conflictSeatIds,
  isReadOnly,
  onUnassign,
  onToggleReserve,
}: Props) {
  const { row, column } = seats[0];
  return (
    <Box
      data-studio-bench={`${row}-${column}`}
      sx={{ gridColumn: column + 1, gridRow: row + 2, minWidth: 0 }}
    >
      <Box
        sx={{
          mb: 2,
          py: 0.75,
          position: 'relative',
          textAlign: 'center',
          border: '1px solid',
          borderColor: 'text.secondary',
          borderRadius: 0.75,
          bgcolor: 'background.paper',
          boxShadow: (theme) => `0 4px 0 ${theme.vars.palette.divider}`,
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            bottom: -10,
            width: 5,
            height: 8,
            bgcolor: 'text.secondary',
            borderRadius: 0.25,
          },
          '&::before': { left: 12 },
          '&::after': { right: 12 },
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Bench {String.fromCharCode(65 + row)}
          {column + 1}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${seats.length}, minmax(0, 1fr))`,
          gap: 1,
        }}
      >
        {seats.map((seat) => {
          const assignment = assignmentBySeat.get(seat.seatId);
          const student = assignment ? studentsById.get(assignment.studentId) : undefined;
          return (
            <SeatCard
              key={seat.seatId}
              seat={seat}
              roomId={roomId}
              assignment={assignment}
              studentName={student?.studentName}
              rollNo={student?.rollNo}
              divisionName={student?.divisionName}
              isConflict={conflictSeatIds.has(seat.seatId)}
              isExternalExamOccupied={student?.isExternalExamOccupied}
              presentation="studio"
              isReadOnly={isReadOnly}
              onRemove={() => assignment && onUnassign(assignment.studentId)}
              onReserve={() => onToggleReserve?.(roomId, seat)}
            />
          );
        })}
      </Box>
    </Box>
  );
}
