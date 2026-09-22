import { describe, expect, it } from 'vitest';

import { getUnifiedTeachers, toTeacherOption } from './teacherOptions';

describe('teacher options', () => {
  it('formats employee code and name for unambiguous selection', () => {
    expect(
      toTeacherOption({
        id: 'teacher-1',
        fullName: 'Jay Dalia',
        employeeIdentifier: 'TEA150001',
      }).label
    ).toBe('TEA150001 - Jay Dalia');
  });

  it('uses the unified teachers response and falls back to legacy teacher fields', () => {
    const unified = [{ id: 'teacher-1', name: 'Jay Dalia' }];
    expect(
      getUnifiedTeachers({
        teachers: unified,
        primaryTeacher: { id: 'ignored', name: 'Ignored' },
      })
    ).toEqual(unified);

    expect(
      getUnifiedTeachers({
        primaryTeacher: { id: 'teacher-1', name: 'Jay Dalia' },
        secondaryTeachers: [{ id: 'teacher-2', name: 'Hiren Vadher' }],
      })
    ).toEqual([
      { id: 'teacher-1', name: 'Jay Dalia' },
      { id: 'teacher-2', name: 'Hiren Vadher' },
    ]);
  });

  it('does not expose the empty legacy placeholder as an assigned teacher', () => {
    expect(getUnifiedTeachers({ primaryTeacher: { id: '', name: '' } })).toEqual([]);
  });
});
