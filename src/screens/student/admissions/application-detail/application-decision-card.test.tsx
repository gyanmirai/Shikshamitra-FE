import type {
  AdmissionApplication,
  AdmissionApplicationWorkflow,
} from 'src/redux/student/admissions/admission-applications-api';

import { vi, it, expect, beforeEach } from 'vitest';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { ApplicationDecisionCard } from './application-decision-card';

const mocks = vi.hoisted(() => ({ decisions: vi.fn(), refetch: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));
vi.mock('./application-finalized-summary', () => ({
  ApplicationFinalizedSummary: ({ application }: { application: AdmissionApplication }) => (
    <section>
      <h2>Admission finalized</h2>
      <a href={`/student/onboarding/student-setup?search=${application.applicationNumber}`}>
        Continue onboarding
      </a>
    </section>
  ),
}));
vi.mock('src/redux/student/admissions/admission-applications-api', () => ({
  useLazyGetAdmissionApplicationQuery: () => [vi.fn()],
}));
vi.mock('./use-admission-application-decisions', async (original) => ({
  ...(await original<typeof import('./use-admission-application-decisions')>()),
  useAdmissionApplicationDecisions: mocks.decisions,
}));
vi.mock('./application-decision-dialog', () => ({
  ApplicationDecisionDialog: ({ open, action }: { open: boolean; action: string }) =>
    open ? <div role="dialog">Decision {action}</div> : null,
}));
vi.mock('./application-finalization-dialog', () => ({
  ApplicationFinalizationDialog: ({
    open,
    presentation,
    onClose,
  }: {
    open: boolean;
    presentation: string;
    onClose: () => void;
  }) =>
    open ? (
      <section aria-label={`Finalization ${presentation}`}>
        <button type="button" onClick={onClose}>
          Return to decision
        </button>
      </section>
    ) : null,
}));
const application = {
  id: 'application-1',
  applicationNumber: 'APP-QA',
  applicantId: 'applicant-1',
  status: 1,
} as AdmissionApplication;
const decisions = (extra = {}) => ({
  canDecide: true,
  canFinalize: true,
  isBusy: false,
  historyQuery: {
    data: [
      {
        id: 'history-1',
        status: 6,
        occurredAt: '2026-10-08T10:00:00Z',
        reason: 'Verified documents',
      },
    ],
    refetch: mocks.refetch,
  },
  finalizationPreviewQuery: {},
  ...extra,
});
const panel = (status = 1, journeyCompleted = false) =>
  render(
    <ThemeProvider theme={createTheme()}>
      <ApplicationDecisionCard
        compact
        application={{
          ...application,
          status: status as AdmissionApplication['status'],
          ...(status === 11 ? { onboardingCaseId: 'case-1' } : {}),
        }}
        journeyCompleted={journeyCompleted}
      />
    </ThemeProvider>
  );

beforeEach(() => {
  vi.clearAllMocks();
  mocks.decisions.mockReturnValue(decisions());
});

it('keeps compact decisions actionable while disclosing history on request', async () => {
  panel();
  expect(
    screen.getByText('Review the application, then choose Approve, Waitlist, or Reject.')
  ).toBeVisible();
  expect(screen.getAllByRole('heading', { name: 'Admission decision' })).toHaveLength(1);
  expect(screen.getByRole('button', { name: 'Approve' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Waitlist' })).toBeEnabled();
  expect(screen.getByText(/Verified documents/)).not.toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Decision history' }));
  await waitFor(() => expect(screen.getByText(/Verified documents/)).toBeVisible());
  fireEvent.click(screen.getByRole('button', { name: 'Reject' }));
  expect(screen.getByRole('dialog')).toHaveTextContent('Decision reject');
});

it('preserves role and busy guards in compact mode', () => {
  mocks.decisions.mockReturnValue(decisions({ isBusy: true }));
  const { unmount } = panel();
  expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
  unmount();
  mocks.decisions.mockReturnValue(decisions({ canDecide: false, canFinalize: false }));
  panel();
  expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
  expect(screen.getByText('not available for your role', { exact: false })).toBeVisible();
});

it('preserves finalization and the durable Onboarding handoff', () => {
  const { unmount } = panel(6, true);
  expect(screen.getByRole('button', { name: 'Finalize admission' })).toBeEnabled();
  unmount();
  panel(11, true);
  expect(screen.getByRole('link', { name: 'Continue onboarding' })).toHaveAttribute(
    'href',
    expect.stringContaining('search=APP-QA')
  );
  expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
});

it('reports its pending decision to the workspace and clears the busy flag on unmount', () => {
  mocks.decisions.mockReturnValue(decisions({ isBusy: true }));
  const onBusyChange = vi.fn();
  const view = render(
    <ThemeProvider theme={createTheme()}>
      <ApplicationDecisionCard
        compact
        application={application}
        journeyCompleted={false}
        onBusyChange={onBusyChange}
      />
    </ThemeProvider>
  );
  expect(onBusyChange).toHaveBeenLastCalledWith(true);
  expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
  view.unmount();
  expect(onBusyChange).toHaveBeenLastCalledWith(false);
});

it('blocks a new admission decision while another workspace operation is pending', () => {
  render(
    <ThemeProvider theme={createTheme()}>
      <ApplicationDecisionCard
        compact
        disabled
        application={application}
        journeyCompleted={false}
      />
    </ThemeProvider>
  );
  expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Reject' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('opens full-page finalization and restores journey actions on cancel and unmount', () => {
  const onFinalizationOpenChange = vi.fn();
  const view = render(
    <ThemeProvider theme={createTheme()}>
      <ApplicationDecisionCard
        compact
        application={{ ...application, status: 6 }}
        journeyCompleted
        onFinalizationOpenChange={onFinalizationOpenChange}
      />
    </ThemeProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'Finalize admission' }));
  expect(screen.getByRole('region', { name: 'Finalization inline' })).toBeVisible();
  expect(onFinalizationOpenChange).toHaveBeenLastCalledWith(true);
  expect(screen.queryByText('Record decision')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Return to decision' }));
  expect(screen.getByText('Record decision')).toBeVisible();
  expect(onFinalizationOpenChange).toHaveBeenLastCalledWith(false);
  view.unmount();
  expect(onFinalizationOpenChange).toHaveBeenLastCalledWith(false);
});

it('replaces inline finalization with the persisted summary and unlocks navigation after completion', () => {
  const onFinalizationOpenChange = vi.fn();
  const element = (status: AdmissionApplication['status']) => (
    <ThemeProvider theme={createTheme()}>
      <ApplicationDecisionCard
        compact
        application={{ ...application, status, onboardingCaseId: 'case-1' }}
        journeyCompleted
        onFinalizationOpenChange={onFinalizationOpenChange}
      />
    </ThemeProvider>
  );
  const view = render(element(6));
  fireEvent.click(screen.getByRole('button', { name: 'Finalize admission' }));
  expect(onFinalizationOpenChange).toHaveBeenLastCalledWith(true);
  view.rerender(element(11));
  expect(screen.queryByRole('region', { name: 'Finalization inline' })).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Admission finalized' })).toBeVisible();
  expect(onFinalizationOpenChange).toHaveBeenLastCalledWith(false);
});

it('permits read-only stage review without permitting mutations and locks both while busy', () => {
  const onSelectStage = vi.fn();
  const workflow: AdmissionApplicationWorkflow = {
    workflowDefinitionId: 'workflow',
    status: 0,
    startedAt: '2026-10-10T10:00:00Z',
    history: [],
    availableTransitions: [],
    stages: [
      {
        id: 'form',
        code: 'form',
        name: 'Application form',
        definitionStageId: 'form',
        stageType: 1,
        displayOrder: 1,
        status: 2,
        allowManualSkip: false,
      },
    ],
  };
  const element = (navigationDisabled = false) => (
    <ThemeProvider theme={createTheme()}>
      <ApplicationDecisionCard
        compact
        disabled
        navigationDisabled={navigationDisabled}
        application={application}
        journeyCompleted={false}
        workflow={workflow}
        onSelectStage={onSelectStage}
      />
    </ThemeProvider>
  );
  const view = render(element());
  expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Review Application form' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Review Application form' }));
  expect(onSelectStage).toHaveBeenCalledWith('form');
  mocks.decisions.mockReturnValue(decisions({ isBusy: true }));
  view.rerender(element());
  expect(screen.getByRole('button', { name: 'Review Application form' })).toBeDisabled();
  mocks.decisions.mockReturnValue(decisions());
  view.rerender(element(true));
  expect(screen.getByRole('button', { name: 'Review Application form' })).toBeDisabled();
  view.rerender(
    <ThemeProvider theme={createTheme()}>
      <ApplicationDecisionCard
        compact
        disabled
        application={application}
        journeyCompleted={false}
        workflow={workflow}
        onSelectStage={onSelectStage}
      />
    </ThemeProvider>
  );
  expect(screen.getByRole('button', { name: 'Review Application form' })).toBeDisabled();
});
