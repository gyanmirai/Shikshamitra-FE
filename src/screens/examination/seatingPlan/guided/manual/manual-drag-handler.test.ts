import type { DragEndEvent } from '@dnd-kit/core';

import { it, vi, expect, describe } from 'vitest';

import { handleGuidedManualDrag } from './manual-drag-handler';

import type { SeatingSeat, SeatingAssignment } from '../../types';

const source: SeatingAssignment = {
  studentId: 'student-1',
  roomId: 'room-1',
  seatId: 'room-1:1',
  seatNumber: 1,
  assignedBy: 'manual',
};
const destination: SeatingSeat = {
  seatId: 'room-1:2',
  seatNumber: 2,
  row: 0,
  column: 1,
};

function dragEvent(occupant?: SeatingAssignment) {
  return {
    active: { data: { current: { type: 'assigned-seat', assignment: source } } },
    over: { data: { current: { type: 'seat', seat: destination, roomId: 'room-1' } } },
    occupant,
  } as unknown as DragEndEvent;
}

describe('guided manual drag handler', () => {
  it('moves an occupied seat to an empty destination', () => {
    const moveStudent = vi.fn();
    handleGuidedManualDrag(dragEvent(), {
      isReadOnly: false,
      assignments: [source],
      actions: { moveStudent } as never,
      setSelectedStudentId: vi.fn() as never,
    });

    expect(moveStudent).toHaveBeenCalledWith('student-1', 'room-1', destination);
  });

  it('swaps students when the destination is occupied', () => {
    const swapSeats = vi.fn();
    const occupant: SeatingAssignment = {
      ...source,
      studentId: 'student-2',
      seatId: destination.seatId,
      seatNumber: destination.seatNumber,
    };
    handleGuidedManualDrag(dragEvent(occupant), {
      isReadOnly: false,
      assignments: [source, occupant],
      actions: { swapSeats } as never,
      setSelectedStudentId: vi.fn() as never,
    });

    expect(swapSeats).toHaveBeenCalledWith('student-1', 'student-2');
  });
});
