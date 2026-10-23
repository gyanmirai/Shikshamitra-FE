import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import StudentRollNumberWorkspace from './student-roll-number-workspace';

const mocks = vi.hoisted(() => ({
  preview: vi.fn(),
  load: vi.fn(),
  submit: vi.fn(),
  decide: vi.fn(),
  apply: vi.fn(),
  context: {} as any,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/components/customDialog', () => ({
  default: ({ children, title, handleClose, disableClose, formProps }: any) => (
    <form role="dialog" aria-label={title} {...formProps}>
      <button type="button" disabled={disableClose} onClick={handleClose}>
        Close dialog
      </button>
      {children}
    </form>
  ),
  DialogScrollContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
    success: vi.fn(),
  },
}));
vi.mock('src/hooks/use-unsaved-navigation', () => ({
  useUnsavedNavigation: () => ({
    requestNavigation: (action: () => void) => action(),
    confirmation: null,
  }),
}));
vi.mock('./student-assignment-drawer', () => ({
  default: ({ children, title, actions }: any) => (
    <div role="dialog" aria-label={title}>
      {children}
      {actions}
    </div>
  ),
}));
vi.mock('src/components/confirm-dialog', () => ({
  ConfirmDialog: ({ open, action, title }: any) =>
    open ? (
      <div role="alertdialog" aria-label={title}>
        {action}
      </div>
    ) : null,
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ data, totalCount, onServerPagination }: any) => (
    <div>
      <span>{totalCount} server students</span>
      {data.map((row: any) => (
        <span key={row.id}>{row.studentName}</span>
      ))}
      <button type="button" onClick={() => onServerPagination(2, 25)}>
        Next page
      </button>
    </div>
  ),
}));
vi.mock('src/redux/student/onboarding/student-roll-number-batches-api', () => ({
  useGetRollNumberBatchContextQuery: () => mocks.context,
  usePreviewRollNumberBatchMutation: () => [mocks.preview, { isLoading: false }],
  useLazyGetRollNumberBatchQuery: () => [mocks.load, { isFetching: false }],
  useSubmitRollNumberBatchMutation: () => [mocks.submit, { isLoading: false }],
  useDecideRollNumberBatchMutation: () => [mocks.decide, { isLoading: false }],
  useApplyRollNumberBatchMutation: () => [mocks.apply, { isLoading: false }],
}));
const scope = { academicYearId: 'year-1', standardId: 'class-8', divisionId: 'division-a' };
const batch = {
  ...scope,
  scopeLabel: 'Class 8 / A',
  id: 'batch-1',
  concurrencyStamp: 'stamp-1',
  operation: 'assign-missing',
  status: 'Preview',
  reason: '',
  grouping: 'mixed',
  sortBy: 'studentName',
  nameFormat: 'first-name-first',
  sortDirection: 'ascending',
  totalCount: 83,
  blockedCount: 0,
  canSubmit: true,
  canDecide: false,
  canApply: false,
  items: [{ studentId: 'jay', studentName: 'Jay Shah', proposedRollNumber: 1 }],
};
beforeEach(() => {
  vi.clearAllMocks();
  mocks.context = {
    currentData: { canAssignMissing: true, canRenumber: true, unassignedCount: 83, batches: [] },
    isFetching: false,
    isError: false,
  };
  mocks.preview.mockReturnValue({ unwrap: () => Promise.resolve(batch) });
  mocks.load.mockReturnValue({ unwrap: () => Promise.resolve(batch) });
  mocks.submit.mockReturnValue({
    unwrap: () => Promise.resolve({ ...batch, status: 'Applied', canSubmit: false }),
  });
});

it('uses the full server cohort and converts shared one-based pagination into an offset', async () => {
  render(<StudentRollNumberWorkspace scope={scope} operation="assign-missing" onClose={vi.fn()} />);
  await screen.findByText('83 server students');
  expect(mocks.preview).toHaveBeenCalledWith({ ...scope, operation: 'assign-missing' });
  fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
  await waitFor(() =>
    expect(mocks.load).toHaveBeenCalledWith(
      { id: 'batch-1', skipCount: 25, maxResultCount: 25 },
      false
    )
  );
});
it('does not save renumbering until a reason and explicit confirmation are provided', async () => {
  mocks.preview.mockReturnValue({
    unwrap: () => Promise.resolve({ ...batch, operation: 'renumber' }),
  });
  render(<StudentRollNumberWorkspace scope={scope} operation="renumber" onClose={vi.fn()} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Review Renumber' }));
  expect(await screen.findByText('Enter a reason for renumbering.')).toBeInTheDocument();
  expect(mocks.submit).not.toHaveBeenCalled();
  fireEvent.change(screen.getByRole('textbox', { name: /Reason/ }), {
    target: { value: 'Annual roster review' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Review Renumber' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Confirm Renumber' }));
  await waitFor(() =>
    expect(mocks.submit).toHaveBeenCalledWith({
      id: 'batch-1',
      concurrencyStamp: 'stamp-1',
      idempotencyKey: 'batch-1',
      reason: 'Annual roster review',
    })
  );
});
it('blocks submission when server row validation fails', async () => {
  mocks.preview.mockReturnValue({
    unwrap: () => Promise.resolve({ ...batch, blockedCount: 1, canSubmit: false }),
  });
  render(<StudentRollNumberWorkspace scope={scope} operation="assign-missing" onClose={vi.fn()} />);
  expect(await screen.findByRole('button', { name: 'Submit Assignment' })).toBeDisabled();
  expect(screen.getByText(/Correct the flagged records/)).toBeInTheDocument();
});
it('retains safe data but disables writes after a failed request until refresh', async () => {
  mocks.submit.mockReturnValue({ unwrap: () => Promise.reject(new Error('Roster changed')) });
  render(<StudentRollNumberWorkspace scope={scope} operation="assign-missing" onClose={vi.fn()} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Submit Assignment' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Submit Assignment' })).toBeDisabled()
  );
  expect(screen.getByText('Jay Shah')).toBeInTheDocument();
});

const pageBatch = {
  ...batch,
  caseIds: ['case-jay'],
  approvalRequired: false,
  approvalStages: [],
  reasonRequired: false,
  totalCount: 1,
};
it('assigns only explicit current-page cases without opening a drawer or ordinary preview dialog', async () => {
  const close = vi.fn();
  const applied = vi.fn();
  mocks.preview.mockReturnValue({ unwrap: () => Promise.resolve(pageBatch) });
  mocks.submit.mockReturnValue({
    unwrap: () => Promise.resolve({ ...pageBatch, status: 'Applied', canSubmit: false }),
  });
  render(
    <StudentRollNumberWorkspace
      scope={scope}
      operation="assign-missing"
      presentation="quick"
      caseIds={['case-jay']}
      onClose={close}
      onApplied={applied}
    />
  );
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  await waitFor(() => expect(close).toHaveBeenCalledOnce());
  expect(mocks.preview).toHaveBeenCalledWith({
    ...scope,
    operation: 'assign-missing',
    caseIds: ['case-jay'],
  });
  expect(mocks.submit).toHaveBeenCalledWith({
    id: 'batch-1',
    concurrencyStamp: 'stamp-1',
    idempotencyKey: 'batch-1',
    reason: '',
  });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(applied).toHaveBeenCalledWith(pageBatch.items);
  expect(mocks.load).not.toHaveBeenCalled();
});

it('loads a complete applied page once so all retained rows receive confirmed Roll numbers', async () => {
  const close = vi.fn();
  const applied = vi.fn();
  const targetIds = Array.from({ length: 30 }, (_, i) => `case-${i}`);
  const items = targetIds.map((_, i) => ({
    studentId: `student-${i}`,
    studentName: `Student ${i}`,
    proposedRollNumber: i + 1,
  }));
  const preview = { ...pageBatch, caseIds: targetIds, totalCount: 30, items: items.slice(0, 25) };
  const saved = { ...preview, status: 'Applied', canSubmit: false };
  mocks.preview.mockReturnValue({ unwrap: async () => preview });
  mocks.submit.mockReturnValue({ unwrap: async () => saved });
  mocks.load.mockReturnValue({ unwrap: async () => ({ ...saved, items }) });
  render(
    <StudentRollNumberWorkspace
      scope={scope}
      operation="assign-missing"
      presentation="quick"
      caseIds={targetIds}
      onClose={close}
      onApplied={applied}
    />
  );
  await waitFor(() => expect(close).toHaveBeenCalledOnce());
  expect(mocks.load).toHaveBeenCalledExactlyOnceWith(
    { id: 'batch-1', skipCount: 0, maxResultCount: 100 },
    false
  );
  expect(applied).toHaveBeenCalledExactlyOnceWith(items);
  expect(mocks.submit).toHaveBeenCalledOnce();
});

it('does not report incomplete applied rows as refreshed or repeat an assignment', async () => {
  const applied = vi.fn();
  const close = vi.fn();
  const partial = { ...pageBatch, totalCount: 2, status: 'Applied' };
  mocks.preview.mockReturnValue({ unwrap: async () => pageBatch });
  mocks.submit.mockReturnValue({ unwrap: async () => partial });
  mocks.load.mockReturnValue({ unwrap: async () => partial });
  render(
    <StudentRollNumberWorkspace
      scope={scope}
      operation="assign-missing"
      presentation="quick"
      caseIds={['case-jay']}
      onClose={close}
      onApplied={applied}
    />
  );
  expect(
    await screen.findByText(
      'Saved Roll numbers could not be refreshed. Refresh to load the assignment result.'
    )
  ).toBeVisible();
  expect(applied).not.toHaveBeenCalled();
  expect(close).not.toHaveBeenCalled();
  expect(mocks.submit).toHaveBeenCalledOnce();
});

it.each([
  { ...pageBatch, caseIds: undefined },
  { ...pageBatch, caseIds: ['different-page-case'] },
  { ...pageBatch, caseIds: ['case-jay', 'off-page-case'] },
  { ...pageBatch, approvalRequired: undefined },
  { ...pageBatch, divisionId: 'moved-division' },
])('never submits an unverified page scope or missing policy capability', async (proposed) => {
  mocks.preview.mockReturnValue({ unwrap: () => Promise.resolve(proposed) });
  render(
    <StudentRollNumberWorkspace
      scope={scope}
      operation="assign-missing"
      presentation="quick"
      caseIds={['case-jay']}
      onClose={vi.fn()}
    />
  );
  expect(await screen.findByRole('dialog', { name: 'Roll Number Policy' })).toBeVisible();
  expect(mocks.submit).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Retry' })).toBeEnabled();
});

it('shows applicable policy and validates its reason before requesting approval', async () => {
  const policy = {
    ...pageBatch,
    reasonRequired: true,
    approvalRequired: true,
    approvalStages: [['Principal']],
  };
  mocks.preview.mockReturnValue({ unwrap: () => Promise.resolve(policy) });
  mocks.submit.mockReturnValue({
    unwrap: () => Promise.resolve({ ...policy, status: 'PendingApproval', canSubmit: false }),
  });
  render(
    <StudentRollNumberWorkspace
      scope={scope}
      operation="assign-missing"
      presentation="quick"
      caseIds={['case-jay']}
      onClose={vi.fn()}
    />
  );
  const submit = await screen.findByRole('button', { name: 'Submit Assignment' });
  expect(screen.getByText('Approval 1: Principal')).toBeVisible();
  expect(mocks.submit).not.toHaveBeenCalled();
  fireEvent.click(submit);
  expect(await screen.findByText('Enter a reason before saving.')).toBeVisible();
  fireEvent.change(screen.getByRole('textbox', { name: 'Reason' }), {
    target: { value: 'Prepare class register' },
  });
  fireEvent.click(submit);
  await screen.findByText('Awaiting Approval');
  expect(mocks.submit).toHaveBeenCalledOnce();
  expect(mocks.apply).not.toHaveBeenCalled();
  expect(screen.queryByRole('button', { name: 'Approve Batch' })).not.toBeInTheDocument();
});

it('retains the same batch after uncertain Auto failure and refreshes before retry', async () => {
  mocks.preview.mockReturnValue({ unwrap: () => Promise.resolve(pageBatch) });
  mocks.submit.mockReturnValue({ unwrap: () => Promise.reject(new Error('Connection lost')) });
  mocks.load.mockReturnValue({ unwrap: () => Promise.resolve(pageBatch) });
  render(
    <StudentRollNumberWorkspace
      scope={scope}
      operation="assign-missing"
      presentation="quick"
      caseIds={['case-jay']}
      onClose={vi.fn()}
    />
  );
  const refresh = await screen.findByRole('button', { name: 'Refresh' });
  expect(mocks.submit).toHaveBeenCalledOnce();
  expect(screen.getByRole('button', { name: 'Submit Assignment' })).toBeDisabled();
  fireEvent.click(refresh);
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Submit Assignment' })).toBeEnabled()
  );
  expect(mocks.preview).toHaveBeenCalledOnce();
  expect(mocks.submit).toHaveBeenCalledOnce();
});

it('uses only server decision/apply capabilities when reviewing a pending policy', async () => {
  const close = vi.fn();
  const pending = {
    ...pageBatch,
    approvalRequired: true,
    status: 'PendingApproval',
    canSubmit: false,
    canDecide: true,
  };
  mocks.load.mockReturnValue({ unwrap: () => Promise.resolve(pending) });
  mocks.decide.mockReturnValue({
    unwrap: () =>
      Promise.resolve({ ...pending, status: 'Approved', canDecide: false, canApply: true }),
  });
  mocks.apply.mockReturnValue({
    unwrap: () =>
      Promise.resolve({ ...pending, status: 'Applied', canDecide: false, canApply: false }),
  });
  render(
    <StudentRollNumberWorkspace
      scope={scope}
      batchId="batch-1"
      presentation="quick"
      onClose={close}
    />
  );
  fireEvent.click(await screen.findByRole('button', { name: 'Approve Batch' }));
  expect(mocks.apply).not.toHaveBeenCalled();
  fireEvent.click(await screen.findByRole('button', { name: 'Apply Approved Batch' }));
  await waitFor(() => expect(close).toHaveBeenCalledOnce());
  expect(mocks.decide).toHaveBeenCalledOnce();
  expect(mocks.apply).toHaveBeenCalledOnce();
});
