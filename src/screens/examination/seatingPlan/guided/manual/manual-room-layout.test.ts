import type { SeatingPlanGroupDto } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import { it, expect } from 'vitest';

import { mapGuidedManualEditorData } from './manual-data-mappers';

it.each([false, true])(
  'preserves occupants on the real uneven layout in manual/published mapping (published=%s)',
  (showPlanContext) => {
    const plan = {
      divisions: [],
      availableRooms: [{ roomId: 'room-a', roomName: 'A101' }],
    } as unknown as SeatingPlanGroupDto;
    const data = mapGuidedManualEditorData(
      plan,
      [],
      [
        {
          roomId: 'room-a',
          room: { columnRows: [1, 3], benchCapacity: 1, capacity: 4 },
          items: [
            {
              studentId: 'student-a',
              studentName: 'Assigned student',
              seatNumber: 4,
              isOtherPlanOccupied: true,
              seatingPlanName: 'Shared subject plan',
            },
          ],
        },
      ],
      { showPlanContext }
    );
    expect(data.rooms[0].seats[3]).toMatchObject({ seatId: 'room-a:4', row: 2, column: 1 });
    expect(data.assignments[0]).toMatchObject({
      seatId: 'room-a:4',
      studentId: 'student-a',
      isExternalExamOccupied: true,
    });
    expect(data.students[0]).toMatchObject({
      studentName: 'Assigned student',
      divisionName: 'Shared subject plan',
      isExternalExamOccupied: true,
    });
  }
);
