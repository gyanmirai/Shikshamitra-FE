import type {
  SeatingPlanGroupDto,
  GuidedAllocationPreviewDto,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import { it, expect, describe } from 'vitest';

import { mapClassroomPreview } from './seating-classroom-preview-mapper';

const plan = {
  divisions: [],
  availableRooms: [{ roomId: 'room-1', roomName: 'B106' }],
} as unknown as SeatingPlanGroupDto;
const layout = {
  roomId: 'room-1',
  room: {
    capacity: 4,
    benchesPerRow: 2,
    benchesPerColumn: 1,
    benchCapacity: 2,
    disabledSeatNumbersCsv: '4',
  },
  items: [
    { studentId: 'old', studentName: 'Old assignment', seatNumber: 1 },
    {
      studentId: 'other',
      studentName: 'Other plan student',
      seatNumber: 3,
      isOtherPlanOccupied: true,
    },
  ],
};
const preview: GuidedAllocationPreviewDto = {
  assignments: [
    { studentId: 'new', studentName: 'New proposal', rollNo: 12, roomId: 'room-1', seatNumber: 2 },
  ],
  unallocatedStudentIds: [],
  totalStudents: 1,
  roomsUsed: 1,
  emptySeats: 1,
  utilizationPercent: 50,
};

describe('read-only classroom proposal mapping', () => {
  it('uses physical room positions and proposed seats while preserving protected occupancy', () => {
    const result = mapClassroomPreview(plan, layout, preview);
    expect(result.rooms[0].roomName).toBe('B106');
    expect(result.rooms[0].seats[1]).toMatchObject({ seatNumber: 2, row: 0, column: 0 });
    expect(result.rooms[0].seats[3].isDisabled).toBe(true);
    expect(result.assignments.map((assignment) => assignment.studentId)).toEqual(['other', 'new']);
    expect(result.assignments[0].isExternalExamOccupied).toBe(true);
    expect(result.students.find((student) => student.studentId === 'new')).toMatchObject({
      studentName: 'New proposal',
      rollNo: 12,
    });
    expect(preview.assignments[0].seatNumber).toBe(2);
  });

  it('does not replace a protected seat with a stale proposal', () => {
    const result = mapClassroomPreview(plan, layout, {
      ...preview,
      assignments: [{ ...preview.assignments[0], seatNumber: 3 }],
    });
    expect(result.assignments).toHaveLength(1);
    expect(result.assignments[0].studentId).toBe('other');
  });
});
