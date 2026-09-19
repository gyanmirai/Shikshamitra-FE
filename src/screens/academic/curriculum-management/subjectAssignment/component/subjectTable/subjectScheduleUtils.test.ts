import type { SubjectScheduleLecture } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import { it, expect, describe } from 'vitest';

import {
  getTimetableStatus,
  groupLecturesByDay,
  getScheduleDayLabel,
} from './subjectScheduleUtils';

const lecture = (day: number, periodNumber: number): SubjectScheduleLecture => ({
  timetableId: `${day}-${periodNumber}`,
  timetableSlotId: `${day}-${periodNumber}`,
  timetableStatus: 2,
  divisionId: 'division-id',
  divisionName: 'A',
  day,
  periodNumber,
  startTime: '09:00',
  endTime: '09:30',
  subjects: [],
});

describe('subject schedule presentation helpers', () => {
  it('groups lectures in weekday order', () => {
    const groups = groupLecturesByDay([lecture(2, 3), lecture(0, 1), lecture(2, 4)]);

    expect(groups.map(([day]) => day)).toEqual([0, 2]);
    expect(groups[1][1]).toHaveLength(2);
    expect(getScheduleDayLabel(0)).toBe('Monday');
  });

  it('maps persisted timetable statuses to readable labels', () => {
    expect(getTimetableStatus(2)).toEqual({ label: 'Published', color: 'success' });
    expect(getTimetableStatus(1)).toEqual({ label: 'Draft', color: 'warning' });
  });
});
