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
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
vi.mock('src/hooks/use-unsaved-navigation', () => ({
  useUnsavedNavigation: () => ({
    requestNavigation: (action: () => void) => action(),
    confirmation: null,
  }),
}));
vi.mock('src/components/customDialog', () => ({
  default: ({ children, title }: any) => (
    <div role="dialog" aria-label={title}>
      {children}
    </div>
  ),
  DialogScrollContent: ({ children }: any) => <div>{children}</div>,
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
