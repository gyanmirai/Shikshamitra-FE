import type { ApplicationAssessment } from 'src/redux/student/admissions/admission-assessment-types';
import type { AssessmentRosterItem } from 'src/redux/student/admissions/admission-assessment-roster-api';

import { vi, it, expect, beforeEach } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { DEFAULT_ASSESSMENT_POLICY } from 'src/redux/student/admissions/admission-assessment-policy';

import { AssessmentApplicantDrawer } from './assessment-workbench-drawers';

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  refetch: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
  dismiss: vi.fn(),
  permissions: { book: true, attendance: true, results: true, waive: true },
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { info: mocks.info, error: mocks.error, dismiss: mocks.dismiss },
}));
vi.mock('src/redux/student/admissions/admission-assessments-api', () => ({
  useGetApplicationAssessmentQuery: mocks.query,
}));
vi.mock('./use-assessment-permissions', () => ({
  useAssessmentPermissions: () => mocks.permissions,
}));

const assessment: ApplicationAssessment = {
  applicationId: 'application-1',
  stageInstanceId: 'stage-1',
  assessmentEnabled: true,
  policy: DEFAULT_ASSESSMENT_POLICY,
  attempts: [
    {
      id: 'attempt-1',
      attemptNumber: 1,
      sessionId: 'session-1',
      sessionName: 'Entrance exam',
      sessionStartsAt: '2026-11-18T10:00:00Z',
      sessionEndsAt: '2026-11-18T11:00:00Z',
      sessionLocation: 'Room A',
      attendance: 'pending',
      status: 'pending',
      outcome: 'pending',
      concurrencyStamp: 'attempt-stamp',
      createdAt: '2026-11-17T09:00:00Z',
    },
  ],
  concurrencyStamp: 'fresh-stamp',
  blockers: [
    'Record the required assessment attendance and result.',
    'Attendance and results become available when the session starts.',
  ],
  canComplete: false,
  canBook: false,
  canRecordAttendance: false,
  canRecordResult: false,
  canReview: false,
  canRetake: false,
  canWaive: true,
  canCancel: true,
};
const row: AssessmentRosterItem = {
  applicationId: 'application-1',
  applicationNumber: 'APP-2026-000001',
  applicantId: 'student-1',
  applicantName: 'QA Student',
  stageInstanceId: 'stage-1',
  stageName: 'Entrance assessment',
  applicationStatus: 0,
  stageStatus: 0,
  isActive: true,
  queue: 'attendance',
  assessment: { ...assessment, concurrencyStamp: 'older-stamp' },
};
const query = (data: ApplicationAssessment | undefined = assessment, extra = {}) => ({
  currentData: data,
  isError: false,
  isFetching: false,
  refetch: mocks.refetch,
  ...extra,
});
const drawer = (overrides = {}) => {
  const props = {
    row,
    canViewApplication: true,
    canAdvance: true,
    onAction: vi.fn(),
    returnUrl: '/student/admissions/assessments?assessmentTab=students',
    onClose: vi.fn(),
    ...overrides,
  };
  return { ...render(<AssessmentApplicantDrawer {...props} />), props };
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.permissions.book = true;
  mocks.permissions.attendance = true;
  mocks.permissions.results = true;
  mocks.permissions.waive = true;
  mocks.query.mockReturnValue(query());
});

it('uses the existing drawer section anatomy and keeps both close controls reachable', () => {
  const { props } = drawer();
  expect(screen.getByRole('dialog', { name: 'Assessment Details' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Assessment Details information' })).toBeVisible();
  ['Student Details', 'Assessment Actions', 'Attempt History'].forEach((title) => {
    expect(screen.getByRole('region', { name: title })).toBeVisible();
    expect(screen.getByRole('button', { name: `${title} information` })).toBeVisible();
  });
  const identity = within(screen.getByRole('region', { name: 'Student Details' }));
  ['QA Student', 'APP-2026-000001', 'Entrance assessment'].forEach((text) =>
    expect(identity.getByText(text)).toBeVisible()
  );
  expect(identity.getByRole('link', { name: 'Open Application' })).toHaveAttribute(
    'href',
    '/student/admissions/applications/application-1?returnTo=%2Fstudent%2Fadmissions%2Fassessments%3FassessmentTab%3Dstudents'
  );
  expect(
    within(screen.getByRole('region', { name: 'Attempt History' })).getByText('Attempt 1')
  ).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Close Assessment Details' }));
  fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  expect(props.onClose).toHaveBeenCalledTimes(2);
});

it('shows one short session instruction in its owning section without opening a toast', () => {
  drawer();
  expect(
    screen.getAllByText('After the session starts, record attendance and enter the result.')
  ).toHaveLength(1);
  expect(screen.queryByText(assessment.blockers[0])).not.toBeInTheDocument();
  expect(screen.queryByText(assessment.blockers[1])).not.toBeInTheDocument();
  expect(mocks.info).not.toHaveBeenCalled();
});

it('keeps unknown backend blockers visible and passes the freshest assessment to action callbacks', () => {
  mocks.query.mockReturnValue(
    query({ ...assessment, blockers: ['A required document is unavailable.'] })
  );
  const { props } = drawer();
  expect(screen.getByText('A required document is unavailable.')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Complete Assessment Step' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Cancel Attempt' }));
  expect(props.onAction).toHaveBeenCalledWith(
    expect.objectContaining({
      assessment: expect.objectContaining({ concurrencyStamp: 'fresh-stamp' }),
    }),
    'cancel'
  );
  expect(mocks.query).toHaveBeenCalledWith(
    { applicationId: row.applicationId, stageInstanceId: row.stageInstanceId },
    { refetchOnMountOrArgChange: true }
  );
});

it('keeps current permissions and background-refresh locks on existing actions', () => {
  mocks.permissions.book = false;
  mocks.permissions.waive = false;
  mocks.query.mockReturnValue(query({ ...assessment, blockers: [] }));
  const { rerender, props } = drawer({ canViewApplication: false, canAdvance: false });
  expect(screen.queryByRole('link', { name: 'Open Application' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Cancel Attempt' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Waive Assessment' })).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Complete Assessment Step' })
  ).not.toBeInTheDocument();
  expect(screen.getByText('No actions are available for this assessment.')).toBeVisible();
  mocks.permissions.book = true;
  mocks.permissions.waive = true;
  mocks.query.mockReturnValue(query(assessment, { isFetching: true }));
  rerender(<AssessmentApplicantDrawer {...props} canAdvance />);
  expect(screen.getByRole('button', { name: 'Cancel Attempt' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Waive Assessment' })).toBeDisabled();
  expect(
    screen.queryByText('No actions are available for this assessment.')
  ).not.toBeInTheDocument();
});

it('retains the record header and close controls while detail data loads', () => {
  mocks.query.mockReturnValue({ ...query(), currentData: undefined, isFetching: true });
  drawer();
  expect(screen.getByText('QA Student')).toBeVisible();
  expect(screen.getByRole('status', { name: 'Loading Assessment Details' })).toBeVisible();
  expect(screen.queryByText('Attempt 1')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Close' })).toBeEnabled();
});

it('keeps request failure feedback with the existing retry owner and displays no stale attempts', () => {
  mocks.query.mockReturnValue(query(assessment, { isError: true }));
  drawer();
  expect(mocks.error).toHaveBeenCalledOnce();
  expect(mocks.info).not.toHaveBeenCalled();
  expect(screen.queryByText('Attempt 1')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Close Assessment Details' })).toBeEnabled();
});

it('shows a clear empty attempt history and preserves the authorized completion callback', () => {
  mocks.query.mockReturnValue(
    query({ ...assessment, attempts: [], blockers: [], canComplete: true })
  );
  const { props } = drawer();
  expect(
    within(screen.getByRole('region', { name: 'Attempt History' })).getByText(
      'No attempts recorded yet.'
    )
  ).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Complete Assessment Step' }));
  expect(props.onAction).toHaveBeenCalledWith(
    expect.objectContaining({ applicationId: row.applicationId }),
    'continue'
  );
});
