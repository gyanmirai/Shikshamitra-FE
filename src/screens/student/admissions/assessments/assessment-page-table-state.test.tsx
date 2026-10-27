import type { ReactNode } from 'react';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import AdmissionAssessmentsScreen from '../admission-assessments';

const mocks = vi.hoisted(() => ({
  workbench: {
    academic: { academicYearId: 'year', boardId: '', mediumId: '', standardId: '' },
    scopes: {
      isError: false,
      isLoading: false,
      isFetching: false,
      currentData: [],
      refetch: vi.fn(),
    },
    state: {
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
  useAssessmentWorkspaceData: () => mocks.workbench,
}));
vi.mock('./use-assessment-permissions', () => ({
  useAssessmentPermissions: () => ({ view: true }),
  canAdvanceAssessmentApplications: () => false,
}));
vi.mock('./assessment-workspace-controls', () => ({ AssessmentWorkspaceControls: () => null }));
vi.mock('./assessment-applicant-table', () => ({
  AssessmentApplicantTable: ({
    items,
    errorContent,
    noDataText,
  }: {
    items: { applicantName: string }[];
    errorContent?: ReactNode;
    noDataText?: ReactNode;
  }) => (
    <div>
      {items.map((row) => (
        <span key={row.applicantName}>{row.applicantName}</span>
      ))}
      {errorContent || noDataText}
    </div>
  ),
}));
vi.mock('../admission-query-error', () => ({ AdmissionQueryError: () => null }));
vi.mock('./assessment-session-setup-drawer', () => ({ AssessmentSessionSetupDrawer: () => null }));
vi.mock('./assessment-manage-sessions-drawer', () => ({
  AssessmentManageSessionsDrawer: () => null,
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
  mocks.workbench.scopes.isError = false;
  mocks.workbench.applicants.isError = false;
  mocks.workbench.applicants.currentData = undefined;
});
const renderPage = () => {
  const store = configureStore({ reducer: () => ({ auth: { permissions: [] } }) });
  render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AdmissionAssessmentsScreen />
      </ThemeProvider>
    </Provider>
  );
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
