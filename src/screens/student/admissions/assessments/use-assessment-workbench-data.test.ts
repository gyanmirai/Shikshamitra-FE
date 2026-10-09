import { it, vi, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

import { useAssessmentWorkbenchData } from './use-assessment-workbench-data';

const mocks = vi.hoisted(() => ({
  academic: { academicYearId: 'year-1', boardId: '', mediumId: '', standardId: '' },
  scopes: vi.fn(),
  sessions: vi.fn(),
  applicants: vi.fn(),
  update: vi.fn(),
  state: {
    tab: 'applicants',
    queue: 'all',
    sessionId: '',
    search: '',
    sort: 'enteredAt',
    direction: 'desc',
    page: 0,
    size: 25,
  },
}));
vi.mock('../admission-academic-filters', () => ({
  useAdmissionAcademicFilters: () => mocks.academic,
}));
vi.mock('./use-assessment-scope', () => ({
  useAssessmentScope: () => ({ scopeKey: 'offering:definition', setScope: vi.fn() }),
}));
vi.mock('./use-assessment-workbench', () => ({
  useAssessmentWorkbench: () => ({ state: mocks.state, href: vi.fn(), update: mocks.update }),
}));
vi.mock('src/redux/student/admissions/admission-assessment-sessions-api', () => ({
  useGetAssessmentScopesQuery: mocks.scopes,
  useGetAssessmentSessionsQuery: mocks.sessions,
}));
vi.mock('src/redux/student/admissions/admission-assessment-roster-api', () => ({
  useGetAssessmentApplicantsQuery: mocks.applicants,
}));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.academic.academicYearId = 'year-1';
  Object.assign(mocks.state, {
    tab: 'applicants',
    queue: 'all',
    sessionId: '',
    search: '',
    sort: 'enteredAt',
    direction: 'desc',
    page: 0,
    size: 25,
  });
  mocks.scopes.mockReturnValue({
    currentData: [
      {
        admissionOfferingId: 'offering',
        workflowStageDefinitionId: 'definition',
        academicYearId: 'year-1',
        schedulingEnabled: true,
      },
    ],
  });
  mocks.sessions.mockReturnValue({ currentData: [{ id: 'session-1' }] });
  mocks.applicants.mockReturnValue({ currentData: undefined, isFetching: false, isError: false });
});
it('does not fetch scoped applicants without matching academic context or access', () => {
  mocks.academic.academicYearId = 'other-year';
  renderHook(() => useAssessmentWorkbenchData(true, false));
  expect(mocks.applicants.mock.lastCall?.[1]).toMatchObject({ skip: true });
  renderHook(() => useAssessmentWorkbenchData(false, false));
  expect(mocks.scopes.mock.lastCall?.[1]).toMatchObject({ skip: true });
  expect(mocks.sessions.mock.lastCall?.[1]).toMatchObject({ skip: true });
});
it('never substitutes all-session data for an unavailable selected session', () => {
  mocks.state.sessionId = 'deleted-session';
  const { result } = renderHook(() => useAssessmentWorkbenchData(true, false));
  expect(result.current.invalidSession).toBe(true);
  expect(mocks.applicants.mock.lastCall?.[1]).toMatchObject({ skip: true });
});
it('sends restored queue/search/session and zero-based page offsets', () => {
  Object.assign(mocks.state, { sessionId: 'session-1', queue: 'result', search: 'QA', page: 2 });
  renderHook(() => useAssessmentWorkbenchData(true, false));
  expect(mocks.applicants.mock.lastCall?.[0]).toMatchObject({
    sessionId: 'session-1',
    queue: 'result',
    search: 'QA',
    skipCount: 50,
    maxResultCount: 25,
  });
  expect(mocks.applicants.mock.lastCall?.[1]).toMatchObject({ skip: false });
});
it('returns to the last available page after an action empties the current page', () => {
  mocks.state.page = 3;
  mocks.applicants.mockReturnValue({
    currentData: { totalCount: 26 },
    isFetching: false,
    isError: false,
  });
  renderHook(() => useAssessmentWorkbenchData(true, false));
  expect(mocks.update).toHaveBeenCalledWith({ assessmentPage: 1 }, true);
});

it('preserves the deep-linked page when the table emits restored search on mount', () => {
  mocks.state.page = 2;
  const { result } = renderHook(() => useAssessmentWorkbenchData(true, false));
  result.current.updateSearch('');
  expect(mocks.update).not.toHaveBeenCalled();
  result.current.updateSearch('Sam');
  expect(mocks.update).toHaveBeenCalledWith({ assessmentSearch: 'Sam', assessmentPage: 0 }, true);
});

it.each([
  { currentData: undefined, isFetching: true, isError: false },
  { currentData: [{ id: 'session-1' }], isFetching: false, isError: true },
])('waits for valid session prerequisites before loading roster or insights', (sessionQuery) => {
  mocks.state.sessionId = 'session-1';
  mocks.sessions.mockReturnValue(sessionQuery);
  const { result } = renderHook(() => useAssessmentWorkbenchData(true, true));
  expect(result.current.sessionLookupUnavailable).toBe(true);
  expect(mocks.applicants.mock.lastCall?.[1]).toMatchObject({ skip: true });
});
