import { describe, expect, it } from 'vitest';

import { getPrimaryTeacherNames } from './primaryTeacherNames';

describe('getPrimaryTeacherNames', () => {
  it('returns every distinct teacher from an elective group response', () => {
    expect(
      getPrimaryTeacherNames({
        status: 1,
        classId: 'class-1',
        className: 'UKG',
        subjectName: 'Pt & Computer Group',
        subjectType: 1,
        primaryTeacherNames: ['Jeet Ram', 'Jignesh Jinjala', 'Jeet Ram'],
      })
    ).toEqual(['Jeet Ram', 'Jignesh Jinjala']);
  });

  it('falls back to nested subject teachers and then the legacy single name', () => {
    expect(
      getPrimaryTeacherNames({
        status: 1,
        classId: 'class-1',
        className: 'UKG',
        subjectName: 'Pt & Computer Group',
        subjectType: 1,
        subjects: [
          {
            id: 'subject-1',
            classId: 'class-1',
            subjectId: 'subject-1',
            subjectCode: 'COM06',
            primaryTeacher: { id: 'teacher-1', name: 'Jeet Ram' },
            primaryTeacherId: 'teacher-1',
            secondaryTeachers: [],
            prerequisites: '',
            learningGoals: '',
            description: '',
          },
        ],
      })
    ).toEqual(['Jeet Ram']);

    expect(
      getPrimaryTeacherNames({
        status: 1,
        classId: 'class-1',
        className: 'UKG',
        subjectName: 'Mathematics',
        subjectType: 0,
        primaryTeacherName: 'Akshay Patel',
      })
    ).toEqual(['Akshay Patel']);
  });
});
