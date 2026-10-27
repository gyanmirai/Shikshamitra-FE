import type { CashDetail } from 'src/redux/finance/cashManagementApi';

import React from 'react';
import dayjs from 'dayjs';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import CashCommandDialog from './CashCommandDialog';

const mock = vi.hoisted(() => ({ send: vi.fn(), unwrap: vi.fn(), refetch: vi.fn() }));
vi.mock('src/redux/finance/cashManagementApi', () => ({
  useGetCashOptionsQuery: () => ({
    currentData: { bankAccounts: [{ id: 'bank', label: 'School bank' }] },
    isFetching: false,
    isError: false,
    refetch: mock.refetch,
  }),
  useApproveCashMutation: () => [mock.send],
  useDepositCashMutation: () => [mock.send],
  useConfirmCashDepositMutation: () => [mock.send],
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
vi.mock('src/components/form-section-card', () => ({
  FormSectionCard: ({ children }: any) => <section>{children}</section>,
}));
vi.mock('src/components/shaking-text-field', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('src/components/customDialog', () => ({
  default: ({ children, title, formProps }: any) => (
    <div role="dialog" aria-label={title}>
      <form onSubmit={formProps.onSubmit}>{children}</form>
    </div>
  ),
  DialogScrollContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('src/components/confirm-dialog', () => ({ ConfirmDialog: () => null }));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, name, value, onChange, disabled }: any) => (
    <select
      aria-label={label}
      name={name}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">Select</option>
      <option value="bank">School bank</option>
    </select>
  ),
}));
vi.mock('src/components/custom-numeric-format', () => ({
  default: ({ label, name, value, onValueChange, disabled, helperText }: any) => (
    <label htmlFor={name}>
      {label}
      <input
        id={name}
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(event) => onValueChange({ value: event.target.value }, { source: 'event' })}
      />
      <span>{helperText}</span>
    </label>
  ),
}));
vi.mock('@mui/x-date-pickers', () => ({
  DateTimePicker: ({ label, value, onChange, disabled }: any) => (
    <label htmlFor="cash-test-date-time">
      {label}
      <input
        id="cash-test-date-time"
        aria-label={label}
        value={value.toISOString()}
        disabled={disabled}
        onChange={(event) => onChange(dayjs(event.target.value))}
      />
    </label>
  ),
}));
const cash: CashDetail = {
  id: 'cash',
  sourceId: 'source',
  reference: 'CASH-001',
  payerName: 'Parent',
  amount: 10000,
  spentAmount: 0,
  depositedAmount: 0,
  inTransitAmount: 0,
  remainingAmount: 10000,
  status: 1,
  bankAccountId: 'bank',
  bankLabel: 'School bank',
  collectedAt: '2026-10-20T10:00:00+05:30',
  approvedAt: '2026-10-21T10:00:00+05:30',
  creatorId: 'creator',
  concurrencyStamp: 'v1',
  canApprove: false,
  canDeposit: true,
  deposits: [],
  expenses: [],
};
beforeEach(() => {
  vi.clearAllMocks();
  mock.unwrap.mockReset().mockResolvedValue({});
  mock.send.mockImplementation(() => ({ unwrap: mock.unwrap }));
  mock.refetch.mockReturnValue({ unwrap: () => Promise.resolve({}) });
});

function setupApproval(remainingAmount = 8000, refresh = vi.fn(), saved = vi.fn()) {
  const store = configureStore({
    reducer: {
      auth: () => ({
        permissionsInitialized: true,
        loading: false,
        permissions: [{ name: 'Finance.Accounts.CashManagement.Approve', isGranted: true }],
      }),
    },
  });
  render(
    <Provider store={store}>
      <CashCommandDialog
        action="approve"
        data={{
          ...cash,
          status: 0,
          canApprove: true,
          canDeposit: false,
          spentAmount: 10000 - remainingAmount,
          remainingAmount,
        }}
        academicYearId="year"
        onRefresh={refresh}
        onSaved={saved}
        onClose={vi.fn()}
      />
    </Provider>
  );
  return { saved };
}

it.each([8000, 0])(
  'shows collected, expenses and remaining cash and submits the prefilled net count %s',
  async (remaining) => {
    const { saved } = setupApproval(remaining);
    expect(screen.getByText(/Collected amount:/)).toHaveTextContent('10,000');
    expect(screen.getByText(/Expenses paid:/)).toHaveTextContent(
      remaining === 8000 ? '2,000' : '10,000'
    );
    expect(screen.getByText(/Remaining to deposit:/)).toHaveTextContent(
      remaining === 8000 ? '8,000' : '0'
    );
    expect(screen.getByLabelText('Counted amount')).toHaveValue(String(remaining));
    fireEvent.change(screen.getByLabelText('Receiving school bank account'), {
      target: { value: 'bank' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(saved).toHaveBeenCalledOnce());
    expect(mock.send.mock.calls[0][0].body.countedAmount).toBe(remaining);
  }
);

it('preserves the draft after an expense race but validates the refreshed remaining count', async () => {
  mock.unwrap.mockRejectedValueOnce({
    status: 409,
    data: { code: 'Finance:CashManagement:Stale', detail: 'Cash changed.' },
  });
  const refresh = vi.fn().mockResolvedValue({
    ...cash,
    status: 0,
    canApprove: true,
    spentAmount: 3000,
    remainingAmount: 7000,
    concurrencyStamp: 'v2',
  });
  setupApproval(8000, refresh);
  fireEvent.change(screen.getByLabelText('Receiving school bank account'), {
    target: { value: 'bank' },
  });
  fireEvent.change(screen.getByLabelText('Notes (optional)'), { target: { value: 'Keep draft' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Refresh cash details' }));
  await waitFor(() => expect(screen.getByText(/Remaining to deposit:/)).toHaveTextContent('7,000'));
  expect(screen.getByLabelText('Counted amount')).toHaveValue('8000');
  expect(screen.getByLabelText('Notes (optional)')).toHaveValue('Keep draft');
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(
    await screen.findByText('Count must match the remaining cash to deposit.')
  ).toBeInTheDocument();
  expect(mock.send).toHaveBeenCalledOnce();
  fireEvent.change(screen.getByLabelText('Counted amount'), { target: { value: '7000' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(mock.send).toHaveBeenCalledTimes(2));
  expect(mock.send.mock.calls[1][0].body).toMatchObject({
    countedAmount: 7000,
    concurrencyStamp: 'v2',
    notes: 'Keep draft',
  });
});
it('recovers a definitive stale deposit in place and freezes an uncertain retry payload', async () => {
  mock.send.mockImplementation(() => ({ unwrap: mock.unwrap }));
  mock.unwrap
    .mockRejectedValueOnce({
      status: 409,
      data: { code: 'Finance:CashManagement:Stale', detail: 'Cash changed.' },
    })
    .mockRejectedValueOnce({ status: 'FETCH_ERROR', data: { detail: 'Network uncertain.' } })
    .mockResolvedValueOnce({});
  const refresh = vi
    .fn()
    .mockResolvedValue({ ...cash, remainingAmount: 9900, concurrencyStamp: 'v2' });
  const saved = vi.fn().mockResolvedValue(undefined);
  const store = configureStore({
    reducer: {
      auth: () => ({
        permissionsInitialized: true,
        loading: false,
        permissions: [{ name: 'Finance.Accounts.CashManagement.Deposit', isGranted: true }],
      }),
    },
  });
  render(
    <Provider store={store}>
      <CashCommandDialog
        action="deposit"
        data={cash}
        academicYearId="year"
        onRefresh={refresh}
        onSaved={saved}
        onClose={vi.fn()}
      />
    </Provider>
  );
  fireEvent.change(screen.getByLabelText('Deposit amount'), { target: { value: '20.25' } });
  fireEvent.change(screen.getByLabelText(/Deposit slip/), { target: { value: 'SLIP-001' } });
  fireEvent.change(screen.getByLabelText('Notes (optional)'), {
    target: { value: 'Keep evidence' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Refresh cash details' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
  expect(screen.getByLabelText('Deposit amount')).toHaveValue('20.25');
  expect(screen.getByLabelText('Notes (optional)')).toHaveValue('Keep evidence');
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(mock.send).toHaveBeenCalledTimes(2));
  await waitFor(() => expect(screen.getByLabelText('Deposit amount')).toBeDisabled());
  expect(mock.send.mock.calls[1][0].body.concurrencyStamp).toBe('v2');
  expect(mock.send.mock.calls[1][0].body.idempotencyKey).not.toBe(
    mock.send.mock.calls[0][0].body.idempotencyKey
  );
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(saved).toHaveBeenCalledOnce());
  expect(mock.send.mock.calls[2][0]).toEqual(mock.send.mock.calls[1][0]);
});
