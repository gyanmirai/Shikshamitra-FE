import { renderHook } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { useStudentAcademicScope } from './use-student-academic-scope';

const state = vi.hoisted(() => ({
  userId: 'staff',
  params: new URLSearchParams(),
  scope: {} as Record<string, unknown>,
}));
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { accessToken: 'test', profile: { sub: state.userId, tenantid: 'school' } },
  }),
}));
vi.mock('next/navigation', () => ({ useSearchParams: () => state.params }));
vi.mock('react-redux', () => ({ useSelector: () => ({ id: 'year', name: 'Year' }) }));
vi.mock('src/redux/userScope/userScopeApi', () => ({
  useGetUserScopeHierarchyQuery: () => state.scope,
}));
vi.mock('src/redux/board/boardApi', () => ({
  useGetBoardsQuery: () => ({
    currentData: {
      items: [
        {
          id: 'board',
          academicYearId: 'year',
          educationMediums: [
            {
              id: 'english',
              educationMediumStages: [
                {
                  id: 'stage',
                  standards: [{ id: 'class', divisions: [{ id: 'allowed' }, { id: 'sibling' }] }],
                },
              ],
            },
            {
              id: 'marathi',
              educationMediumStages: [
                {
                  id: 'marathi-stage',
                  standards: [{ id: 'marathi-class', divisions: [{ id: 'marathi-division' }] }],
                },
              ],
            },
          ],
        },
      ],
    },
  }),
}));

const hierarchy = {
  userId: 'staff',
  isAdmin: false,
  accessibleHierarchy: [
    {
      academicYearId: 'year',
      boards: [
        {
          boardId: 'board',
          hasAccess: true,
          mediums: [
            {
              mediumId: 'english',
              hasAccess: true,
              mediumStages: [
                {
                  mediumStageId: 'stage',
                  hasAccess: true,
                  standards: [
                    {
                      standardId: 'class',
                      hasAccess: true,
                      divisions: [{ divisionId: 'allowed', hasAccess: true }],
                    },
                  ],
                },
              ],
            },
            { mediumId: 'marathi', hasAccess: true, hasFullMediumStageAccess: true },
          ],
        },
      ],
    },
  ],
};
describe('Student staff academic scope', () => {
  beforeEach(() => {
    state.params = new URLSearchParams();
    state.userId = 'staff';
    state.scope = { currentData: hierarchy, isError: false };
  });

  it('retains all authorized mediums and prunes sibling divisions', () => {
    const { result } = renderHook(useStudentAcademicScope);
    expect(result.current.mediums.map((medium) => medium.id)).toEqual(['english', 'marathi']);
    expect(
      result.current.currentMedium?.educationMediumStages[0].standards[0].divisions.map(
        (division) => division.id
      )
    ).toEqual(['allowed']);
  });

  it('selects an authorized local medium without changing the year', () => {
    state.params.set('medium', 'marathi');
    const { result } = renderHook(useStudentAcademicScope);
    expect(result.current.currentYear?.id).toBe('year');
    expect(result.current.currentMedium?.id).toBe('marathi');
  });

  it('keeps the scope revision stable on a focus refresh with identical access', () => {
    state.scope = { currentData: { ...hierarchy, generatedAt: '2026-11-18T05:00:00Z' } };
    const { result, rerender } = renderHook(useStudentAcademicScope);
    const revision = result.current.scopeRevision;
    expect(revision).toBeDefined();

    state.scope = { currentData: { ...hierarchy, generatedAt: '2026-11-18T05:01:00Z' } };
    rerender();
    expect(result.current.scopeRevision).toBe(revision);
  });

  it('changes the scope revision when authorized placements change in the same medium', () => {
    const { result, rerender } = renderHook(useStudentAcademicScope);
    const revision = result.current.scopeRevision;
    const changedHierarchy = structuredClone(hierarchy);
    changedHierarchy.accessibleHierarchy[0].boards[0].mediums[0].mediumStages![0].standards[0]
      .divisions.push({ divisionId: 'sibling', hasAccess: true });

    state.scope = { currentData: changedHierarchy };
    rerender();
    expect(result.current.currentMedium?.id).toBe('english');
    expect(result.current.scopeRevision).not.toBe(revision);
  });

  it('fails closed on a forged local selection', () => {
    state.params.set('medium', 'outside-scope');
    const { result } = renderHook(useStudentAcademicScope);
    expect(result.current.currentMedium).toBeUndefined();
  });

  it('hides cached hierarchy after a scope failure or identity switch', () => {
    const { result, rerender } = renderHook(useStudentAcademicScope);
    state.scope = { currentData: hierarchy, isError: true };
    rerender();
    expect(result.current.boards).toEqual([]);
    state.scope = { currentData: hierarchy, isError: false };
    state.userId = 'another-staff';
    rerender();
    expect(result.current.boards).toEqual([]);
  });
});
