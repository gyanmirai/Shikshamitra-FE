import { it, expect, describe } from 'vitest';

import { autoAllocate } from './autoAllocate';

import type {
  SeatingStudent,
  SeatingAssignment,
  SeatingRoomLayout,
  SeatingAllocationRules,
} from '../types';

const students: SeatingStudent[] = [
  { studentId: 'a-1', studentName: 'Asha', rollNo: 1, divisionId: 'a' },
  { studentId: 'a-2', studentName: 'Aarav', rollNo: 2, divisionId: 'a' },
  { studentId: 'b-1', studentName: 'Bilal', rollNo: 11, divisionId: 'b' },
  { studentId: 'b-2', studentName: 'Bina', rollNo: 12, divisionId: 'b' },
];
const room: SeatingRoomLayout = {
  roomId: 'room-1',
  roomName: 'B106',
  capacity: 5,
  rows: 1,
  columns: 5,
  benchCapacity: 1,
  seats: Array.from({ length: 5 }, (_, index) => ({
    seatId: `room-1:${index + 1}`,
    seatNumber: index + 1,
    row: 0,
    column: index,
  })),
};
const external: SeatingAssignment = {
  studentId: 'external-1',
  roomId: 'room-1',
  seatId: 'room-1:3',
  seatNumber: 3,
  assignedBy: 'manual',
  isExternalExamOccupied: true,
};
const rules: SeatingAllocationRules = {
  strategy: 'alternate-division',
  fillDirection: 'front-to-back',
  leaveGap: false,
  mixDivisions: true,
  specialRequirementPriority: true,
};

describe('manual editor auto allocation', () => {
  it('mixes divisions even when roll number is the selected student order', () => {
    const result = autoAllocate(
      students,
      [room],
      [external],
      { ...rules, strategy: 'roll-number' },
      []
    );

    expect(result.assignments).toEqual([
      external,
      expect.objectContaining({ studentId: 'a-1', seatNumber: 1 }),
      expect.objectContaining({ studentId: 'b-1', seatNumber: 2 }),
      expect.objectContaining({ studentId: 'a-2', seatNumber: 4 }),
      expect.objectContaining({ studentId: 'b-2', seatNumber: 5 }),
    ]);
  });

  it('keeps the selected global order when division mixing is disabled', () => {
    const result = autoAllocate(
      students,
      [room],
      [external],
      { ...rules, strategy: 'roll-number', mixDivisions: false },
      []
    );

    expect(result.assignments).toEqual([
      external,
      expect.objectContaining({ studentId: 'a-1', seatNumber: 1 }),
      expect.objectContaining({ studentId: 'a-2', seatNumber: 2 }),
      expect.objectContaining({ studentId: 'b-1', seatNumber: 4 }),
      expect.objectContaining({ studentId: 'b-2', seatNumber: 5 }),
    ]);
  });

  it('alternates divisions while preserving a seat occupied by another examination', () => {
    const result = autoAllocate(students, [room], [external], rules, []);

    expect(result.unallocatedStudentIds).toEqual([]);
    expect(result.assignments).toEqual([
      external,
      expect.objectContaining({ studentId: 'a-1', seatNumber: 1 }),
      expect.objectContaining({ studentId: 'b-1', seatNumber: 2 }),
      expect.objectContaining({ studentId: 'a-2', seatNumber: 4 }),
      expect.objectContaining({ studentId: 'b-2', seatNumber: 5 }),
    ]);
    expect(new Set(result.assignments.map((assignment) => assignment.studentId)).size).toBe(5);
  });

  it('never uses disabled, reserved or externally occupied seats and reports the remainder', () => {
    const constrainedRoom: SeatingRoomLayout = {
      ...room,
      seats: room.seats.map((seat) => ({
        ...seat,
        isReserved: seat.seatNumber === 4,
        isDisabled: seat.seatNumber === 5,
      })),
    };

    const result = autoAllocate(students, [constrainedRoom], [external], rules, []);

    expect(result.assignments.filter((assignment) => !assignment.isExternalExamOccupied)).toEqual([
      expect.objectContaining({ studentId: 'a-1', seatNumber: 1 }),
      expect.objectContaining({ studentId: 'b-1', seatNumber: 2 }),
    ]);
    expect(result.unallocatedStudentIds).toEqual(['a-2', 'b-2']);
  });

  it('leaves an adjacent gap and exposes unallocated students when capacity is insufficient', () => {
    const result = autoAllocate(students, [room], [external], { ...rules, leaveGap: true }, []);

    expect(result.assignments.filter((assignment) => !assignment.isExternalExamOccupied)).toEqual([
      expect.objectContaining({ studentId: 'a-1', seatNumber: 1 }),
      expect.objectContaining({ studentId: 'b-1', seatNumber: 4 }),
    ]);
    expect(result.unallocatedStudentIds).toEqual(['a-2', 'b-2']);
  });
});
