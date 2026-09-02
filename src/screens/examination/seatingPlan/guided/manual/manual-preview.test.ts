import { it, expect, describe } from 'vitest';

import { buildGuidedManualPreview } from './manual-preview';

import type { SeatingStudent, SeatingAssignment, SeatingRoomLayout } from '../../types';

const students: SeatingStudent[] = [
  { studentId: 'student-1', studentName: 'Ananya', rollNo: 1, divisionName: 'A' },
  { studentId: 'student-2', studentName: 'Kabir', rollNo: 2, divisionName: 'A' },
];
const rooms: SeatingRoomLayout[] = [
  {
    roomId: 'room-1',
    roomName: 'B101',
    capacity: 3,
    rows: 1,
    columns: 3,
    benchCapacity: 1,
    seats: [
      { seatId: 'room-1:1', seatNumber: 1, row: 0, column: 0 },
      { seatId: 'room-1:2', seatNumber: 2, row: 0, column: 1, isDisabled: true },
      { seatId: 'room-1:3', seatNumber: 3, row: 0, column: 2 },
    ],
  },
];

describe('guided manual preview', () => {
  it('reports assignments, pending students, room usage and usable capacity', () => {
    const assignments: SeatingAssignment[] = [
      {
        studentId: 'student-1',
        roomId: 'room-1',
        seatId: 'room-1:1',
        seatNumber: 1,
        assignedBy: 'manual',
      },
    ];

    expect(buildGuidedManualPreview(students, rooms, assignments)).toMatchObject({
      assignments: [{ studentId: 'student-1', studentName: 'Ananya', roomName: 'B101' }],
      unallocatedStudentIds: ['student-2'],
      totalStudents: 2,
      roomsUsed: 1,
      emptySeats: 1,
      utilizationPercent: 50,
    });
  });

  it('does not count seats blocked by another examination as this plan assignments', () => {
    const assignments: SeatingAssignment[] = [
      {
        studentId: 'external-student',
        roomId: 'room-1',
        seatId: 'room-1:1',
        seatNumber: 1,
        assignedBy: 'manual',
        isExternalExamOccupied: true,
      },
    ];

    expect(buildGuidedManualPreview(students, rooms, assignments).assignments).toEqual([]);
  });
});
