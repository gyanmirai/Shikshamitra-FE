import type { DragEndEvent } from '@dnd-kit/core';
import type { Dispatch, SetStateAction } from 'react';

import type { useSeatingDraft } from '../../hooks/useSeatingDraft';
import type { SeatingSeat, SeatingStudent, SeatingAssignment } from '../../types';

interface DragData {
  type: string;
  student?: SeatingStudent;
  assignment?: SeatingAssignment;
  seat?: SeatingSeat;
  roomId?: string;
}

interface Context {
  isReadOnly: boolean;
  assignments: SeatingAssignment[];
  actions: ReturnType<typeof useSeatingDraft>['actions'];
  setSelectedStudentId: Dispatch<SetStateAction<string>>;
}

export function handleGuidedManualDrag(event: DragEndEvent, context: Context) {
  if (context.isReadOnly || !event.over) return;
  const activeData = event.active.data.current as DragData | undefined;
  const overData = event.over.data.current as DragData | undefined;
  const { seat, roomId } = overData ?? {};
  if (
    !activeData ||
    overData?.type !== 'seat' ||
    !seat ||
    !roomId ||
    seat.isDisabled ||
    seat.isReserved ||
    seat.isExternalExamOccupied
  ) {
    return;
  }

  const occupant = context.assignments.find(
    (assignment) => assignment.roomId === roomId && assignment.seatId === seat.seatId
  );
  if (occupant?.isExternalExamOccupied) return;
  if (activeData.type === 'assigned-seat' && activeData.assignment) {
    if (occupant && occupant.studentId !== activeData.assignment.studentId) {
      context.actions.swapSeats(activeData.assignment.studentId, occupant.studentId);
    } else {
      context.actions.moveStudent(activeData.assignment.studentId, roomId, seat);
    }
    return;
  }
  if (activeData.type === 'student' && activeData.student) {
    context.actions.assignStudent(activeData.student, roomId, seat);
    context.setSelectedStudentId('');
  }
}
