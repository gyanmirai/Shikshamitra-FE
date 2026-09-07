import { Box } from '@mui/material';
import { useDraggable, useDroppable, useDndContext } from '@dnd-kit/core';

import SeatCardContent from './SeatCardContent';
import { getSeatSurfaceSx, SEAT_STATE_STYLES } from './seat-card-style';

import type { SeatVisualState } from './seat-card-types';
import type { SeatingSeat, SeatingAssignment } from '../../types';

interface Props {
  seat: SeatingSeat;
  roomId: string;
  assignment?: SeatingAssignment;
  studentName?: string;
  rollNo?: number;
  divisionName?: string;
  isConflict?: boolean;
  isExternalExam: boolean;
  isReadOnly?: boolean;
  onClick?: () => void;
}

function getSeatAriaLabel(
  seat: SeatingSeat,
  assignment: SeatingAssignment | undefined,
  studentName: string | undefined,
  isExternalExam: boolean,
  occupancyContext: string | undefined
) {
  if (isExternalExam) {
    return `Seat ${seat.seatNumber}, unavailable, occupied by ${occupancyContext ?? 'another simultaneous exam plan'}`;
  }
  if (assignment) return `Seat ${seat.seatNumber}, occupied by ${studentName ?? 'Student'}`;
  if (seat.isReserved) return `Seat ${seat.seatNumber}, reserved`;
  if (seat.isDisabled) return `Seat ${seat.seatNumber}, disabled`;
  return `Seat ${seat.seatNumber}, empty`;
}

export default function SeatCardSurface({
  seat,
  roomId,
  assignment,
  studentName,
  rollNo,
  divisionName,
  isConflict = false,
  isExternalExam,
  isReadOnly = false,
  onClick,
}: Props) {
  const isUnavailable = seat.isDisabled || seat.isReserved || isExternalExam;
  const { setNodeRef: setDropNodeRef, isOver } = useDroppable({
    id: `seat:${seat.seatId}`,
    data: { type: 'seat', seat, roomId },
    // Keep blocked seats registered so collision detection reports the exact pointer target;
    // the drag handler rejects their disabled/reserved/external seat data without side effects.
    disabled: isReadOnly,
  });
  const draggable = useDraggable({
    id: `assigned-seat:${seat.seatId}`,
    data: { type: 'assigned-seat', assignment, seat, roomId },
    disabled: !assignment || isUnavailable || isReadOnly,
  });
  const { active } = useDndContext();

  let state: SeatVisualState = 'available';
  if (seat.isDisabled || isExternalExam) state = 'disabled';
  else if (isConflict) state = 'conflict';
  else if (assignment) state = 'allocated';
  else if (seat.isReserved) state = 'reserved';
  else if (seat.isAccessible) state = 'accessible';
  const stateStyle = SEAT_STATE_STYLES[state];

  const draggedType = active?.data.current?.type as 'student' | 'assigned-seat' | undefined;
  const isSelfDrag = active?.id === `assigned-seat:${seat.seatId}`;
  const isSwapTarget =
    !isReadOnly && !isUnavailable && isOver && !!assignment && !isSelfDrag && !!draggedType;
  const isPlaceTarget = !isReadOnly && !isUnavailable && isOver && !assignment;

  return (
    <Box
      ref={(node: HTMLElement | null) => {
        setDropNodeRef(node);
        draggable.setNodeRef(node);
      }}
      {...(assignment && !isReadOnly && !isUnavailable ? draggable.listeners : {})}
      {...(assignment && !isReadOnly && !isUnavailable ? draggable.attributes : {})}
      onClick={isReadOnly || isUnavailable ? undefined : onClick}
      tabIndex={isReadOnly || isUnavailable ? -1 : 0}
      data-seat-id={seat.seatId}
      role={isReadOnly ? 'img' : 'button'}
      aria-label={getSeatAriaLabel(seat, assignment, studentName, isExternalExam, divisionName)}
      aria-disabled={isReadOnly ? undefined : isUnavailable}
      sx={getSeatSurfaceSx({
        stateStyle,
        hasAssignment: !!assignment,
        isExternalExam,
        isUnavailable,
        isConflict,
        isOver,
        isDragging: draggable.isDragging,
        isSwapTarget,
        isPlaceTarget,
        isReadOnly,
        transform: draggable.transform,
      })}
    >
      <SeatCardContent
        seat={seat}
        assignment={assignment}
        studentName={studentName}
        rollNo={rollNo}
        divisionName={divisionName}
        stateStyle={stateStyle}
        isExternalExam={isExternalExam}
        isSwapTarget={isSwapTarget}
        isPlaceTarget={isPlaceTarget}
      />
    </Box>
  );
}
