import type { Subject, TimeSlot, DayOfWeek } from 'src/components/timetable/types';

import { rooms } from './mock-server';

export const pt: Subject = {
  subjectId: 'pt',
  subjectAssignmentId: 'pt-allocation',
  name: 'Pt',
  color: '#637381',
  totalLectures: 4,
};

export const makeSlots = (): Record<DayOfWeek, TimeSlot[]> => ({
  MONDAY: ['14:00', '14:30', '15:00', '15:30'].map((startTime, index) => ({
    id: `monday-${index}`,
    sequence: index + 1,
    day: 'MONDAY',
    startTime,
    endTime: ['14:30', '15:00', '15:30', '16:00'][index],
    type: 'LECTURE',
    subjects:
      index < 2
        ? [
            {
              subjectId: `saved-${index}`,
              subjectAssignmentId: `saved-${index}`,
              name: index ? 'Mathematics' : 'Science',
              color: '#00A76F',
              roomId: rooms[index ? 0 : 2].id,
              roomName: rooms[index ? 0 : 2].roomName,
            },
          ]
        : [],
  })),
  TUESDAY: [],
  WEDNESDAY: [],
  THURSDAY: [],
  FRIDAY: [],
  SATURDAY: [],
});
