import type { ReactNode } from 'react';
import type { PayrollBatch } from 'src/redux/runPayroll/payroll-approval-api';

import userEvent from '@testing-library/user-event';
import { it, vi, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, fireEvent } from '@testing-library/react';

import { PayrollApprovalPanel } from './payroll-approval-panel';

const mocks = vi.hoisted(() => ({
  batches: [] as PayrollBatch[],
  sectionSubmit: vi.fn(),
  submit: vi.fn(),
  resolve: vi.fn(),
  onSubmitted: vi.fn(),
}));

vi.mock('src/redux/runPayroll/payroll-approval-api', () => ({
  usePayrollSubmissionsQuery: () => ({ currentData: mocks.batches }),
  usePayrollSubmissionQuery: (id: string) => {
    const submission = mocks.batches.find((batch) => batch.id === id);
    return { currentData: submission && { submission, items: [] } };
  },
  useSubmitPayrollMutation: () => [mocks.submit, { isLoading: false }],
  useSubmitPayrollSectionReviewsMutation: () => [mocks.sectionSubmit, { isLoading: false }],
  useResolvePayrollSubmissionMutation: () => [mocks.resolve, { isLoading: false }],
}));

vi.mock('src/components/customDialog', () => ({
  default: ({ open, title, children }: { open: boolean; title: string; children: ReactNode }) =>
    open && (
      <section role="dialog" aria-label={title}>
        {children}
      </section>
    ),
  DialogScrollContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock('./payroll-review-sheet-buttons', () => ({ PayrollReviewSheetButtons: () => null }));

const pending: PayrollBatch = {
  id: 'batch-primary',
  version: 2,
  stageId: 'stage-primary',
  stageName: 'Primary',
  reviewerRoleId: 'role-primary',
  reviewerRoleName: 'Primary principal',
  state: 'Pending',
  staffCount: 1,
  netPay: 50_000,
  approverId: '',
  submitterId: 'hr-user',
  isStale: false,
  selfFinalization: false,
  reasonCode: null,
  allowedActions: ['review', 'return'],
};

const theme = createTheme(defaultSettings);

function panel(canSubmit = false, version = 7) {
  return (
    <ThemeProvider theme={theme}>
      <PayrollApprovalPanel
        period={{ month: '2026-08', academicYearId: 'year-1' }}
        settings={{
          mode: 'SectionReview',
          version,
          approverId: null,
          allowSelfFinalization: false,
        }}
        selection={{ previewRunId: 'run-1', employeeIds: ['staff-1'], netPay: 50_000 }}
        canSubmit={canSubmit}
        canSelfFinalize={false}
        canExport={false}
        onSubmitted={mocks.onSubmitted}
      />
    </ThemeProvider>
  );
}

function view(canSubmit = false) {
  return render(panel(canSubmit));
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.batches = [pending];
  mocks.sectionSubmit.mockReturnValue({ unwrap: () => Promise.resolve([pending]) });
  mocks.resolve.mockReturnValue({
    unwrap: () => Promise.resolve({ ...pending, state: 'Reviewed' }),
  });
});

it('hands the current selection to section review using the saved settings version', async () => {
  view(true);
  await userEvent.click(screen.getByRole('button', { name: 'Send for section review' }));
  await userEvent.click(screen.getByRole('button', { name: 'Confirm and send' }));

  expect(mocks.submit).not.toHaveBeenCalled();
  expect(mocks.sectionSubmit).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({
      previewRunId: 'run-1',
      expectedSettingsVersion: 7,
      employeeIds: ['staff-1'],
    })
  );
  expect(mocks.onSubmitted).toHaveBeenCalledOnce();
});

it('allows a scoped reviewer to record a review without an issue-payroll action', async () => {
  view();
  expect(screen.queryByRole('button', { name: 'Send for section review' })).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /Section review batches/ }));
  expect(screen.getByText('Primary · Primary principal')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Finalize batch' })).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Mark section reviewed' }));
  const confirmation = within(screen.getByRole('dialog'));
  await userEvent.click(confirmation.getByRole('button', { name: 'Mark section reviewed' }));

  expect(mocks.resolve).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({
      id: pending.id,
      action: 'review',
      expectedVersion: pending.version,
    })
  );
});

it('requires a reason when returning a batch to HR', async () => {
  view();
  await userEvent.click(screen.getByRole('button', { name: /Section review batches/ }));
  await userEvent.click(screen.getByRole('button', { name: 'Return to HR' }));
  const confirmation = within(screen.getByRole('dialog'));
  const action = confirmation.getByRole('button', { name: 'Return to HR' });
  expect(action).toBeDisabled();
  fireEvent.change(confirmation.getByLabelText(/Reason/), {
    target: { value: '  Confirm the payable days.  ' },
  });
  await userEvent.click(action);

  expect(mocks.resolve).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({
      id: pending.id,
      action: 'return',
      reason: 'Confirm the payable days.',
    })
  );
});

it('blocks an open handoff when the workflow settings change', async () => {
  const ui = view(true);
  await userEvent.click(screen.getByRole('button', { name: 'Send for section review' }));
  ui.rerender(panel(true, 8));

  expect(screen.getByText(/Approval settings changed/)).toBeVisible();
  expect(screen.getByRole('button', { name: 'Confirm and send' })).toBeDisabled();
  expect(mocks.sectionSubmit).not.toHaveBeenCalled();
});
