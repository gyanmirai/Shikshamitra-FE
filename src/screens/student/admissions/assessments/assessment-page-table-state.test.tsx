import type { ReactNode } from 'react';
import type { ICustomizableTableProps } from 'src/components/customizabaleTable/types';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';
import { assessmentResponse } from 'src/redux/student/admissions/assessment-test-fixture';

import AdmissionAssessmentsScreen from '../admission-assessments';

const mocks = vi.hoisted(() => ({
  book: false,
  select: undefined as ((rows: any[], checked: boolean) => void) | undefined,
  table: null as Pick<ICustomizableTableProps, 'filters' | 'onServerFilter'> | null,
  workbench: {
    academic: { academicYearId: 'year', boardId: 'board-1', mediumId: 'medium-1', standardId: '' },
    scopes: {
      isError: false,
      isLoading: false,
      isFetching: false,
      currentData: [] as any[],
      refetch: vi.fn(),
    },
    state: {
      tab: 'applicants',
      sessionPage: 0,
      sessionSize: 25,
      sessionSearch: '',
      manageSessions: false,
      columnFilters: '',
      status: 'all',
      sessionId: '',
      search: '',
      page: 0,
      size: 25,
      sort: 'enteredAt',
      direction: 'desc',
    },
    applicants: {
      currentData: undefined as
        { items: { applicantName: string }[]; totalCount: number } | undefined,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    },
    updateWorkbench: vi.fn(),
    href: (values: Record<string, string>) =>
      `/student/admissions/assessments?${new URLSearchParams(values)}`,
    updateSearch: vi.fn(),
    context: {},
    scopeKey: '',
    visibleScopes: [],
    invalidSession: false,
    invalidScope: false,
    sessionLookupUnavailable: false,
  },
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('./use-assessment-workspace-data', () => ({
  useAssessmentWorkspaceData: (_canView: boolean, pause: boolean) => ({
    ...mocks.workbench,
    scopes: pause ? { ...mocks.workbench.scopes, currentData: undefined } : mocks.workbench.scopes,
    applicants: pause
      ? { ...mocks.workbench.applicants, currentData: undefined }
      : mocks.workbench.applicants,
  }),
}));
vi.mock('./use-assessment-permissions', () => ({
  useAssessmentPermissions: () => ({ view: true, book: mocks.book, manageSessions: mocks.book }),
  canAdvanceAssessmentApplications: () => false,
}));
vi.mock('./assessment-workspace-controls', () => ({ AssessmentWorkspaceControls: () => null }));
vi.mock('./assessment-applicant-table', () => ({
  AssessmentApplicantTable: ({
    items,
    errorContent,
    noDataText,
    filters,
    onServerFilter,
    onSelectionChange,
  }: {
    items: { applicantName: string }[];
    errorContent?: ReactNode;
    noDataText?: ReactNode;
    onSelectionChange?: (rows: any[], checked: boolean) => void;
  } & Pick<ICustomizableTableProps, 'filters' | 'onServerFilter'>) => {
    mocks.table = { filters, onServerFilter };
    mocks.select = onSelectionChange;
    return (
      <div>
        {items.map((row) => (
          <span key={row.applicantName}>{row.applicantName}</span>
        ))}
        {errorContent || noDataText}
      </div>
    );
  },
}));
vi.mock('../admission-academic-filters', () => ({ AdmissionAcademicFilters: () => null }));
vi.mock('../admission-query-error', () => ({ AdmissionQueryError: () => null }));
vi.mock('./assessment-session-setup-drawer', () => ({ AssessmentSessionSetupDrawer: () => null }));
vi.mock('./assessment-student-booking-drawer', () => ({
  AssessmentStudentBookingDrawer: ({ rows, scopes }: any) => (
    <div data-testid="student-booking">
      {rows.map((row: any) => row.applicantName).join(', ')} · {scopes.length} scopes
      <span data-testid="booking-capability">
        {rows.map((row: any) => String(row.assessment.canBook)).join(', ')}
      </span>
    </div>
  ),
}));
vi.mock('./assessment-sessions-panel', () => ({
  AssessmentSessionsPanel: () => null,
}));
vi.mock('src/redux/student/admissions/admission-assessment-planning-api', () => ({
  usePreviewAssessmentSessionMutation: () => [vi.fn()],
  useConfirmAssessmentSessionMutation: () => [vi.fn()],
  useUpdateSharedAssessmentSessionMutation: () => [vi.fn()],
  useCancelSharedAssessmentSessionMutation: () => [vi.fn()],
  useLazyGetAssessmentInterviewersQuery: () => [vi.fn()],
  useGetAssessmentSessionResourcesQuery: () => ({}),
  useGetAssessmentSessionWorkbenchQuery: () => ({}),
}));

beforeEach(() => {
  mocks.book = false;
  mocks.workbench.scopes.currentData = [];
  mocks.workbench.state.status = 'all';
  mocks.workbench.state.tab = 'applicants';
  mocks.workbench.state.columnFilters = '';
  mocks.workbench.updateWorkbench.mockClear();
  mocks.workbench.scopes.isError = false;
  mocks.workbench.applicants.isError = false;
  mocks.workbench.applicants.isFetching = false;
  mocks.workbench.applicants.currentData = undefined;
});

it('carries selected students into existing-session booking under the Student tab', () => {
  mocks.book = true;
  mocks.workbench.scopes.currentData = [
    { admissionOfferingId: 'offering', workflowStageDefinitionId: 'definition' },
  ];
  const row = {
    applicationId: 'app',
    stageInstanceId: 'stage',
    applicantName: 'Sweta',
    isActive: true,
    admissionOfferingId: 'offering',
    workflowStageDefinitionId: 'definition',
    assessment: {
      ...assessmentResponse,
      policy: { ...assessmentResponse.policy!, schedulingEnabled: true },
    },
  };
  mocks.workbench.applicants.currentData = { items: [row], totalCount: 1 };
  renderPage();
  expect(screen.getByRole('tab', { name: 'Session' })).toHaveAttribute(
    'href',
    expect.stringContaining('assessmentTab=sessions')
  );
  expect(screen.getByRole('tab', { name: 'Student' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.queryByRole('button', { name: 'Create session' })).not.toBeInTheDocument();
  expect(mocks.select).toBeDefined();
  act(() => mocks.select!([row], true));
  fireEvent.click(screen.getByRole('button', { name: 'Book session (1)' }));
  expect(screen.getByTestId('student-booking')).toHaveTextContent('Sweta');
  expect(screen.getByTestId('student-booking')).toHaveTextContent('1 scopes');
  expect(screen.getByText('Sweta', { exact: true })).toBeVisible();
});

it('puts session creation in Session and does not render the inactive Student table', () => {
  mocks.book = true;
  mocks.workbench.state.tab = 'sessions';
  mocks.workbench.applicants.currentData = {
    items: [{ applicantName: 'Inactive panel row' }],
    totalCount: 1,
  };
  renderPage();
  expect(screen.getByRole('button', { name: 'Create session' })).toBeInTheDocument();
  expect(screen.queryByText('Inactive panel row')).not.toBeInTheDocument();
  expect(screen.getByRole('tab', { name: 'Session' })).toHaveAttribute('aria-selected', 'true');
});

it('keeps precise Status filtering independent of the progress-tab chip and resets paging', () => {
  mocks.workbench.state.status = 'complete';
  renderPage();
  const status = {
    column: 'status',
    type: 'equals',
    value: 'waived',
    valueType: 'enum',
    label: 'Status',
  };
  expect(mocks.table!.filters).toContainEqual(
    expect.objectContaining({ column: 'assessmentProgress', value: 'complete' })
  );
  mocks.table!.onServerFilter!([...(mocks.table!.filters ?? []), status]);
  expect(mocks.workbench.updateWorkbench).toHaveBeenLastCalledWith({
    assessmentFilters: '[{"column":"status","type":"equals","value":"waived","valueType":"enum"}]',
    assessmentStatus: 'complete',
    assessmentPage: 0,
  });
  mocks.table!.onServerFilter!([status]);
  expect(mocks.workbench.updateWorkbench).toHaveBeenLastCalledWith(
    expect.objectContaining({ assessmentStatus: undefined })
  );
});
const renderPage = () => {
  const store = configureStore({
    reducer: () => ({ auth: { permissions: [] }, confirmPopup: { isChanges: false } }),
  });
  const page = () => (
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AdmissionAssessmentsScreen />
      </ThemeProvider>
    </Provider>
  );
  const result = render(page());
  return { ...result, rerenderPage: () => result.rerender(page()) };
};

it('does not claim no configured stages after scope lookup fails', () => {
  mocks.workbench.scopes.isError = true;
  renderPage();
  expect(
    screen.queryByText('No assessment stages are configured for this academic context.')
  ).not.toBeInTheDocument();
});
it('retains safe rows after a roster refresh fails', () => {
  mocks.workbench.applicants.isError = true;
  mocks.workbench.applicants.currentData = {
    items: [{ applicantName: 'Safe applicant' }],
    totalCount: 1,
  };
  renderPage();
  expect(screen.getByText('Safe applicant')).toBeInTheDocument();
});

it('puts Student first and allows booked selections to open booking guidance', () => {
  mocks.book = true;
  const row = {
    applicationId: 'app',
    stageInstanceId: 'active-stage',
    applicantName: 'Booked student',
    isActive: true,
    admissionOfferingId: 'offering',
    workflowStageDefinitionId: 'definition',
    assessment: {
      ...assessmentResponse,
      policy: { ...assessmentResponse.policy!, schedulingEnabled: true },
      canBook: false,
    },
  };
  mocks.workbench.applicants.currentData = { items: [row], totalCount: 1 };
  renderPage();
  expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual(['Student', 'Session']);
  act(() => mocks.select!([row], true));
  expect(screen.getByRole('button', { name: 'Book session (1)' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Book session (1)' }));
  expect(screen.getByTestId('student-booking')).toHaveTextContent('Booked student');
});

it('uses fresh booking capability for an already-selected student after roster refresh', () => {
  mocks.book = true;
  const row = {
    applicationId: 'app',
    stageInstanceId: 'stage',
    applicantName: 'QA student',
    isActive: true,
    assessment: { ...assessmentResponse, canBook: false },
  };
  mocks.workbench.applicants.currentData = { items: [row], totalCount: 1 };
  const page = renderPage();
  act(() => mocks.select!([row], true));
  const refreshed = { ...row, assessment: { ...row.assessment, canBook: true } };
  mocks.workbench.applicants.currentData = {
    items: [refreshed],
    totalCount: 1,
  };
  page.rerenderPage();
  fireEvent.click(screen.getByRole('button', { name: 'Book session (1)' }));
  expect(screen.getByTestId('booking-capability')).toHaveTextContent('true');
});

it.each(['inactive', 'missing', 'other-application', 'missing-policy'])(
  'removes a selection that is no longer selectable after a successful refresh: %s',
  (condition) => {
    mocks.book = true;
    const row = {
      applicationId: 'app',
      stageInstanceId: 'stage',
      applicantName: 'QA student',
      isActive: true,
      assessment: assessmentResponse,
    };
    mocks.workbench.applicants.currentData = { items: [row], totalCount: 1 };
    const page = renderPage();
    act(() => mocks.select!([row], true));
    const refreshed = {
      ...row,
      isActive: condition !== 'inactive',
      applicationId: condition === 'other-application' ? 'other-app' : row.applicationId,
      assessment:
        condition === 'missing-policy'
          ? { ...assessmentResponse, policy: null }
          : assessmentResponse,
    };
    mocks.workbench.applicants.currentData = {
      items: condition === 'missing' ? [] : [refreshed],
      totalCount: condition === 'missing' ? 0 : 1,
    };
    page.rerenderPage();
    expect(screen.getByRole('button', { name: 'Book session (0)' })).toBeDisabled();
  }
);

it.each(['loading', 'error', 'paused'])(
  'retains selection when current roster evidence is unavailable: %s',
  (condition) => {
    mocks.book = true;
    const row = {
      applicationId: 'app',
      stageInstanceId: 'stage',
      applicantName: 'QA student',
      isActive: true,
      assessment: assessmentResponse,
    };
    mocks.workbench.applicants.currentData = { items: [row], totalCount: 1 };
    const page = renderPage();
    act(() => mocks.select!([row], true));
    mocks.workbench.applicants.currentData =
      condition === 'paused' ? undefined : { items: [], totalCount: 0 };
    mocks.workbench.applicants.isFetching = condition === 'loading';
    mocks.workbench.applicants.isError = condition === 'error';
    page.rerenderPage();
    expect(screen.getByRole('button', { name: 'Book session (1)' })).toBeEnabled();
  }
);
