import { useState } from 'react';
import { useDndContext } from '@dnd-kit/core';
import { Box, Typography } from '@mui/material';

import RoomStudioBench from './RoomStudioBench';
import RoomStudioDragOverlay from './RoomStudioDragOverlay';
import { getUsableSeatCount } from '../../utils/room-layout';
import { useRoomStudioLayout } from './use-room-studio-layout';
import { RoomStudioLegend, RoomStudioToolbar } from './RoomStudioToolbar';

import type {
  SeatingSeat,
  SeatingStudent,
  SeatingAssignment,
  SeatingRoomLayout,
} from '../../types';

interface Props {
  room: SeatingRoomLayout;
  assignments: SeatingAssignment[];
  studentsById: Map<string, SeatingStudent>;
  conflictSeatIds: Set<string>;
  onUnassign: (studentId: string) => void;
  onToggleReserve?: (roomId: string, seat: SeatingSeat) => void;
  isReadOnly?: boolean;
}

export default function RoomStudioCanvas({
  room,
  assignments,
  studentsById,
  conflictSeatIds,
  onUnassign,
  onToggleReserve,
  isReadOnly,
}: Props) {
  const [zoom, setZoom] = useState(1);
  const { active } = useDndContext();
  const { benches, assignmentBySeat, columns, benchWidth } = useRoomStudioLayout(room, assignments);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (isReadOnly || active || !['Delete', 'Backspace'].includes(event.key)) return;
    const element = event.target as HTMLElement;
    const seat = room.seats.find((item) => item.seatId === element.dataset.seatId);
    if (!seat || seat.isReserved || seat.isDisabled || seat.isExternalExamOccupied) return;
    const assignment = assignmentBySeat.get(seat.seatId);
    if (
      !assignment ||
      assignment.isExternalExamOccupied ||
      studentsById.get(assignment.studentId)?.isExternalExamOccupied
    )
      return;
    event.preventDefault();
    onUnassign(assignment.studentId);
  };

  return (
    <Box
      aria-label="Room studio"
      onKeyDown={handleKeyDown}
      sx={{ minWidth: 0, height: 1, display: 'flex', flexDirection: 'column' }}
    >
      <RoomStudioToolbar
        room={room}
        occupied={assignmentBySeat.size}
        usable={getUsableSeatCount(room)}
        zoom={zoom}
        onZoom={setZoom}
      />
      <Box
        role="region"
        aria-label="Physical room preview"
        tabIndex={0}
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          bgcolor: 'background.neutral',
          borderRadius: 1.5,
          p: 2,
          '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
        }}
      >
        <Box
          sx={{
            minWidth: columns * (benchWidth + 24) - 24,
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
          }}
        >
          <Box
            sx={{
              width: '65%',
              mx: 'auto',
              mb: 2,
              borderTop: '3px solid',
              borderColor: 'text.secondary',
              textAlign: 'center',
              pt: 0.5,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {room.boardPosition ? `Board · ${room.boardPosition}` : 'Board / Front'}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, minmax(${benchWidth}px, 1fr))`,
              columnGap: 3,
              rowGap: 2.5,
            }}
          >
            {Array.from({ length: columns }, (_, column) => (
              <Typography key={column} variant="caption" color="text.secondary" textAlign="center">
                Column {column + 1}
                {room.aisleAfterColumns?.includes(column) ? ' · Aisle after' : ''}
              </Typography>
            ))}
            {benches.map((seats) => (
              <RoomStudioBench
                key={`${room.roomId}-${seats[0].row}-${seats[0].column}`}
                roomId={room.roomId}
                seats={seats}
                studentsById={studentsById}
                assignmentBySeat={assignmentBySeat}
                conflictSeatIds={conflictSeatIds}
                isReadOnly={isReadOnly}
                onUnassign={onUnassign}
                onToggleReserve={onToggleReserve}
              />
            ))}
          </Box>
          {benches.length === 0 && (
            <Typography variant="body2" sx={{ py: 4, textAlign: 'center' }}>
              No seats are configured for this room.
            </Typography>
          )}
        </Box>
      </Box>
      <RoomStudioLegend />
      {room.entrancePosition && (
        <Typography variant="caption" color="text.secondary" sx={{ pt: 0.5 }}>
          Entrance: {room.entrancePosition}
        </Typography>
      )}
      <RoomStudioDragOverlay studentsById={studentsById} />
    </Box>
  );
}
