import { it, expect, describe } from 'vitest';

import {
  toSeatingPlanListRows,
  upsertSeatingRoomLayout,
  toSeatingStudentsFromAllocations,
} from './mappers';

import type { SeatingRoomLayout } from '../types';

const createRoom = (roomId: string, capacity = 36): SeatingRoomLayout => ({
  roomId,
  roomName: roomId,
  capacity,
  rows: 6,
  columns: 3,
  benchCapacity: 2,
  seats: [],
});

describe('toSeatingStudentsFromAllocations', () => {
  it('keeps occupant names returned by the room layout across divisions', () => {
    const result = toSeatingStudentsFromAllocations([
      {
        seatNumber: 1,
        studentId: 'student-1',
        studentName: 'Avni Vishal Makwana',
        standardName: 'Class 3',
        rollNo: 1,
        isRoomAssign: true,
        isExternalExamOccupied: false,
      },
      {
        seatNumber: 2,
        studentId: null,
        isRoomAssign: false,
      },
      {
        seatNumber: 10,
        studentId: 'external-student-1',
        studentName: 'Blocked (Other Exam)',
        standardName: 'Reserved',
        rollNo: null as any,
        isRoomAssign: true,
        isExternalExamOccupied: true,
      },
    ]);

    expect(result).toEqual([
      {
        studentId: 'student-1',
        studentName: 'Avni Vishal Makwana',
        standardName: 'Class 3',
        rollNo: 1,
        isExternalExamOccupied: false,
      },
      {
        studentId: 'external-student-1',
        studentName: 'Blocked (Other Exam)',
        standardName: 'Reserved',
        rollNo: 0,
        isExternalExamOccupied: true,
      },
    ]);
  });
});

const ROOM_UUID = '3a22fecb-5dbf-b797-46bd-aeb58e2fb899';

describe('upsertSeatingRoomLayout', () => {
  it('replaces a refreshed room without changing its position', () => {
    const rooms = [createRoom('B103'), createRoom('B105'), createRoom('B104')];

    const result = upsertSeatingRoomLayout(rooms, createRoom('B103', 40));

    expect(result.map((room) => room.roomId)).toEqual(['B103', 'B105', 'B104']);
    expect(result[0].capacity).toBe(40);
  });

  it('preserves room order across repeated active-room changes', () => {
    const rooms = [createRoom('B103'), createRoom('B105'), createRoom('B104')];
    const afterB105 = upsertSeatingRoomLayout(rooms, createRoom('B105', 42));
    const afterB104 = upsertSeatingRoomLayout(afterB105, createRoom('B104', 44));

    expect(afterB104.map((room) => room.roomId)).toEqual(['B103', 'B105', 'B104']);
  });

  it('appends a room that has not been loaded before', () => {
    const rooms = [createRoom('B103'), createRoom('B105')];

    const result = upsertSeatingRoomLayout(rooms, createRoom('B104'));

    expect(result.map((room) => room.roomId)).toEqual(['B103', 'B105', 'B104']);
  });

  it('does not replace a known room name with a UUID fallback', () => {
    const knownRoom = { ...createRoom(ROOM_UUID), roomName: 'B102' };
    const refreshedLayout = createRoom(ROOM_UUID, 40);

    const result = upsertSeatingRoomLayout([knownRoom], refreshedLayout);

    expect(result[0]).toMatchObject({
      roomId: ROOM_UUID,
      roomName: 'B102',
      capacity: 40,
    });
  });
});

describe('toSeatingPlanListRows', () => {
  it('keeps one exam row when the exam contains multiple subject sessions', () => {
    const rows = toSeatingPlanListRows({
      examId: 'exam-1',
      examName: 'Term examination',
      examTypeName: 'Written',
      standardName: 'Standard 8',
      divisions: ['A'],
      totalStudents: 48,
      allocatedStudents: 24,
      pendingStudents: 24,
      seatingPlanCount: 1,
      subjectCount: 2,
      plannedSubjectCount: 2,
      subjectNames: ['Mathematics', 'Science'],
      status: 1,
      sessions: [
        {
          sessionKey: '2026-09-10|09:00:00|12:00:00',
          seatingPlanId: 'plan-1',
          examDate: '2026-09-10',
          startTime: '09:00:00',
          endTime: '12:00:00',
          subjectNames: ['Mathematics'],
          divisions: ['A'],
          divisionProgress: [],
          totalStudents: 24,
          allocatedStudents: 24,
          pendingStudents: 0,
          roomsUsed: 1,
          usableCapacity: 30,
          emptySeats: 6,
          utilization: 80,
          status: 5,
          hasCompleteSchedule: true,
          canPrepare: true,
          requiresMigration: false,
          blockingIssueCount: 0,
        },
        {
          sessionKey: '2026-09-11|09:00:00|12:00:00',
          examDate: '2026-09-11',
          startTime: '09:00:00',
          endTime: '12:00:00',
          subjectNames: ['Science'],
          divisions: ['A'],
          divisionProgress: [],
          totalStudents: 24,
          allocatedStudents: 0,
          pendingStudents: 24,
          roomsUsed: 0,
          usableCapacity: 0,
          emptySeats: 0,
          utilization: 0,
          status: 0,
          hasCompleteSchedule: true,
          canPrepare: true,
          requiresMigration: false,
          blockingIssueCount: 0,
        },
      ],
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: 'exam-1',
      subjectNames: ['Mathematics', 'Science'],
      subjectCount: 2,
      plannedSubjectCount: 2,
      seatingPlanCount: 1,
      status: 'in-progress',
      progress: 50,
    });
  });

  it('reports missing and insufficient capacity truthfully', () => {
    const base = {
      examId: 'exam-2',
      examName: 'Term examination',
      examTypeName: 'Written',
      standardName: 'Standard 8',
      divisions: ['A'],
      totalStudents: 24,
      allocatedStudents: 0,
      pendingStudents: 24,
      status: 0,
    };
    const legacy = toSeatingPlanListRows(base)[0];
    expect(legacy.capacityStatus).toBe('unused');
  });
});
