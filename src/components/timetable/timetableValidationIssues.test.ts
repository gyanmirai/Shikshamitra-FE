import { it, expect, describe } from 'vitest';

import { extractTimetableApiIssues } from './timetableValidationIssues';

describe('extractTimetableApiIssues', () => {
  it.each(['teacher', 'room'])(
    'identifies the academic context of a cross-medium %s conflict',
    (type) => {
      const [issue] = extractTimetableApiIssues({
        data: {
          errorCode: type === 'teacher' ? 'Academic:Timetable:030003' : 'Academic:Timetable:030004',
          data: {
            ConflictDetails: JSON.stringify([
              {
                Type: type,
                ResourceName: type === 'teacher' ? 'Jeet Ram' : 'B104',
                ConflictingStandardName: 'Class 12',
                ConflictingDivisionName: 'A',
                ConflictingSubjectName: 'Social Science',
                ConflictingAcademicYearName: '2026-2027',
                ConflictingEducationBoardName: 'GSEB',
                ConflictingEducationMediumName: 'Gujarati',
                Day: 'Monday',
                StartTime: '11:30',
                EndTime: '12:30',
              },
            ]),
          },
        },
      });

      expect(issue.description).toContain('Class 12 Division A (2026-2027 / GSEB / Gujarati)');
      expect(issue.details).toMatchObject({
        'Academic year': '2026-2027',
        Board: 'GSEB',
        Medium: 'Gujarati',
      });
    }
  );

  it('uses nested RFC 7807 conflict details instead of exposing the timetable rule code', () => {
    const [issue] = extractTimetableApiIssues(
      {
        status: 409,
        data: {
          title: 'Business rule violation',
          detail: 'Timetable rule 030004.',
          errorCode: 'Academic:Timetable:030004',
          data: {
            message:
              'Room conflict: B104 is already assigned to Class 8 Division A for Mathematics on Monday 08:00-08:30.',
            ConflictDetails: JSON.stringify([
              {
                Type: 'room',
                ResourceName: 'B104',
                ConflictingStandardName: 'Class 8',
                ConflictingDivisionName: 'A',
                ConflictingSubjectName: 'Mathematics',
                Day: 'Monday',
                StartTime: '08:00',
                EndTime: '08:30',
              },
            ]),
          },
        },
      },
      'Room conflict found'
    );

    expect(issue).toEqual({
      title: 'Room conflict: B104',
      description:
        'B104 is already assigned to Class 8 Division A for Mathematics during Monday 08:00 - 08:30',
      severity: 'error',
      details: {
        Time: '08:00 - 08:30',
        Day: 'Monday',
        Class: 'Class 8 Division A',
        Subject: 'Mathematics',
        Room: 'B104',
      },
    });
    expect(issue.description).not.toContain('030004');
  });

  it('maps a room-conflict code to actionable text when conflict metadata is unavailable', () => {
    const [issue] = extractTimetableApiIssues({
      status: 409,
      data: {
        detail: 'Timetable rule 030004.',
        errorCode: 'Academic:Timetable:030004',
        data: {},
      },
    });

    expect(issue.title).toBe('Room conflict found');
    expect(issue.description).toBe(
      'The selected room is already assigned to another class during this time slot. Choose another room or change the timetable slot.'
    );
    expect(issue.description).not.toContain('030004');
  });
});
