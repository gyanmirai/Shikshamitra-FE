import { it, expect, describe } from 'vitest';

import { buildEmptyDraft } from './mappers';
import { autoAllocate } from './autoAllocate';
import { validateSeatingDraft } from './validate';
import { getUsableSeatCount, toSeatingRoomLayout } from './room-layout';

describe('saved room layouts in seating allocation', () => {
  it('uses unequal column counts without creating phantom benches', () => {
    const room = toSeatingRoomLayout(
      { room: { columnRows: [3, 1, 2], benchCapacity: 2, capacity: 999 } },
      'room-a',
      'A101'
    );
    expect(room.capacity).toBe(12);
    expect([room.rows, room.columns]).toEqual([3, 3]);
    expect(room.seats.map((seat) => [seat.row, seat.column])).toEqual([
      [0, 0],
      [0, 0],
      [0, 1],
      [0, 1],
      [0, 2],
      [0, 2],
      [1, 0],
      [1, 0],
      [1, 2],
      [1, 2],
      [2, 0],
      [2, 0],
    ]);
    expect(room.seats.map((seat) => seat.seatNumber)).toEqual(
      Array.from({ length: 12 }, (_, index) => index + 1)
    );
    expect(room.seats[8].seatId).toBe('room-a:9');
  });

  it('preserves the exact legacy partial-grid positions when saved as column rows', () => {
    const legacy = {
      totalBenches: 5,
      capacity: 10,
      benchesPerRow: 2,
      benchesPerColumn: 3,
      benchCapacity: 2,
    };
    const before = toSeatingRoomLayout({ room: legacy }, 'room-a', 'A101');
    const after = toSeatingRoomLayout(
      { room: { ...legacy, columnRows: [2, 2, 1] } },
      'room-a',
      'A101'
    );
    expect(after.seats).toEqual(before.seats);
    expect(
      toSeatingRoomLayout({ room: { ...legacy, columnRows: null } }, 'room-a', 'A101').seats
    ).toEqual(before.seats);
  });

  it('retains disabled, reserved, accessible seats and orientation metadata', () => {
    const room = toSeatingRoomLayout(
      {
        room: {
          columnRows: [1, 2],
          benchCapacity: 1,
          disabledSeatNumbersCsv: '1,99',
          reservedSeatNumbersCsv: '2',
          accessibleSeatNumbersCsv: '3',
          boardPosition: 'front',
          entrancePosition: 'left',
          aisleAfterColumnsCsv: '0',
        },
      },
      'room-a',
      'A101'
    );
    expect(room.seats[0].isDisabled).toBe(true);
    expect(room.seats[1].isReserved).toBe(true);
    expect(room.seats[2].isAccessible).toBe(true);
    expect(getUsableSeatCount(room)).toBe(1);
    expect([room.boardPosition, room.entrancePosition, room.aisleAfterColumns]).toEqual([
      'front',
      'left',
      [0],
    ]);
  });

  it('keeps zero usable capacity when every real seat is unavailable', () => {
    const room = toSeatingRoomLayout(
      {
        room: {
          columnRows: [1, 1],
          benchCapacity: 1,
          disabledSeatNumbersCsv: '1',
          reservedSeatNumbersCsv: '2',
        },
      },
      'room-a',
      'A101'
    );
    expect(getUsableSeatCount(room)).toBe(0);
    const draft = buildEmptyDraft('exam-a');
    draft.rooms = [room];
    draft.assignments = [
      {
        studentId: 'student-a',
        roomId: room.roomId,
        seatId: room.seats[0].seatId,
        seatNumber: 1,
        assignedBy: 'manual',
      },
    ];
    expect(
      validateSeatingDraft(draft).blockers.some((issue) => issue.code === 'ROOM_CAPACITY_EXCEEDED')
    ).toBe(true);
  });

  it('allocates column-wise against actual benches and skips unavailable seats', () => {
    const room = toSeatingRoomLayout(
      {
        room: {
          columnRows: [3, 1, 2],
          benchCapacity: 1,
          disabledSeatNumbersCsv: '2',
          reservedSeatNumbersCsv: '5',
        },
      },
      'room-a',
      'A101'
    );
    const students = Array.from({ length: 4 }, (_, index) => ({
      studentId: `student-${index}`,
      studentName: `Student ${index}`,
      rollNo: index + 1,
    }));
    const result = autoAllocate(
      students,
      [room],
      [],
      { ...buildEmptyDraft('exam-a').allocationRules, fillDirection: 'column-wise' },
      []
    );
    expect(result.assignments.map((assignment) => assignment.seatNumber)).toEqual([1, 4, 6, 3]);
  });
});
