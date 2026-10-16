import { it, expect, describe } from 'vitest';

import {
  addDivisionRoomDefault,
  createSavedRoomSelections,
  applyDivisionRoomDefaults,
} from './roomAssignmentDefaults';

import type { TimeSlot, DayOfWeek, SlotSubject } from './types';

const subjects: SlotSubject[] = [
  {
    subjectId: 'science',
    subjectAssignmentId: 'science-assignment',
    name: 'Science',
    color: '#000000',
  },
  {
    subjectId: 'mathematics',
    subjectAssignmentId: 'mathematics-assignment',
    name: 'Mathematics',
    color: '#000000',
  },
];

describe('room assignment defaults', () => {
  it('preserves a room already saved on the timetable slot', () => {
    const savedSubjects = [{ ...subjects[0], roomId: 'saved-room' }];
    const savedSelections = createSavedRoomSelections(savedSubjects);

    expect(addDivisionRoomDefault(savedSelections, savedSubjects, 'division-room')).toEqual({
      science: 'saved-room',
    });
  });

  it('prefills the division room when the timetable slot has no room', () => {
    expect(addDivisionRoomDefault({}, [subjects[0]], 'division-room')).toEqual({
      science: 'division-room',
    });
  });

  it('does not overwrite a selection made while the division room is loading', () => {
    expect(
      addDivisionRoomDefault({ science: 'manually-selected-room' }, [subjects[0]], 'division-room')
    ).toEqual({ science: 'manually-selected-room' });
  });

  it('uses the division room only once for parallel subjects', () => {
    expect(addDivisionRoomDefault({}, subjects, 'division-room')).toEqual({
      science: 'division-room',
    });
  });

  it('keeps a room field cleared by the user empty when defaults refresh', () => {
    const selections = { science: '' };
    expect(addDivisionRoomDefault(selections, [subjects[0]], 'division-room')).toBe(selections);
  });
});

const room = { id: 'division-room', roomName: 'B101' };
const lecture: TimeSlot = {
  id: 'monday-one',
  day: 'MONDAY',
  sequence: 1,
  startTime: '08:00',
  endTime: '09:00',
  type: 'LECTURE',
  subjects: [subjects[0]],
  _attachedSubject: subjects[0],
};
const week: Record<DayOfWeek, TimeSlot[]> = {
  MONDAY: [lecture],
  TUESDAY: [],
  WEDNESDAY: [],
  THURSDAY: [],
  FRIDAY: [],
  SATURDAY: [],
};

describe('timetable division room defaults', () => {
  it('fills unassigned lectures and keeps their dragged subject in sync', () => {
    const updated = applyDivisionRoomDefaults(week, room);
    expect(updated.MONDAY[0].subjects?.[0]).toMatchObject({
      ...subjects[0],
      roomId: room.id,
      roomName: room.roomName,
    });
    expect(updated.MONDAY[0]._attachedSubject).toEqual(updated.MONDAY[0].subjects?.[0]);
    expect(week.MONDAY[0].subjects?.[0].roomId).toBeUndefined();
    expect(updated.TUESDAY).toBe(week.TUESDAY);
    expect(applyDivisionRoomDefaults(updated, room)).toBe(updated);
  });

  it('preserves a lecture override and leaves empty periods and breaks alone', () => {
    const unchanged = {
      ...week,
      MONDAY: [
        { ...lecture, subjects: [{ ...subjects[0], roomId: 'lab', roomName: 'Science lab' }] },
        { ...lecture, subjects: [] },
        { ...lecture, type: 'BREAK' as const },
      ],
    };
    expect(applyDivisionRoomDefaults(unchanged, room)).toBe(unchanged);
    expect(applyDivisionRoomDefaults(week, null)).toBe(week);
  });

  it('does not double-book the division room in an elective period', () => {
    const electives = { ...week, MONDAY: [{ ...lecture, subjects }] };
    const updated = applyDivisionRoomDefaults(electives, room);
    expect(updated.MONDAY[0].subjects?.map((subject) => subject.roomId)).toEqual([
      room.id,
      undefined,
    ]);
    expect(applyDivisionRoomDefaults(updated, room)).toBe(updated);
  });
});
