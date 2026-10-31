import type { AssessmentScope } from 'src/redux/student/admissions/admission-assessment-types';

import { renderHook } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { useAssessmentWorkspaceData } from './use-assessment-workspace-data';

const mocks = vi.hoisted(() => ({
  academic: { academicYearId: 'year-1', boardId: 'board-1', mediumId: 'medium-1', standardId: '' },
  scopeKey: '',
  setScope: vi.fn(),
  scopes: vi.fn(),
  sessions: vi.fn(),
  selectedSession: vi.fn(),
  applicants: vi.fn(),
  update: vi.fn(),
  href: vi.fn(),
  state: {
    tab: 'applicants',
    queue: 'all',
    status: 'all',
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
  useAssessmentScope: () => ({ scopeKey: mocks.scopeKey, setScope: mocks.setScope }),
}));
vi.mock('./use-assessment-workbench', () => ({
  useAssessmentWorkbench: () => ({ state: mocks.state, href: mocks.href, update: mocks.update }),
}));
vi.mock('src/redux/student/admissions/admission-assessment-sessions-api', () => ({
  useGetAssessmentScopesQuery: mocks.scopes,
}));
vi.mock('src/redux/student/admissions/admission-assessment-planning-api', () => ({
  useGetAssessmentSessionByIdQuery: mocks.selectedSession,
  useGetAssessmentSessionWorkbenchQuery: mocks.sessions,
}));
vi.mock('src/redux/student/admissions/admission-assessment-roster-api', () => ({
  useGetAssessmentApplicantsQuery: mocks.applicants,
}));

const scope = (offering: string, overrides: Partial<AssessmentScope> = {}): AssessmentScope => ({
  admissionOfferingId: offering,
  workflowStageDefinitionId: `definition-${offering}`,
  academicYearId: 'year-1',
  boardId: 'board-1',
  mediumId: 'medium-1',
  standardId: 'class-1',
  offeringName: offering,
  stageName: 'Assessment',
  workflowDefinitionId: `workflow-${offering}`,
  workflowVersion: 1,
  schedulingEnabled: true,
  ...overrides,
});
const allowedScopes = () => [
  scope('first'),
  scope('second', { boardId: 'board-2', mediumId: 'medium-2', standardId: 'class-2' }),
  scope('third', { standardId: 'class-3' }),
  scope('old-year', { academicYearId: 'year-0' }),
];
const session = (id = 'chosen-session', offering = 'first') => ({
  id,
  admissionOfferingId: offering,
  workflowStageDefinitionId: `definition-${offering}`,
  scopeDetails: [scope(offering)],
});

beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(mocks.academic, {
    academicYearId: 'year-1',
    boardId: 'board-1',
    mediumId: 'medium-1',
    standardId: '',
  });
  mocks.scopeKey = '';
  Object.assign(mocks.state, {
    tab: 'applicants',
    queue: 'all',
    status: 'all',
    sessionId: '',
    search: '',
    sort: 'enteredAt',
    direction: 'desc',
    page: 0,
    size: 25,
  });
  mocks.scopes.mockReturnValue({ currentData: allowedScopes(), isError: false });
  mocks.sessions.mockReturnValue({
    currentData: { totalCount: 51, items: [session('first-page-session')] },
    isError: false,
  });
  mocks.selectedSession.mockReturnValue({ currentData: undefined, isError: false });
  mocks.applicants.mockReturnValue({ currentData: undefined, isFetching: false, isError: false });
});

describe('single assessment workspace data scope', () => {
  it('restores an authorized scope link without clearing its identity', () => {
    Object.assign(mocks.academic, { boardId: '', mediumId: '' });
    mocks.scopeKey = 'second:definition-second';
    const { result } = renderHook(() => useAssessmentWorkspaceData(true));
    result.current.academic.update('board', 'board-1');
    expect(mocks.update).toHaveBeenCalledExactlyOnceWith(
      { board: 'board-2', medium: 'medium-2' },
      true
    );
    expect(mocks.applicants.mock.lastCall?.[1]).toMatchObject({ skip: true });
  });

  it.each([true, false])(
    'restores session hierarchy with detailed scope metadata: %s',
    (detailed) => {
      Object.assign(mocks.academic, { boardId: '', mediumId: '' });
      mocks.state.sessionId = 'chosen-session';
      mocks.selectedSession.mockReturnValue({
        currentData: {
          ...session('chosen-session', 'second'),
          ...(detailed ? {} : { scopeDetails: [] }),
        },
      });
      const { result } = renderHook(() => useAssessmentWorkspaceData(true));
      expect(mocks.selectedSession.mock.lastCall?.[1]).toMatchObject({ skip: false });
      result.current.academic.update('board', 'board-1');
      expect(mocks.update).toHaveBeenCalledExactlyOnceWith(
        { board: 'board-2', medium: 'medium-2' },
        true
      );
      expect(mocks.applicants.mock.lastCall?.[1]).toMatchObject({ skip: true });
    }
  );

  it('waits for a linked session instead of clearing it during default selection', () => {
    Object.assign(mocks.academic, { boardId: '', mediumId: '' });
    mocks.state.sessionId = 'chosen-session';
    const { result } = renderHook(() => useAssessmentWorkspaceData(true));
    result.current.academic.update('board', 'board-1');
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it('unsubscribes workspace reads during a bulk sheet and resumes them on close', () => {
    const { rerender } = renderHook(({ paused }) => useAssessmentWorkspaceData(true, paused), {
      initialProps: { paused: true },
    });
    expect(mocks.applicants.mock.lastCall?.[1]).toMatchObject({ skip: true });
    expect(mocks.sessions.mock.lastCall?.[1]).toMatchObject({ skip: true });
    expect(mocks.selectedSession.mock.lastCall?.[1]).toMatchObject({ skip: true });
    rerender({ paused: false });
    expect(mocks.applicants.mock.lastCall?.[1]).toMatchObject({ skip: false });
    expect(mocks.sessions.mock.lastCall?.[1]).toMatchObject({ skip: false });
    expect(mocks.applicants.mock.lastCall?.[1]).toMatchObject({ refetchOnMountOrArgChange: true });
  });

  it.each(['boardId', 'mediumId'] as const)(
    'waits for the required %s before reading students or sessions',
    (key) => {
      mocks.academic[key] = '';
      const { result } = renderHook(() => useAssessmentWorkspaceData(true));
      expect(result.current.ready).toBe(false);
      expect(mocks.applicants.mock.lastCall?.[1]).toMatchObject({ skip: true });
      expect(mocks.sessions.mock.lastCall?.[1]).toMatchObject({ skip: true });
    }
  );

  it('requires single Board and Medium while applying the selected hierarchy consistently', () => {
    Object.assign(mocks.academic, {
      boardId: 'board-1',
      mediumId: 'medium-1',
      standardId: 'class-1,class-3',
    });
    const { result } = renderHook(() => useAssessmentWorkspaceData(true));
    expect(result.current.visibleScopes.map((item) => item.admissionOfferingId)).toEqual([
      'first',
      'third',
    ]);
    expect(mocks.applicants.mock.lastCall?.[0]).toMatchObject({
      boardId: 'board-1',
      mediumId: 'medium-1',
      standardId: undefined,
      standardIds: 'class-1,class-3',
    });
    expect(mocks.sessions.mock.lastCall?.[0]).toMatchObject({ standardIds: 'class-1,class-3' });
  });

  it('sends a single selected class through the single-class contract', () => {
    Object.assign(mocks.academic, {
      boardId: 'board-2',
      mediumId: 'medium-2',
      standardId: 'class-2',
    });
    const { result } = renderHook(() => useAssessmentWorkspaceData(true));
    expect(result.current.visibleScopes.map((item) => item.admissionOfferingId)).toEqual([
      'second',
    ]);
    expect(mocks.applicants.mock.lastCall?.[0]).toMatchObject({
      standardId: 'class-2',
      standardIds: undefined,
    });
  });

  it('preserves a legacy Offering/Stage scope link as an optional filter in the single workspace', () => {
    Object.assign(mocks.academic, { boardId: 'board-2', mediumId: 'medium-2' });
    mocks.scopeKey = 'second:definition-second';
    mocks.state.tab = 'sessions';
    const { result } = renderHook(() => useAssessmentWorkspaceData(true));
    expect(result.current.visibleScope?.admissionOfferingId).toBe('second');
    expect(result.current.setScope).toBe(mocks.setScope);
    expect(mocks.applicants.mock.lastCall?.[0]).toMatchObject({
      admissionOfferingId: 'second',
      workflowStageDefinitionId: 'definition-second',
    });
    expect(mocks.applicants.mock.lastCall?.[1]).toMatchObject({ skip: true });
    expect(mocks.sessions.mock.lastCall?.[1]).toMatchObject({ skip: true });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('resolves a selected session independently when it is not in the first paged session list', () => {
    mocks.state.sessionId = 'chosen-session';
    mocks.selectedSession.mockReturnValue({ currentData: session(), isError: false });
    const { result } = renderHook(() => useAssessmentWorkspaceData(true));
    expect(mocks.selectedSession.mock.lastCall?.[0]).toBe('chosen-session');
    expect(result.current.sessionChoices.map((item) => item.id)).toEqual([
      'chosen-session',
      'first-page-session',
    ]);
    expect(result.current.invalidSession).toBe(false);
    expect(mocks.applicants.mock.lastCall?.[0]).toMatchObject({ sessionId: 'chosen-session' });
    expect(mocks.applicants.mock.lastCall?.[1]).toMatchObject({ skip: false });
  });

  it.each([
    { currentData: undefined, isFetching: true, isError: false },
    { currentData: undefined, isFetching: false, isError: true },
    { currentData: session(), isFetching: false, isError: true },
    { currentData: session('chosen-session', 'not-authorized'), isFetching: false, isError: false },
  ])(
    'never broadens a loading, forbidden or stale selected session to all applicants',
    (selectedQuery) => {
      mocks.state.sessionId = 'chosen-session';
      mocks.selectedSession.mockReturnValue(selectedQuery);
      renderHook(() => useAssessmentWorkspaceData(true));
      expect(mocks.applicants.mock.lastCall?.[0]).toMatchObject({ sessionId: 'chosen-session' });
      expect(mocks.applicants.mock.lastCall?.[1]).toMatchObject({ skip: true });
      expect(mocks.update).not.toHaveBeenCalled();
    }
  );

  it('rejects a selected session that does not contain the explicitly filtered assessment scope', () => {
    Object.assign(mocks.academic, { boardId: 'board-2', mediumId: 'medium-2' });
    mocks.scopeKey = 'second:definition-second';
    mocks.state.sessionId = 'chosen-session';
    mocks.selectedSession.mockReturnValue({ currentData: session(), isError: false });
    const { result } = renderHook(() => useAssessmentWorkspaceData(true));
    expect(result.current.invalidSession).toBe(true);
    expect(mocks.applicants.mock.lastCall?.[1]).toMatchObject({ skip: true });
  });

  it.each(['no-year', 'no-view', 'stale-scope', 'scope-error', 'scope-loading'] as const)(
    'does not fetch a broadened roster when prerequisites fail: %s',
    (condition) => {
      if (condition === 'no-year') mocks.academic.academicYearId = '';
      if (condition === 'stale-scope') mocks.scopeKey = 'removed:definition-removed';
      if (condition === 'scope-error')
        mocks.scopes.mockReturnValue({ currentData: allowedScopes(), isError: true });
      if (condition === 'scope-loading')
        mocks.scopes.mockReturnValue({ currentData: undefined, isError: false });
      const { result } = renderHook(() => useAssessmentWorkspaceData(condition !== 'no-view'));
      expect(result.current.ready).toBe(false);
      expect(mocks.sessions.mock.lastCall?.[1]).toMatchObject({ skip: true });
      expect(mocks.selectedSession.mock.lastCall?.[1]).toMatchObject({ skip: true });
      expect(mocks.applicants.mock.lastCall?.[1]).toMatchObject({ skip: true });
      if (condition === 'no-view')
        expect(mocks.scopes.mock.lastCall?.[1]).toMatchObject({ skip: true });
    }
  );
});

describe('assessment workspace paging and search', () => {
  it('sends restored status, global search, sort and zero-based page offset', () => {
    Object.assign(mocks.state, {
      status: 'ongoing',
      search: 'Sam & Ali',
      sort: 'applicantName',
      direction: 'asc',
      page: 2,
      size: 50,
    });
    renderHook(() => useAssessmentWorkspaceData(true));
    expect(mocks.applicants.mock.lastCall?.[0]).toMatchObject({
      status: 'ongoing',
      search: 'Sam & Ali',
      sorting: 'applicantName asc',
      skipCount: 100,
      maxResultCount: 50,
    });
  });

  it('repairs an emptied page only after a successful current response', () => {
    mocks.state.page = 3;
    mocks.applicants.mockReturnValue({
      currentData: { totalCount: 26 },
      isFetching: false,
      isError: false,
    });
    renderHook(() => useAssessmentWorkspaceData(true));
    expect(mocks.update).toHaveBeenCalledExactlyOnceWith({ assessmentPage: 1 }, true);
  });

  it.each([
    { isFetching: true, isError: false },
    { isFetching: false, isError: true },
  ])('does not repair pagination from a loading or failed result', (status) => {
    mocks.state.page = 3;
    mocks.applicants.mockReturnValue({ currentData: { totalCount: 0 }, ...status });
    renderHook(() => useAssessmentWorkspaceData(true));
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('preserves restored page when search is unchanged and returns to page one for an actual search change', () => {
    Object.assign(mocks.state, { page: 2, search: 'Sam' });
    const { result } = renderHook(() => useAssessmentWorkspaceData(true));
    result.current.updateSearch('Sam');
    expect(mocks.update).not.toHaveBeenCalled();
    result.current.updateSearch('Ali');
    expect(mocks.update).toHaveBeenCalledExactlyOnceWith(
      { assessmentSearch: 'Ali', assessmentPage: 0 },
      true
    );
  });
});
