import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

import RoomSwitcher from '../../components/workspace/RoomSwitcher';
import SeatLayoutCanvas from '../../components/workspace/SeatLayoutCanvas';

import type {
  SeatingSeat,
  SeatingStudent,
  SeatingAssignment,
  SeatingRoomLayout,
} from '../../types';

interface GuidedClassroomPanelProps {
  rooms: SeatingRoomLayout[];
  assignments: SeatingAssignment[];
  students: SeatingStudent[];
  activeRoomId: string;
  selectedStudent?: SeatingStudent;
  isReadOnly: boolean;
  hideRoomSwitcher?: boolean;
  readOnlyDescription?: string;
  includeProtectedAssignmentsInCount?: boolean;
  onSwitchRoom: (roomId: string) => void;
  onAssign: (student: SeatingStudent, roomId: string, seat: SeatingSeat) => void;
  onUnassign: (studentId: string) => void;
  onToggleReserve?: (roomId: string, seat: SeatingSeat) => void;
}

export function GuidedClassroomPanel({
  rooms,
  assignments,
  students,
  activeRoomId,
  selectedStudent,
  isReadOnly,
  hideRoomSwitcher = false,
  readOnlyDescription = 'Published seating is read-only. Seats from simultaneous plans are combined and labelled in this room view.',
  includeProtectedAssignmentsInCount = false,
  onSwitchRoom,
  onAssign,
  onUnassign,
  onToggleReserve,
}: GuidedClassroomPanelProps) {
  const activeRoom = rooms.find((room) => room.roomId === activeRoomId) ?? rooms[0];
  /**
   * Memoization Justification:
   * - The classroom canvas performs repeated occupant lookups while rendering every seat.
   * - A stable map avoids rebuilding that index during canvas-only drag state updates.
   */
  const studentsById = useMemo(
    () => new Map(students.map((student) => [student.studentId, student])),
    [students]
  );
  const roomSummaries = rooms.map((room) => ({
    roomId: room.roomId,
    roomName: room.roomName,
    occupied: assignments.filter(
      (assignment) =>
        assignment.roomId === room.roomId &&
        (includeProtectedAssignmentsInCount || !assignment.isExternalExamOccupied)
    ).length,
    usable: room.seats.filter((seat) => !seat.isDisabled && !seat.isReserved).length,
  }));

  if (!activeRoom) {
    return <Alert severity="info">Select at least one room to open the classroom editor.</Alert>;
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!selectedStudent || isReadOnly) return;
    const target = event.target as Element;
    const seatElement = target.closest<HTMLElement>('[data-seat-id]');
    if (!seatElement) return;
    const seat = activeRoom.seats.find((item) => item.seatId === seatElement.dataset.seatId);
    const isOccupied = assignments.some(
      (assignment) => assignment.roomId === activeRoom.roomId && assignment.seatId === seat?.seatId
    );
    if (!seat || seat.isDisabled || seat.isReserved || isOccupied) return;
    onAssign(selectedStudent, activeRoom.roomId, seat);
  };

  return (
    <Box sx={{ minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      {!hideRoomSwitcher && (
        <RoomSwitcher
          rooms={roomSummaries}
          activeRoomId={activeRoom.roomId}
          onSwitch={onSwitchRoom}
        />
      )}
      {selectedStudent && !isReadOnly && (
        <Alert severity="info" sx={{ m: 1.5, mb: 0 }}>
          Select an empty seat for {selectedStudent.studentName}. Press Escape on the student card
          to cancel keyboard dragging.
        </Alert>
      )}
      <Box onClick={handleCanvasClick} sx={{ flex: 1, minHeight: 460, p: 1.5 }}>
        <SeatLayoutCanvas
          room={activeRoom}
          assignments={assignments}
          studentsById={studentsById}
          conflictSeatIds={new Set()}
          onAssign={onAssign}
          onUnassign={onUnassign}
          onToggleReserve={onToggleReserve}
          isReadOnly={isReadOnly}
        />
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ px: 1.5, pb: 1.5 }}>
        {isReadOnly
          ? readOnlyDescription
          : 'Drag occupied seats to move or swap students. Use the seat menu to remove an assignment or reserve an empty seat.'}
      </Typography>
    </Box>
  );
}
