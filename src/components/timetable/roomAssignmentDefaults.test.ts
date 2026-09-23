import { it, expect, describe } from 'vitest';

import { addDivisionRoomDefault, createSavedRoomSelections } from './roomAssignmentDefaults';

import type { SlotSubject } from './types';

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
});
