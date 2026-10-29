import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import CashBulkDepositDialog, { bulkDepositSchema } from './CashBulkDepositDialog';

const mock = vi.hoisted(() => ({ send: vi.fn(), unwrap: vi.fn(), refetch: vi.fn(), banks: true }));
vi.mock('src/redux/finance/cashManagementApi', () => ({
  useGetCashOptionsQuery: () => ({
    currentData: { bankAccounts: mock.banks ? [{ id: 'bank', label: 'School bank' }] : [] },
    isFetching: false,
    isError: false,
    refetch: mock.refetch,
  }),
  useBulkDepositCashMutation: () => [mock.send],
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
  default: ({ children, title, formProps, handleClose, disableClose }: any) => (
    <div role="dialog" aria-label={title}>
      <button type="button" aria-label="Close dialog" disabled={disableClose} onClick={handleClose}>
        X
      </button>
      <form onSubmit={formProps.onSubmit}>{children}</form>
    </div>
  ),
  DialogScrollContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('src/components/confirm-dialog', () => ({
  ConfirmDialog: ({ open, onClose, action }: any) =>
    open ? (
      <div role="alertdialog">
        <button type="button" onClick={onClose}>
          Keep editing
        </button>
        {action}
      </div>
    ) : null,
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, name, value, onChange, disabled, helperText }: any) => (
    <>
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
      <span>{helperText}</span>
    </>
  ),
}));
vi.mock('src/components/custom-upload', () => ({
  default: ({ value, onChange, disabled, error }: any) => (
    <>
      <input
        type="file"
        aria-label="Upload document"
        disabled={disabled}
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
      {value && <span>{value.name}</span>}
      <span>{error}</span>
    </>
  ),
}));
beforeEach(() => {
  vi.clearAllMocks();
  mock.banks = true;
  mock.unwrap.mockReset().mockResolvedValue({ amount: 5329, sourceCount: 2 });
  mock.send.mockImplementation(() => ({ unwrap: mock.unwrap }));
  mock.refetch.mockReturnValue({ unwrap: () => Promise.resolve({}) });
});
function setup(canDeposit = true, initialBankAccountId?: string) {
  const onClose = vi.fn();
  const refresh = vi.fn().mockResolvedValue(4000);
  const store = configureStore({
    reducer: {
      auth: () => ({
        permissionsInitialized: true,
        loading: false,
        permissions: [{ name: 'Finance.Accounts.CashManagement.Deposit', isGranted: canDeposit }],
      }),
    },
  });
  render(
    <Provider store={store}>
      <CashBulkDepositDialog
        academicYearId="year"
        amount={5329}
        onClose={onClose}
        onRefresh={refresh}
        initialBankAccountId={initialBankAccountId}
      />
    </Provider>
  );
  return { onClose, refresh };
}

it('prefills the bank account from activity without changing the year-wide deposit amount', async () => {
  setup(true, 'bank');
  expect(screen.getByRole('combobox', { name: 'Receiving school bank account' })).toHaveValue(
    'bank'
  );
  fireEvent.click(screen.getByRole('button', { name: 'Deposit cash' }));
  await waitFor(() =>
    expect(mock.send).toHaveBeenCalledWith(
      expect.objectContaining({
        bankAccountId: 'bank',
        expectedAmount: 5329,
        academicYearId: 'year',
      })
    )
  );
});
function bank() {
  fireEvent.change(screen.getByRole('combobox', { name: 'Receiving school bank account' }), {
    target: { value: 'bank' },
  });
}
it('shows the complete read-only total and requires a receiving bank', async () => {
  setup();
  expect(screen.getByText(/5,329/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Deposit cash' }));
  await screen.findByText('Select a receiving school bank account.');
  expect(mock.send).not.toHaveBeenCalled();
});
it('submits the year-wide amount with optional document and notes in one command', async () => {
  const { onClose } = setup();
  bank();
  const file = new File(['proof'], 'deposit.pdf', { type: 'application/pdf' });
  fireEvent.change(screen.getByLabelText('Upload document'), { target: { files: [file] } });
  fireEvent.change(screen.getByLabelText('Notes (optional)'), {
    target: { value: '  Bank deposit  ' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Deposit cash' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(mock.send).toHaveBeenCalledWith(
    expect.objectContaining({
      academicYearId: 'year',
      bankAccountId: 'bank',
      expectedAmount: 5329,
      notes: 'Bank deposit',
      file,
      idempotencyKey: expect.any(String),
    })
  );
  expect(mock.send.mock.calls[0][0]).not.toHaveProperty('month');
});
it('retains an exact command key and evidence when retrying an uncertain outcome', async () => {
  mock.unwrap.mockRejectedValueOnce({ status: 'FETCH_ERROR' }).mockResolvedValueOnce({});
  setup();
  bank();
  fireEvent.click(screen.getByRole('button', { name: 'Deposit cash' }));
  await screen.findByText(/deposit outcome is uncertain/i);
  const first = mock.send.mock.calls[0][0];
  expect(screen.getByRole('combobox')).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Retry deposit' }));
  await waitFor(() => expect(mock.send).toHaveBeenCalledTimes(2));
  expect(mock.send.mock.calls[1][0]).toEqual(first);
});
it('blocks stale deposits until refreshing the year balance', async () => {
  mock.unwrap.mockRejectedValueOnce({
    status: 409,
    data: { errorCode: 'Finance:CashManagement:Stale', detail: 'Cash changed.' },
  });
  const { refresh } = setup();
  bank();
  fireEvent.click(screen.getByRole('button', { name: 'Deposit cash' }));
  await screen.findByText('Cash changed.');
  expect(screen.getByRole('button', { name: 'Deposit cash' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Refresh cash balance' }));
  await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
  await screen.findByText(/4,000/);
  expect(screen.getByRole('button', { name: 'Deposit cash' })).toBeEnabled();
});
it('protects dirty cancellation and retains values when editing continues', async () => {
  const { onClose } = setup();
  bank();
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  expect(onClose).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(screen.getByRole('combobox')).toHaveValue('bank');
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(onClose).toHaveBeenCalledOnce();
});
it('locks conflicting actions during a deposit and prevents double submission', async () => {
  let finish!: () => void;
  mock.unwrap.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      })
  );
  const { onClose } = setup();
  bank();
  fireEvent.click(screen.getByRole('button', { name: 'Deposit cash' }));
  await waitFor(() => expect(mock.send).toHaveBeenCalledOnce());
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Close dialog' })).toBeDisabled();
  fireEvent.submit(screen.getByRole('button', { name: 'Deposit cash' }).closest('form')!);
  await React.act(async () => {
    finish();
  });
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(mock.send).toHaveBeenCalledOnce();
});
it('disables submission without deposit authority or bank setup', () => {
  setup(false);
  expect(screen.getByRole('button', { name: 'Deposit cash' })).toBeDisabled();
});
it('validates optional file MIME and size boundaries and notes length', async () => {
  const valid = { bankAccountId: 'bank', notes: '', file: null };
  await expect(bulkDepositSchema.validate(valid)).resolves.toBeDefined();
  await expect(
    bulkDepositSchema.validate({
      ...valid,
      file: new File(['text'], 'bad.txt', { type: 'text/plain' }),
    })
  ).rejects.toThrow('Select a PDF');
  await expect(
    bulkDepositSchema.validate({
      ...valid,
      file: new File([new Uint8Array(5 * 1024 * 1024)], 'proof.pdf', { type: 'application/pdf' }),
    })
  ).resolves.toBeDefined();
  await expect(
    bulkDepositSchema.validate({
      ...valid,
      file: new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'proof.pdf', {
        type: 'application/pdf',
      }),
    })
  ).rejects.toThrow('5 MB');
  await expect(bulkDepositSchema.validate({ ...valid, notes: 'a'.repeat(1001) })).rejects.toThrow(
    '1,000'
  );
});
