import type { UserScopeHierarchy } from 'src/redux/userScope/types';

import { it, expect, describe } from 'vitest';

import { getStudentAcademicYears } from './student-academic-years';

const years = [{ id: 'empty' }, { id: 'assigned' }, { id: 'full' }];
const scope: UserScopeHierarchy = {
  userId: 'staff',
  userName: 'staff',
  isAdmin: false,
  fromCache: false,
  generatedAt: '',
  accessibleHierarchy: [
    { academicYearId: 'empty', academicYearName: '', hasFullBoardAccess: false, boards: [] },
    {
      academicYearId: 'assigned',
      academicYearName: '',
      hasFullBoardAccess: false,
      boards: [
        {
          boardId: 'board',
          boardName: '',
          hasAccess: true,
          hasFullMediumAccess: false,
          mediums: [],
        },
      ],
    },
    { academicYearId: 'full', academicYearName: '', hasFullBoardAccess: true, boards: [] },
  ],
};

describe('Student academic year access', () => {
  it('keeps ancestor navigation and explicit year-wide assignments, excluding unassigned years', () => {
    expect(getStudentAcademicYears(years, scope)).toEqual([years[1], years[2]]);
  });

  it('excludes years whose board nodes all deny access', () => {
    const denied = {
      ...scope,
      accessibleHierarchy: [
        {
          ...scope.accessibleHierarchy[1],
          boards: [{ ...scope.accessibleHierarchy[1].boards[0], hasAccess: false }],
        },
      ],
    };
    expect(getStudentAcademicYears(years, denied)).toEqual([]);
  });

  it('does not offer years before the authenticated scope response is available', () => {
    expect(getStudentAcademicYears(years, undefined)).toEqual([]);
  });

  it('preserves the server-confirmed administrator year list', () => {
    expect(getStudentAcademicYears(years, { ...scope, isAdmin: true })).toEqual(years);
  });
});
