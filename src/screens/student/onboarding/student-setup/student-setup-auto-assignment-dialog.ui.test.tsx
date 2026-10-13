import type { ComponentProps } from 'react';

import { it, vi, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { studentOnboardingTestData } from './student-onboarding-test-fixtures';
import StudentSetupAutoAssignmentDialog from './student-setup-auto-assignment-dialog';

const mocks = vi.hoisted(() => ({ query: vi.fn(), retry: vi.fn() }));
vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useGetStudentOnboardingPlacementOptionsQuery: mocks.query,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/components/customDialog', () => ({
  default: ({
    open,
    title,
    children,
  }: {
    open: boolean;
    title: string;
    children: React.ReactNode;
  }) =>
    open ? (
      <section role="dialog" aria-label={title}>
        {children}
      </section>
    ) : null,
  DialogScrollContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
const student = {
  ...studentOnboardingTestData[0],
  id: 'case-1',
  source: 'onboarding-case' as const,
  divisionId: null,
};
const defaults = (): ComponentProps<typeof StudentSetupAutoAssignmentDialog> => ({
  type: 'division',
  students: [student],
  busy: false,
  results: [],
  onAssign: vi.fn().mockResolvedValue([]),
  onClose: vi.fn(),
});
const renderDialog = (props = defaults()) =>
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentSetupAutoAssignmentDialog {...props} />
    </ThemeProvider>
  );
beforeEach(() => {
  vi.clearAllMocks();
  mocks.query.mockReturnValue({
    currentData: [
      { id: 'empty-division', name: 'B', capacity: 30, availableSeats: 30, isFull: false },
      { id: 'full-division', name: 'C', capacity: 30, availableSeats: 0, isFull: true },
    ],
    isFetching: false,
    isError: false,
    refetch: mocks.retry,
  });
});
it('requires an explicit target and uses available empty divisions, not worklist filter choices', async () => {
  const props = defaults();
  const user = userEvent.setup();
  renderDialog(props);
  await user.click(screen.getByRole('button', { name: 'Assign 1 student(s)' }));
  expect(await screen.findByText('Choose the target division.')).toBeInTheDocument();
  expect(props.onAssign).not.toHaveBeenCalled();
  await user.click(screen.getByRole('combobox', { name: 'Target division' }));
  expect(screen.getByRole('option', { name: /Grade 6 \/ C.*Full/ })).toHaveAttribute(
    'aria-disabled',
    'true'
  );
  await user.click(screen.getByRole('option', { name: /Grade 6 \/ B.*30 seats available/ }));
  await user.click(screen.getByRole('button', { name: 'Assign 1 student(s)' }));
  await waitFor(() => expect(props.onAssign).toHaveBeenCalledWith('empty-division'));
  expect(mocks.query).toHaveBeenCalledWith(
    'case-1',
    expect.objectContaining({ skip: false, refetchOnMountOrArgChange: true })
  );
});
it.each(['gr-number', 'roll-number'] as const)(
  'does not load Division choices or ask for a target for %s',
  async (type) => {
    const props = { ...defaults(), type };
    const user = userEvent.setup();
    renderDialog(props);
    expect(screen.queryByRole('combobox', { name: 'Target division' })).not.toBeInTheDocument();
    expect(mocks.query).toHaveBeenCalledWith('case-1', expect.objectContaining({ skip: true }));
    await user.click(screen.getByRole('button', { name: 'Assign 1 student(s)' }));
    await waitFor(() => expect(props.onAssign).toHaveBeenCalledWith(undefined));
  }
);
it('retains the selected target when cancellation is declined', async () => {
  const props = defaults();
  const user = userEvent.setup();
  renderDialog(props);
  await user.click(screen.getByRole('combobox', { name: 'Target division' }));
  await user.click(screen.getByRole('option', { name: /Grade 6 \/ B/ }));
  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(props.onClose).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(screen.getByRole('combobox', { name: 'Target division' })).toHaveTextContent('B');
  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  await user.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(props.onClose).toHaveBeenCalledOnce();
});
it('disables target, submit and close while assignments are saving', () => {
  renderDialog({ ...defaults(), busy: true });
  expect(screen.getByRole('combobox', { name: 'Target division' })).toHaveAttribute(
    'aria-disabled',
    'true'
  );
  expect(screen.getByRole('button', { name: /Assign 1 student/ })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
});
it('shows query errors with retry and does not allow submission', async () => {
  mocks.query.mockReturnValue({
    currentData: undefined,
    isFetching: false,
    isError: true,
    refetch: mocks.retry,
  });
  const user = userEvent.setup();
  renderDialog();
  expect(screen.getByText('Could not load division capacity.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Assign 1 student/ })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: 'Retry' }));
  expect(mocks.retry).toHaveBeenCalledOnce();
});
it('shows per-student failures without offering an implicit retry or discarding the result', () => {
  const props = {
    ...defaults(),
    results: [{ student, status: 'failed' as const, message: 'Division is full.' }],
  };
  renderDialog(props);
  expect(screen.getByText(`${student.studentName}: Division is full.`)).toBeInTheDocument();
  expect(screen.getByText(/0 saved; 0 already assigned or skipped; 1 failed/)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Assign 1 student/ })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Close' })).toBeEnabled();
});
