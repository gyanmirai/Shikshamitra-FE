import type { SeatingPlanGroupDto } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import { it, expect, describe } from 'vitest';

import { mapGuidedManualEditorData } from './manual-data-mappers';

const plan = {
  divisions: [
    { id: 'division-a', name: 'A' },
    { id: 'division-b', name: 'B' },
  ],
  availableRooms: [{ roomId: 'room-1', roomName: 'B106' }],
} as SeatingPlanGroupDto;

describe('guided manual editor data mapping', () => {
  it('keeps each student division and loads occupied seats across both divisions', () => {
    const result = mapGuidedManualEditorData(
      plan,
      [
        {
          items: [{ studentId: 'a-1', studentName: 'Asha', rollNo: 1, isSeatAllocate: true }],
        },
        {
          items: [{ studentId: 'b-1', studentName: 'Bilal', rollNo: 1, isSeatAllocate: true }],
        },
      ],
      [
        {
          roomId: 'room-1',
          room: { capacity: 4, benchesPerRow: 1, benchesPerColumn: 4, benchCapacity: 1 },
          items: [
            { studentId: 'a-1', studentName: 'Asha', rollNo: 1, seatNumber: 1 },
            { studentId: 'b-1', studentName: 'Bilal', rollNo: 1, seatNumber: 2 },
            {
              studentId: 'external-1',
              studentName: 'Blocked (Other Exam)',
              seatNumber: 3,
              isExternalExamOccupied: true,
            },
          ],
        },
      ]
    );

    expect(result.students).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ studentId: 'a-1', divisionId: 'division-a', divisionName: 'A' }),
        expect.objectContaining({ studentId: 'b-1', divisionId: 'division-b', divisionName: 'B' }),
      ])
    );
    expect(result.assignments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ studentId: 'a-1', roomId: 'room-1', seatNumber: 1 }),
        expect.objectContaining({ studentId: 'b-1', roomId: 'room-1', seatNumber: 2 }),
        expect.objectContaining({ studentId: 'external-1', isExternalExamOccupied: true }),
      ])
    );
  });
});
