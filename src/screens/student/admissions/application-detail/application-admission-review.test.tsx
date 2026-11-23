import type { AdmissionApplication } from 'src/redux/student/admissions/admission-applications-api';

import { vi, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';

import { ApplicationAdmissionReview } from './application-admission-review';

const mocks = vi.hoisted(() => ({ state: {} as any, run: vi.fn() }));
vi.mock('./use-admission-approval', () => ({ useAdmissionApproval: () => mocks.state }));
vi.mock('react-redux', () => ({ useSelector: () => [] }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('./application-finalized-summary', () => ({
  ApplicationFinalizedSummary: () => <div>Historical finalized summary</div>,
}));
vi.mock('./application-form-correction-drawer', () => ({
  ApplicationFormCorrectionDrawer: () => null,
}));
vi.mock('./application-applicant-identity-dialog', () => ({
  ApplicationApplicantIdentityDialog: () => null,
}));
vi.mock('./application-decision-dialog', () => ({ ApplicationDecisionDialog: () => null }));

const application = {
  id: 'qa-application',
  applicantId: 'qa-applicant',
  applicantName: 'QA Admission',
  status: 1,
  standardName: 'Class 2',
  concurrencyStamp: 'saved-stamp',
} as AdmissionApplication;
beforeEach(() => {
  mocks.run.mockReset().mockResolvedValue({ onboardingCaseId: 'qa-case' });
  mocks.state = {
    canManage: true,
    busy: false,
    runApproval: mocks.run,
    runDecision: vi.fn(),
    previewQuery: {
      data: {
        applicationId: application.id,
        items: [{ key: 'identity', passed: true }],
        possibleMatches: [],
        primaryContact: { name: 'QA Parent', email: 'qa@example.test' },
      },
    },
    historyQuery: {},
    reloadApplication: vi.fn(),
    resetRequest: vi.fn(),
  };
});

it('shows direct small decisions and pending setup without a manual verification checkbox', () => {
  render(<ApplicationAdmissionReview application={application} />);
  expect(screen.getByRole('button', { name: 'Waitlist' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Reject' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Approve & Finalize' })).toBeEnabled();
  expect(screen.getByText('Status: Ready for Review')).toHaveAttribute('role', 'status');
  expect(
    screen.getByText('Division, GR number and roll number are completed in Student Setup.')
  ).toBeVisible();
  const student = screen.getByLabelText('Student and class');
  expect(within(student).getByText('QA Admission')).toBeVisible();
  expect(within(student).getByText('Class 2')).toBeVisible();
  const contact = screen.getByLabelText('Primary contact details');
  expect(within(contact).getByText('QA Parent')).toBeVisible();
  expect(within(contact).getByText('qa@example.test')).toBeVisible();
  expect(screen.queryByText('Profile Review Rules')).not.toBeInTheDocument();
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
});

it('holds the opening state across committed cache updates and never mounts the summary', async () => {
  let finish!: (result: any) => void;
  mocks.run.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      })
  );
  const onFinalized = vi.fn(() => true);
  const view = render(
    <ApplicationAdmissionReview application={application} onFinalized={onFinalized} />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Approve & Finalize' }));
  const pendingApproval = screen.getByRole('button', { name: 'Approve & Finalize' });
  expect(pendingApproval).toBeDisabled();
  fireEvent.click(pendingApproval);
  expect(mocks.run).toHaveBeenCalledOnce();
  const progress = screen.getByText('Finalizing admission…').closest('[role="status"]');
  expect(progress).not.toBeNull();
  expect(progress).toHaveStyle({ alignItems: 'center', justifyContent: 'center' });
  expect(screen.getAllByRole('progressbar')).toHaveLength(1);
  view.rerender(
    <ApplicationAdmissionReview
      application={{ ...application, status: 11 }}
      onFinalized={onFinalized}
    />
  );
  expect(screen.queryByText('Historical finalized summary')).not.toBeInTheDocument();
  finish({ onboardingCaseId: 'qa-case' });
  await waitFor(() => expect(screen.getByText('Opening Student Setup…')).toBeVisible());
  expect(screen.queryByText('Historical finalized summary')).not.toBeInTheDocument();
  expect(mocks.run).toHaveBeenCalledOnce();
});

it('blocks incomplete checks and keeps duplicate identity resolution explicit', () => {
  mocks.state.previewQuery.data.items = [
    { key: 'identity', label: 'Core identity', passed: false, detail: 'Date of birth missing' },
  ];
  mocks.state.previewQuery.data.possibleMatches = [
    { studentId: 'existing', studentName: 'QA Existing' },
  ];
  render(<ApplicationAdmissionReview application={application} />);
  expect(screen.getByRole('button', { name: 'Approve & Finalize' })).toBeDisabled();
  expect(screen.queryByText('Status: Ready for Review')).not.toBeInTheDocument();
  expect(screen.getByText('Date of birth missing')).toBeVisible();
  expect(screen.getByRole('radiogroup', { name: 'Student Identity' })).toBeVisible();
});

it('retains the review after a rejected request and permits a safe retry', async () => {
  mocks.run.mockResolvedValueOnce(null);
  render(<ApplicationAdmissionReview application={application} />);
  fireEvent.click(screen.getByRole('button', { name: 'Approve & Finalize' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Approve & Finalize' })).toBeEnabled()
  );
  expect(screen.getByText('qa@example.test')).toBeVisible();
});

it('places navigation recovery outside the locked content and never repeats finalization', async () => {
  const target = document.createElement('footer');
  document.body.appendChild(target);
  const onFinalized = vi.fn(() => true);
  const view = render(
    <fieldset disabled>
      <ApplicationAdmissionReview
        application={application}
        footerElement={target}
        onFinalized={onFinalized}
      />
    </fieldset>
  );
  const button = screen.getByRole('button', { name: 'Approve & Finalize' });
  fireEvent.click(button);
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Open Student Setup' })).toBeEnabled()
  );
  fireEvent.click(screen.getByRole('button', { name: 'Open Student Setup' }));
  expect(onFinalized).toHaveBeenCalledTimes(2);
  expect(mocks.run).toHaveBeenCalledOnce();
  view.unmount();
  target.remove();
});

it.each(['loading', 'error', 'permission', 'busy'])('fails closed for %s states', (state) => {
  if (state === 'loading') mocks.state.previewQuery.isFetching = true;
  if (state === 'error') mocks.state.previewQuery.isError = true;
  if (state === 'permission') mocks.state.canManage = false;
  if (state === 'busy') mocks.state.busy = true;
  render(<ApplicationAdmissionReview application={application} />);
  const button = screen.queryByRole('button', { name: 'Approve & Finalize' });
  if (button) expect(button).toBeDisabled();
  else expect(state).toBe('permission');
});
