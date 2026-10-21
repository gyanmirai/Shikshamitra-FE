import type { DragEndEvent } from '@dnd-kit/core';

import { vi, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { buildEmptyDraft } from '../../utils/mappers';
import { useSeatingDraft } from '../../hooks/useSeatingDraft';
import { toSeatingRoomLayout } from '../../utils/room-layout';
import { handleGuidedManualDrag } from './manual-drag-handler';

const room = toSeatingRoomLayout(
  { room: { columnRows: [1, 3], benchCapacity: 1 } },
  'room-1',
  'B106'
);
const student = { studentId: 'student-1', studentName: 'First student', rollNo: 1 };
const draft = {
  ...buildEmptyDraft('exam-1'),
  rooms: [room],
  students: [student],
  assignments: [
    {
      studentId: 'student-1',
      roomId: room.roomId,
      seatId: 'room-1:1',
      seatNumber: 1,
      assignedBy: 'manual' as const,
    },
    {
      studentId: 'student-2',
      roomId: room.roomId,
      seatId: 'room-1:4',
      seatNumber: 4,
      assignedBy: 'auto' as const,
    },
  ],
};

it('uses the existing move/swap actions and history with physical seat IDs across rooms', () => {
  const { result } = renderHook(() => useSeatingDraft(draft));
  const drop = (number: number, roomId = room.roomId) => {
    const assignment = result.current.draft.assignments.find(
      (item) => item.studentId === student.studentId
    );
    act(() =>
      handleGuidedManualDrag(
        {
          active: { data: { current: { type: 'assigned-seat', assignment } } },
          over: {
            data: {
              current: {
                type: 'seat',
                roomId,
                seat: { ...room.seats[number - 1], seatId: `${roomId}:${number}` },
              },
            },
          },
        } as unknown as DragEndEvent,
        {
          isReadOnly: false,
          assignments: result.current.draft.assignments,
          actions: result.current.actions,
          setSelectedStudentId: vi.fn(),
        }
      )
    );
  };
  drop(3);
  expect(result.current.draft.assignments[0]).toMatchObject({ seatId: 'room-1:3', seatNumber: 3 });
  drop(4);
  expect(result.current.draft.assignments).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ studentId: 'student-1', seatId: 'room-1:4' }),
      expect.objectContaining({ studentId: 'student-2', seatId: 'room-1:3' }),
    ])
  );
  act(() => result.current.actions.undo());
  expect(result.current.draft.assignments[0].seatId).toBe('room-1:3');
  act(() => result.current.actions.redo());
  drop(2, 'room-2');
  expect(result.current.draft.assignments[0]).toMatchObject({
    roomId: 'room-2',
    seatId: 'room-2:2',
    seatNumber: 2,
  });
});

it.each(['reserved', 'disabled', 'external', 'protected-occupant', 'read-only', 'cancelled'])(
  'does not change allocations or history for a %s drop',
  (restriction) => {
    const initial =
      restriction === 'protected-occupant'
        ? {
            ...draft,
            assignments: draft.assignments.map((item) =>
              item.studentId === 'student-2' ? { ...item, isExternalExamOccupied: true } : item
            ),
          }
        : draft;
    const { result } = renderHook(() => useSeatingDraft(initial));
    const target = {
      ...room.seats[3],
      isReserved: restriction === 'reserved',
      isDisabled: restriction === 'disabled',
      isExternalExamOccupied: restriction === 'external',
    };
    act(() =>
      handleGuidedManualDrag(
        {
          active: { data: { current: { type: 'student', student } } },
          over:
            restriction === 'cancelled'
              ? null
              : { data: { current: { type: 'seat', roomId: room.roomId, seat: target } } },
        } as unknown as DragEndEvent,
        {
          isReadOnly: restriction === 'read-only',
          assignments: result.current.draft.assignments,
          actions: result.current.actions,
          setSelectedStudentId: vi.fn(),
        }
      )
    );
    expect(result.current.draft.assignments).toEqual(initial.assignments);
    expect(result.current.canUndo).toBe(false);
  }
);

it('preserves queue-to-occupied replacement and restores the original occupant through undo', () => {
  const { result } = renderHook(() => useSeatingDraft(draft));
  const queued = { ...student, studentId: 'student-3' };
  act(() =>
    handleGuidedManualDrag(
      {
        active: { data: { current: { type: 'student', student: queued } } },
        over: { data: { current: { type: 'seat', roomId: room.roomId, seat: room.seats[0] } } },
      } as unknown as DragEndEvent,
      {
        isReadOnly: false,
        assignments: result.current.draft.assignments,
        actions: result.current.actions,
        setSelectedStudentId: vi.fn(),
      }
    )
  );
  expect(result.current.draft.assignments).toHaveLength(2);
  expect(result.current.draft.assignments.find((item) => item.seatNumber === 1)?.studentId).toBe(
    'student-3'
  );
  act(() => result.current.actions.undo());
  expect(result.current.draft.assignments).toEqual(draft.assignments);
});
