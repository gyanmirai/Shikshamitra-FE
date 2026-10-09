import type { ApplicationAssessment } from 'src/redux/student/admissions/admission-assessment-types';
import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { vi, it, expect, beforeEach } from 'vitest';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { DEFAULT_ASSESSMENT_POLICY } from 'src/redux/student/admissions/admission-assessment-policy';

import { ApplicationAssessmentPanel } from './application-assessment-panel';

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  refetch: vi.fn(),
  permissions: { view: true, book: true, attendance: true, results: true, waive: true },
}));
vi.mock('src/redux/student/admissions/admission-assessments-api', () => ({
  useGetApplicationAssessmentQuery: mocks.query,
}));
vi.mock('./use-assessment-permissions', () => ({
  useAssessmentPermissions: () => mocks.permissions,
}));
vi.mock('./assessment-action-dialog', () => ({
  AssessmentActionDialog: ({ action }: { action: string }) => (
    <div role="dialog">Action {action}</div>
  ),
}));

const base: ApplicationAssessment = {
  applicationId: 'application-1',
  stageInstanceId: 'stage-1',
  assessmentEnabled: true,
  policy: DEFAULT_ASSESSMENT_POLICY,
  attempts: [],
  concurrencyStamp: 'stamp',
  blockers: [],
  canComplete: false,
  canBook: true,
  canRecordAttendance: false,
  canRecordResult: false,
  canReview: false,
  canRetake: false,
  canWaive: true,
  canCancel: false,
};
const stage = {
  id: 'stage-1',
  name: 'Entrance assessment',
  definitionStageId: 'definition-1',
} as AdmissionApplicationStage;
const query = (data = base, extra = {}) => ({
  currentData: data,
  isLoading: false,
  isFetching: false,
  isError: false,
  refetch: mocks.refetch,
  ...extra,
});
const panel = (onComplete = vi.fn()) =>
  render(
    <ThemeProvider theme={createTheme()}>
      <ApplicationAssessmentPanel
        compact
        applicationId="application-1"
        admissionOfferingId="offering-1"
        stage={stage}
        canAdvance
        advancing={false}
        onComplete={onComplete}
      />
    </ThemeProvider>
  );

beforeEach(() => {
  vi.clearAllMocks();
  mocks.permissions.view = true;
  mocks.query.mockReturnValue(query());
});

it('keeps empty requirements and start/waive actions visible in compact mode', () => {
  panel();
  expect(screen.getByText('No assessment attempt has started.')).toBeVisible();
  expect(screen.getByText(/Maximum attempts:/)).toBeVisible();
  expect(screen.getByRole('button', { name: 'Waive' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Start assessment' }));
  expect(screen.getByRole('dialog')).toHaveTextContent('Action book');
});

it('keeps the latest result visible and older attempts available through collapsed history', async () => {
  const attempt = {
    id: 'old',
    attemptNumber: 1,
    attendance: 'present' as const,
    status: 'completed' as const,
    outcome: 'failed' as const,
    createdAt: '2026-10-08T10:00:00Z',
    concurrencyStamp: 'attempt-stamp',
  };
  mocks.query.mockReturnValue(
    query({
      ...base,
      attempts: [attempt, { ...attempt, id: 'latest', attemptNumber: 2, outcome: 'passed' }],
    })
  );
  panel();
  expect(screen.getByText('Attempt 2')).toBeVisible();
  expect(screen.getByText('Attempt 1')).not.toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Previous attempts (1)' }));
  await waitFor(() => expect(screen.getByText('Attempt 1')).toBeVisible());
});

it('retains completion capability checks and does not forward click events', () => {
  const onComplete = vi.fn();
  mocks.query.mockReturnValue(query({ ...base, canComplete: true }));
  panel(onComplete);
  fireEvent.click(screen.getByRole('button', { name: 'Complete assessment step' }));
  expect(onComplete).toHaveBeenCalledWith();
});

it('does not expose assessment controls without view access and skips the query', () => {
  mocks.permissions.view = false;
  panel();
  expect(mocks.query).toHaveBeenCalledWith(
    { applicationId: 'application-1', stageInstanceId: 'stage-1' },
    { skip: true }
  );
  expect(screen.queryByRole('button', { name: 'Start assessment' })).not.toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent('Assessment access is required');
});

it('locks compact stage controls during refresh and supports query retry', () => {
  mocks.query.mockReturnValue(query(base, { isFetching: true }));
  const { unmount } = panel();
  expect(screen.getByRole('button', { name: 'Start assessment' })).toBeDisabled();
  unmount();
  mocks.query.mockReturnValue(query(base, { isError: true }));
  panel();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(mocks.refetch).toHaveBeenCalledOnce();
});
