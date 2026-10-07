import type { EmployeeAccountEmail } from 'src/redux/hr/employee-account-email-api';

import { vi, it, expect, describe, afterEach, beforeEach } from 'vitest';
import { act, render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import EmployeeAccountEmailAction, { EmployeeAccountEmailDialog } from './employee-account-email-action';

const state = vi.hoisted(() => ({
  query: { currentData: undefined as EmployeeAccountEmail | undefined, isFetching: false, isError: false, error: undefined as { status: number } | undefined, refetch: vi.fn() },
  save: vi.fn(), push: vi.fn(), dispatch: vi.fn(),
  permissions: ['HR.Employee.EmployeeList.Edit', 'AbpIdentity.Users.Update'],
}));
vi.mock('src/redux/hr/employee-account-email-api', () => ({
  useGetEmployeeAccountEmailQuery: () => state.query,
  useChangeEmployeeAccountEmailMutation: () => [state.save],
}));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: state.push }) }));
vi.mock('react-redux', () => ({
  useDispatch: () => state.dispatch,
  useSelector: (selector: (root: unknown) => unknown) => selector({
    auth: { permissions: state.permissions.map((name) => ({ name, isGranted: true })) }, confirmPopup: { isChanges: false },
  }),
}));

const record = { userId: 'account', employeeEmail: 'old@example.test', accountEmail: 'old@example.test',
  userName: 'old@example.test', concurrencyToken: 'initial-token' };
const fill = () => {
  fireEvent.change(screen.getByLabelText('New email'), { target: { value: 'new@example.test' } });
  fireEvent.change(screen.getByLabelText('Reason'), { target: { value: 'HR verified the corrected address' } });
  fireEvent.click(screen.getByLabelText('HR verified this address with the employee'));
};

describe('controlled employee account email change', () => {
  beforeEach(() => {
    state.query.currentData = record;
    state.query.isError = false;
    state.query.error = undefined;
    state.query.isFetching = false;
    state.permissions = ['HR.Employee.EmployeeList.Edit', 'AbpIdentity.Users.Update'];
    state.save.mockReset(); state.query.refetch.mockReset(); state.push.mockReset();
  });
  afterEach(cleanup);

  it('returns focus to the opening action after keeping a dirty draft and saving successfully', async () => {
    state.query.currentData = undefined;
    state.save.mockReturnValue({ unwrap: () => Promise.resolve({ ...record, accountEmail: 'new@example.test' }) });
    const view = render(<EmployeeAccountEmailAction employeeId="employee" />);
    const opener = screen.getByRole('button', { name: 'Change account email' });
    opener.focus();
    fireEvent.click(opener);
    expect(screen.getByLabelText('Loading account email')).toBeInTheDocument();
    state.query.currentData = record;
    view.rerender(<EmployeeAccountEmailAction employeeId="employee" />);
    await waitFor(() => expect(screen.getByLabelText('New email')).toHaveValue(record.accountEmail));
    fill();
    fireEvent.click(screen.getByRole('button', { name: 'close' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Keep editing' }));
    fireEvent.click(screen.getByRole('button', { name: /^Change email$/ }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Change account email' })).not.toBeInTheDocument());
    expect(opener).toHaveFocus();
  });

  it('requires both exact action permissions', () => {
    state.permissions = ['HR.Employee.EmployeeList.Edit'];
    const view = render(<EmployeeAccountEmailAction employeeId="employee" />);
    expect(screen.queryByRole('button', { name: 'Change account email' })).not.toBeInTheDocument();
    state.permissions = ['AbpIdentity.Users.Update'];
    view.rerender(<EmployeeAccountEmailAction employeeId="employee" />);
    expect(screen.queryByRole('button', { name: 'Change account email' })).not.toBeInTheDocument();
    state.permissions.push('HR.Employee.EmployeeList.Edit');
    view.rerender(<EmployeeAccountEmailAction employeeId="employee" />);
    expect(screen.getByRole('button', { name: 'Change account email' })).toBeEnabled();
  });

  it('keeps the header and actions during failed initial loading and retries without defaults', async () => {
    state.query.currentData = undefined; state.query.isError = true;
    state.query.refetch.mockReturnValue({ unwrap: () => Promise.resolve(record) });
    const view = render(<EmployeeAccountEmailDialog employeeId="employee" onClose={vi.fn()} />);
    expect(screen.getByRole('dialog', { name: 'Change account email' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Change email' })).toBeDisabled();
    expect(state.save).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Reload account' }));
    await waitFor(() => expect(state.query.refetch).toHaveBeenCalledOnce());
    state.query.currentData = record; state.query.isError = false;
    view.rerender(<EmployeeAccountEmailDialog employeeId="employee" onClose={vi.fn()} />);
    await waitFor(() => expect(screen.getByLabelText('New email')).toHaveValue(record.accountEmail));
  });

  it('requires HR verification and a reason before saving', async () => {
    render(<EmployeeAccountEmailDialog employeeId="employee" onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Change email' }));
    await screen.findByText('Confirm that HR verified the address with the employee.');
    expect(screen.getByText('Enter a reason.')).toBeInTheDocument();
    expect(state.save).not.toHaveBeenCalled();
  });

  it.each(['FETCH_ERROR', 'TIMEOUT_ERROR'])('adopts clean refreshes but retains a dirty draft and its original concurrency token after %s', async (status) => {
    state.save.mockReturnValue({ unwrap: () => Promise.reject(Object.assign(new Error('Failed to fetch'), { status, error: 'TypeError: Failed to fetch' })) });
    const view = render(<EmployeeAccountEmailDialog employeeId="employee" onClose={vi.fn()} />);
    state.query.currentData = { ...record, accountEmail: 'refreshed@example.test', concurrencyToken: 'clean-token' };
    view.rerender(<EmployeeAccountEmailDialog employeeId="employee" onClose={vi.fn()} />);
    await waitFor(() => expect(screen.getByLabelText('New email')).toHaveValue('refreshed@example.test'));
    fill();
    state.query.currentData = { ...record, accountEmail: 'other-editor@example.test', concurrencyToken: 'other-token' };
    view.rerender(<EmployeeAccountEmailDialog employeeId="employee" onClose={vi.fn()} />);
    expect(screen.getByLabelText('New email')).toHaveValue('new@example.test');
    fireEvent.click(screen.getByRole('button', { name: 'Change email' }));
    await screen.findByText('The request could not be confirmed. Check your connection and try again.');
    expect(screen.getByRole('alert')).not.toHaveTextContent('The email could not be changed');
    expect(state.save.mock.calls[0][0].body.concurrencyToken).toBe('clean-token');
    fireEvent.click(screen.getByRole('button', { name: 'Change email' }));
    await waitFor(() => expect(state.save).toHaveBeenCalledTimes(2));
    expect(state.save.mock.calls[1][0]).toEqual(state.save.mock.calls[0][0]);
  });

  it('reloads a conflict while retaining the draft and requiring verification again', async () => {
    state.save.mockReturnValue({ unwrap: () => Promise.reject(Object.assign(new Error('Account changed'), { data: { error: { code: 'HR:Employee:010039' } } })) });
    state.query.refetch.mockReturnValue({ unwrap: () => Promise.resolve({ ...record, accountEmail: 'another@example.test', concurrencyToken: 'reloaded-token' }) });
    render(<EmployeeAccountEmailDialog employeeId="employee" onClose={vi.fn()} />);
    fill();
    fireEvent.click(screen.getByRole('button', { name: 'Change email' }));
    await screen.findByText('The account changed. Reload the account, review the address and try again.');
    fireEvent.click(screen.getByRole('button', { name: 'Reload account' }));
    await waitFor(() => expect(screen.getByLabelText('Current account email')).toHaveValue('another@example.test'));
    expect(screen.getByLabelText('New email')).toHaveValue('new@example.test');
    expect(screen.getByLabelText('Reason')).toHaveValue('HR verified the corrected address');
    expect(screen.getByLabelText('HR verified this address with the employee')).not.toBeChecked();
    fireEvent.click(screen.getByLabelText('HR verified this address with the employee'));
    fireEvent.click(screen.getByRole('button', { name: 'Change email' }));
    await waitFor(() => expect(state.save).toHaveBeenCalledTimes(2));
    expect(state.save.mock.calls[1][0].body.concurrencyToken).toBe('reloaded-token');
    expect(state.save.mock.calls[1][0].body.idempotencyKey).not.toBe(state.save.mock.calls[0][0].body.idempotencyKey);
  });

  it('protects drafts on Cancel and close, blocks dismissal during saving and closes after acknowledgement', async () => {
    let finish!: () => void;
    state.save.mockReturnValue({ unwrap: () => new Promise<void>((resolve) => { finish = resolve; }) });
    const onClose = vi.fn();
    render(<EmployeeAccountEmailDialog employeeId="employee" onClose={onClose} />);
    fill();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Keep editing' }));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'close' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Keep editing' }));
    fireEvent.click(screen.getByRole('button', { name: 'Change email' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled());
    expect(screen.getByRole('button', { name: 'close' })).toBeDisabled();
    expect(onClose).not.toHaveBeenCalled();
    finish();
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });

  it('hides retained account data and the draft after an authorization denial', async () => {
    const view = render(<EmployeeAccountEmailDialog employeeId="employee" onClose={vi.fn()} />);
    await act(async () => { fill(); });
    await act(async () => {
      state.query.isError = true; state.query.error = { status: 403 };
      view.rerender(<EmployeeAccountEmailDialog employeeId="employee" onClose={vi.fn()} />);
    });
    expect(screen.getByText('You do not have access to change this account.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Current account email')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('New email')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Change email' })).toBeDisabled();
    await act(async () => {
      state.query.isError = false; state.query.error = undefined;
      view.rerender(<EmployeeAccountEmailDialog employeeId="employee" onClose={vi.fn()} />);
    });
    expect(screen.getByLabelText('New email')).toHaveValue('new@example.test');
  });

  it('hides protected fields after a denied write until a successful read revalidates access', async () => {
    state.save.mockReturnValue({ unwrap: () => Promise.reject(Object.assign(new Error('Denied'), { status: 403 })) });
    state.query.refetch.mockReturnValue({ unwrap: () => Promise.resolve(record) });
    render(<EmployeeAccountEmailDialog employeeId="employee" onClose={vi.fn()} />);
    fill(); fireEvent.click(screen.getByRole('button', { name: 'Change email' }));
    await screen.findByText('You do not have access to change this account.');
    expect(screen.queryByLabelText('New email')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reload account' }));
    await waitFor(() => expect(screen.getByLabelText('New email')).toHaveValue('new@example.test'));
    expect(screen.getByLabelText('HR verified this address with the employee')).not.toBeChecked();
  });

  it('guards Escape and restores the opening control after discarding', async () => {
    render(<EmployeeAccountEmailAction employeeId="employee" />);
    const opener = screen.getByRole('button', { name: 'Change account email' });
    act(() => { opener.focus(); }); fireEvent.click(opener);
    await waitFor(() => expect(screen.getByLabelText('New email')).toHaveFocus());
    fill();
    fireEvent.keyDown(screen.getByRole('dialog', { name: 'Change account email' }), { key: 'Escape', code: 'Escape' });
    fireEvent.click(await screen.findByRole('button', { name: 'Keep editing' }));
    expect(screen.getByLabelText('New email')).toHaveValue('new@example.test');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Discard changes' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Change account email' })).not.toBeInTheDocument());
    expect(opener).toHaveFocus();
  });
});
