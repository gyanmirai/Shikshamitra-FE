import { it, expect, describe } from 'vitest';
import { academicPaths } from 'src/constants/academic-menu';
import { instituteSetupPaths } from 'src/constants/institute-setup';

import { getReadinessSetupAction } from './readinessChecklistActions';

describe('getReadinessSetupAction', () => {
  it.each([
    [
      'Lecture Slots not configured',
      'Configure slots',
      academicPaths.timetable.settings.lectureSlots,
    ],
    [
      'Weekly Lectures not configured',
      'Configure lectures',
      academicPaths.timetable.settings.weeklyLectures,
    ],
    [
      'Subjects not assigned to standard',
      'Open subject allocation',
      academicPaths.curriculum.subjectsAssignment,
    ],
    [
      '3 subjects do not have teachers assigned',
      'Open subject allocation',
      academicPaths.curriculum.subjectsAssignment,
    ],
    ['Rooms not configured', 'Configure rooms', instituteSetupPaths.roomsManagement.room],
    [
      'Available weekly slots are less than required weekly lectures (capacity mismatch)',
      'Review weekly lectures',
      academicPaths.timetable.settings.weeklyLectures,
    ],
  ])('maps "%s" to its setup destination', (message, label, href) => {
    expect(getReadinessSetupAction(message)).toEqual({ label, href });
  });

  it('returns no action for an unknown server message', () => {
    expect(getReadinessSetupAction('Unknown prerequisite')).toBeNull();
  });
});
