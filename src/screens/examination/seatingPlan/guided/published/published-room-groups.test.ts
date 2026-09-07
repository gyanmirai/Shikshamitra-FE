import type {
  SeatingSubjectDto,
  SeatingPlanGroupDto,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import { it, expect, describe } from 'vitest';

import { plansOverlap, buildPublishedRoomGroups } from './published-room-groups';

function subject(
  examSubjectId: string,
  subjectName: string,
  startTime: string,
  endTime: string,
  examDate = '2026-09-05'
): SeatingSubjectDto {
  return {
    examSubjectId,
    subjectId: examSubjectId,
    subjectName,
    examDate,
    startTime,
    endTime,
  };
}

function plan(
  seatingPlanId: string,
  name: string,
  planSubject: SeatingSubjectDto
): SeatingPlanGroupDto {
  return {
    seatingPlanId,
    name,
    subjects: [planSubject],
    selectedRoomIds: ['room-b005'],
    availableRooms: [
      { roomId: 'room-b005', roomName: 'B005', capacity: 40, usableCapacity: 40, disabledSeats: 0 },
    ],
  } as SeatingPlanGroupDto;
}

describe('published room groups', () => {
  it('combines plans that share a room during overlapping examination times', () => {
    const english = plan(
      'plan-english',
      'English seating',
      subject('english', 'English', '09:00:00', '10:00:00')
    );
    const computerScience = plan(
      'plan-computer',
      'Computer Science seating',
      subject('computer', 'Computer Science', '09:30:00', '10:30:00')
    );

    const groups = buildPublishedRoomGroups([english, computerScience]);

    expect(groups).toHaveLength(1);
    expect(groups[0].roomName).toBe('B005');
    expect(groups[0].plans.map((item) => item.seatingPlanId)).toEqual([
      'plan-english',
      'plan-computer',
    ]);
    expect(groups[0].subjectNames).toEqual(['English', 'Computer Science']);
  });

  it('keeps the same room separate when examination times do not overlap', () => {
    const morning = plan(
      'morning',
      'Morning seating',
      subject('english', 'English', '09:00:00', '10:00:00')
    );
    const afternoon = plan(
      'afternoon',
      'Afternoon seating',
      subject('computer', 'Computer Science', '14:00:00', '15:00:00')
    );

    expect(plansOverlap(morning, afternoon)).toBe(false);
    expect(buildPublishedRoomGroups([morning, afternoon])).toHaveLength(2);
  });
});
