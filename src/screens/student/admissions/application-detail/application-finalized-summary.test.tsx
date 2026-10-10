import type { StudentOnboardingCase } from 'src/redux/student/onboarding/student-onboarding-types';
import type {
  AdmissionApplication,
  AdmissionApplicationWorkflow,
} from 'src/redux/student/admissions/admission-applications-api';

import { vi, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import {
  ApplicationFinalizedActions,
  ApplicationFinalizedSummary,
} from './application-finalized-summary';

const mocks = vi.hoisted(() => ({
  caseQuery: vi.fn(),
  feeQuery: vi.fn(),
  retryCase: vi.fn(),
  retryFee: vi.fn(),
  retryHistory: vi.fn(),
  permissions: [] as Array<{ name: string; isGranted: boolean }>,
}));
vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ auth: { permissions: mocks.permissions } }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));
vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useGetStudentOnboardingCaseQuery: mocks.caseQuery,
}));
vi.mock('src/redux/student/admissions/admission-fee-selection-api', () => ({
  useGetAdmissionFeeSelectionQuery: mocks.feeQuery,
}));

const application = {
  id: 'application-1',
  applicationNumber: 'APP-2026-000012',
  applicantName: 'Test Applicant',
  standardName: 'Class 5',
  status: 11,
  onboardingCaseId: 'case-1',
  finalizedAt: '2026-10-10T04:15:00Z',
  assignedCounsellorName: 'Different counsellor',
} as AdmissionApplication;
const onboardingCase = {
  id: 'case-1',
  documentUploadsEnabled: false,
  concurrencyStamp: 'case-stamp',
  applicationId: application.id,
  applicationNumber: application.applicationNumber,
  applicantId: 'applicant-1',
  studentId: 'student-1',
  offeringId: 'offering-1',
  offeringCode: 'CLASS5',
  academicYearId: 'year-1',
  intendedBoardId: 'board-1',
  intendedMediumId: 'medium-1',
  intendedStageId: 'stage-1',
  intendedStandardId: 'standard-1',
  dueAt: '2026-10-12T00:00:00Z',
  isHistoricalBackfill: false,
  isOverdue: false,
  progressPercent: 0,
  studentName: 'Test Applicant',
  intendedStandardName: 'Class 5',
  academicYearName: '2026–2027',
  intendedBoardName: 'CBSE',
  intendedMediumName: 'English',
  status: 0,
  steps: [
    {
      id: 'step-1',
      key: 'placement',
      displayOrder: 0,
      required: true,
      status: 0,
      label: 'Choose a division',
    },
  ],
  events: [],
} as StudentOnboardingCase;
const workflow = {
  stages: [
    { id: 'fees', name: 'Fee confirmation', stageType: 4, status: 2 },
    { id: 'docs', name: 'Document verification', stageType: 5, status: 2 },
  ],
} as AdmissionApplicationWorkflow;
const history = [
  {
    id: 'finalization',
    status: 11 as const,
    occurredAt: application.finalizedAt!,
    actorName: 'Finalizing Staff',
    reason: 'Admission finalized and transferred to Student Onboarding',
  },
];
const renderSummary = (props = {}) =>
  render(
    <ThemeProvider theme={createTheme()}>
      <ApplicationFinalizedSummary
        application={application}
        workflow={workflow}
        history={history}
        historyLoading={false}
        historyError={false}
        onRetryHistory={mocks.retryHistory}
        {...props}
      />
    </ThemeProvider>
  );

beforeEach(() => {
  vi.clearAllMocks();
  mocks.permissions = [{ name: 'Students.Onboarding.View', isGranted: true }];
  mocks.caseQuery.mockReturnValue({ currentData: onboardingCase, refetch: mocks.retryCase });
  mocks.feeQuery.mockReturnValue({
    currentData: {
      applicationId: application.id,
      available: true,
      ownerStageId: 'fees',
      selection: { structureName: 'Class 5 Regular Fees', revisionNumber: 2 },
    },
    refetch: mocks.retryFee,
  });
});

it('shows real finalization data without the success banner, UUIDs, or an assumed activation/payment', () => {
  renderSummary();
  expect(screen.getByRole('heading', { name: 'Admission finalized' })).toBeVisible();
  expect(screen.getByText('Finalizing Staff')).toBeVisible();
  expect(screen.queryByText('Different counsellor')).not.toBeInTheDocument();
  expect(screen.getByText('Class 5 / 2026–2027')).toBeVisible();
  expect(screen.getByText('CBSE / English')).toBeVisible();
  expect(screen.getByText('Class 5 Regular Fees · Revision 2')).toBeVisible();
  expect(screen.getByText('Choose a division')).toBeVisible();
  expect(screen.getByText('GR: Not assigned')).toBeVisible();
  expect(
    screen.queryByText(/successfully|durable onboarding|student-1|case-1|Paid|Activated/)
  ).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Continue onboarding' })).toHaveAttribute(
    'href',
    expect.stringContaining('search=APP-2026-000012')
  );
});

it('discloses helper guidance through the accessible handoff info icon and history on request', async () => {
  renderSummary();
  expect(screen.queryByText(/Admission is complete\. Continue/)).not.toBeInTheDocument();
  await userEvent.tab();
  await waitFor(
    () => expect(screen.getByRole('tooltip')).toHaveTextContent('Placement, GR and roll numbers'),
    { timeout: 2000 }
  );
  fireEvent.click(screen.getByRole('button', { name: 'Decision & finalization history' }));
  await waitFor(() =>
    expect(screen.getByText(/Admission finalized and transferred/)).toBeVisible()
  );
});

it('uses the persisted activation evidence and actual identifiers, including roll number zero', () => {
  mocks.caseQuery.mockReturnValue({
    currentData: {
      ...onboardingCase,
      status: 6,
      completedAt: null,
      studentEnrollmentId: 'enrollment-1',
      divisionName: 'A',
      grNumber: '1042',
      rollNumber: 0,
      credentialsPending: true,
    },
    refetch: mocks.retryCase,
  });
  renderSummary();
  expect(screen.getByText('Provisioning')).toBeVisible();
  expect(screen.getByText('Activated')).toBeVisible();
  expect(screen.getByText('Class 5 / A')).toBeVisible();
  expect(screen.getByText('GR: 1042')).toBeVisible();
  expect(screen.getByText('· Roll: 0')).toBeVisible();
  expect(screen.getByText(/Complete pending Credentials/)).toBeVisible();
});

it('does not fetch or offer onboarding navigation without the View grant', () => {
  mocks.permissions = [];
  mocks.caseQuery.mockReturnValue({ refetch: mocks.retryCase });
  renderSummary();
  expect(mocks.caseQuery).toHaveBeenCalledWith('case-1', expect.objectContaining({ skip: true }));
  expect(screen.getByText(/Onboarding viewing access is required/)).toBeVisible();
  expect(screen.queryByRole('link', { name: 'Continue onboarding' })).not.toBeInTheDocument();
  expect(screen.queryByText('Pending')).not.toBeInTheDocument();
});

it('shows loading and recoverable errors instead of pretending handover data is pending', () => {
  mocks.caseQuery.mockReturnValue({ isLoading: true, refetch: mocks.retryCase });
  const view = renderSummary();
  expect(screen.getByLabelText('Loading onboarding handover')).toBeVisible();
  view.unmount();
  mocks.caseQuery.mockReturnValue({
    isError: true,
    currentData: onboardingCase,
    refetch: mocks.retryCase,
  });
  mocks.feeQuery.mockReturnValue({ isError: true, refetch: mocks.retryFee });
  renderSummary({ historyError: true });
  expect(screen.getByText('History unavailable')).toBeVisible();
  expect(screen.queryByText('Finalizing Staff')).not.toBeInTheDocument();
  expect(screen.queryByText('GR: Not assigned')).not.toBeInTheDocument();
  fireEvent.click(screen.getAllByRole('button', { name: 'Retry' })[0]);
  expect(mocks.retryCase).toHaveBeenCalledOnce();
  fireEvent.click(screen.getAllByRole('button', { name: 'Retry' })[1]);
  expect(mocks.retryFee).toHaveBeenCalledOnce();
  expect(screen.queryByText('Verified')).not.toBeInTheDocument();
});

it('never shows a previous applicant case while the next record loads', () => {
  mocks.caseQuery.mockReturnValue({
    currentData: {
      ...onboardingCase,
      applicationId: 'old-application',
      divisionName: 'Old division',
    },
    isFetching: true,
    refetch: mocks.retryCase,
  });
  renderSummary();
  expect(screen.getByLabelText('Loading onboarding handover')).toBeVisible();
  expect(screen.queryByText(/Old division/)).not.toBeInTheDocument();
});

it('preserves missing-case and skipped-stage states without claiming checks were verified', () => {
  mocks.caseQuery.mockReturnValue({ refetch: mocks.retryCase });
  mocks.feeQuery.mockReturnValue({
    currentData: { applicationId: application.id, available: false, selection: null },
    refetch: mocks.retryFee,
  });
  renderSummary({
    application: { ...application, onboardingCaseId: null },
    workflow: { ...workflow, stages: [{ ...workflow.stages[1], status: 3 }] },
    history: [],
  });
  expect(mocks.caseQuery).toHaveBeenCalledWith('', expect.objectContaining({ skip: true }));
  expect(screen.getByText('No onboarding case is linked to this application.')).toBeVisible();
  expect(screen.getByText('Skipped')).toBeVisible();
  expect(screen.getByText('Not configured')).toBeVisible();
  expect(screen.queryByText('Verified')).not.toBeInTheDocument();
});

it('keeps saved-but-uncompleted fee selections distinct from confirmation', () => {
  renderSummary({ workflow: { ...workflow, stages: [{ ...workflow.stages[0], status: 3 }] } });
  expect(screen.getByText('Selected')).toBeVisible();
  expect(screen.queryByText('Confirmed')).not.toBeInTheDocument();
});

it('preserves the guarded back action and disables onward navigation while the workspace is busy', () => {
  const onBack = vi.fn();
  const view = render(
    <ApplicationFinalizedActions application={application} disabled onBack={onBack} />
  );
  expect(screen.getByRole('button', { name: 'Back to Applications' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Continue onboarding' })).toBeDisabled();
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
  view.rerender(<ApplicationFinalizedActions application={application} onBack={onBack} />);
  fireEvent.click(screen.getByRole('button', { name: 'Back to Applications' }));
  expect(onBack).toHaveBeenCalledOnce();
});
