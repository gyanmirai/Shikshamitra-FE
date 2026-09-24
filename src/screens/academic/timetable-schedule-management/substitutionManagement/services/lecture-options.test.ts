import { it, expect, describe } from 'vitest';

import { buildLectureSelectOptions } from './lecture-options';

describe('buildLectureSelectOptions', () => {
  it('keeps the lecture options empty when no timetable slots are returned', () => {
    expect(buildLectureSelectOptions([])).toEqual([]);
  });

  it('maps only configured timetable lectures into selectable options', () => {
    expect(
      buildLectureSelectOptions([
        {
          slotSubjectId: 'slot-subject-1',
          period: 'Period 1',
          startTime: '09:00',
          endTime: '09:45',
          subjectName: 'Mathematics',
          originalTeacherName: 'Rohit Mehta',
        },
      ])
    ).toEqual([
      {
        value: 'slot-subject-1',
        label: 'Period 1 | 09:00-09:45 | Mathematics | Rohit Mehta',
      },
    ]);
  });
});
