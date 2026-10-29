import React from 'react';
import dayjs from 'dayjs';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import ManualEntryForm from './ManualEntryForm';

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  unwrap: vi.fn(),
  refetch: vi.fn(),
  fetching: false,
  error: false,
  canAdd: true,
  cashStamp: 'v1',
  cashBalance: 100,
  cashFetching: false,
  cashError: false,
  noCategories: false,
  noBanks: false,
  cashOptions: vi.fn(),
  routing: vi.fn(),
}));
vi.mock('src/redux/finance/accountsActivityApi', () => ({
  useCreateAccountsManualEntryMutation: () => [mocks.create, { isLoading: false }],
}));
vi.mock('src/redux/finance/cashManagementApi', () => ({
  useGetCashOptionsQuery: (params: unknown, config: unknown) => {
    mocks.cashOptions(params, config);
    return {
      currentData: {
        bankAccounts: [],
        cashSources: [
          {
            id: 'cash-source',
            label: 'Receipt CASH-001',
            remainingAmount: mocks.cashBalance,
            concurrencyStamp: mocks.cashStamp,
          },
          {
            id: 'cash-source-2',
            label: 'Receipt CASH-002',
            remainingAmount: 50.25,
            concurrencyStamp: 'v3',
          },
        ],
      },
      isFetching: mocks.cashFetching,
      isError: mocks.cashError,
      refetch: mocks.refetch,
    };
  },
}));
vi.mock('src/redux/finance/financeRoutingApi', () => ({
  useGetFinanceRoutingOptionsQuery: (params: unknown) => {
    mocks.routing(params);
    return {
      isFetching: mocks.fetching,
      isError: mocks.error,
      refetch: mocks.refetch,
      currentData: mocks.error
        ? undefined
        : {
            incomeCategories: mocks.noCategories
              ? []
              : [{ id: 'income-category', label: 'Other income' }],
            expenseCategories: mocks.noCategories
              ? []
              : [{ id: 'expense-category', label: 'Supplies' }],
            bankAccounts: mocks.noBanks ? [] : [{ id: 'bank', label: 'School bank' }],
          },
    };
  },
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden="true" /> }));
vi.mock('src/components/shaking-text-field', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading, onBack }: any) => (
    <>
      <button type="button" onClick={onBack}>
        Back
      </button>
      <h1>{heading}</h1>
    </>
  ),
}));
// Real selectors, numeric formatting and date-picker interaction are verified in the browser.
// This suite checks the owning form's validation, request and close behavior.
vi.mock('src/components/custom-select', () => ({
  default: ({
    label,
    name,
    value,
    options,
    valueKey = 'value',
    labelKey = 'label',
    onChange,
    disabled,
    helperText,
  }: any) => (
    <label htmlFor={`test-${name}`}>
      {label}
      <select
        id={`test-${name}`}
        aria-label={label}
        name={name}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Select</option>
        {options.map((option: any) => (
          <option key={option[valueKey]} value={option[valueKey]}>
            {option[labelKey]}
          </option>
        ))}
      </select>
      <span>{helperText}</span>
    </label>
  ),
}));
vi.mock('src/components/custom-numeric-format', () => ({
  default: ({ label, name, value, disabled, onValueChange, onBlur, helperText }: any) => (
    <label htmlFor={`test-${name}`}>
      {label}
      <input
        id={`test-${name}`}
        aria-label={label}
        name={name}
        value={value}
        disabled={disabled}
        onBlur={onBlur}
        onChange={(event) => onValueChange({ value: event.target.value }, { source: 'event' })}
      />
      <span>{helperText}</span>
    </label>
  ),
}));
vi.mock('@mui/x-date-pickers', () => ({
  DateTimePicker: ({ label, value, onChange, disabled }: any) => (
    <label htmlFor="test-cash-payment-time">
      {label}
      <input
        id="test-cash-payment-time"
        aria-label={label}
        value={value.toISOString()}
        disabled={disabled}
        onChange={(event) => onChange(dayjs(event.target.value))}
      />
    </label>
  ),
  DatePicker: ({ label, value, onChange, disabled }: any) => (
    <label htmlFor="test-payment-date">
      {label}
      <input
        id="test-payment-date"
        aria-label={label}
        value={value.format('YYYY-MM-DD')}
        disabled={disabled}
        onChange={(event) => onChange(dayjs(event.target.value))}
      />
    </label>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.fetching = false;
  mocks.error = false;
  mocks.cashStamp = 'v1';
  mocks.cashBalance = 100;
  mocks.cashFetching = false;
  mocks.cashError = false;
  mocks.canAdd = true;
  mocks.noCategories = false;
  mocks.noBanks = false;
  mocks.unwrap.mockReset().mockResolvedValue({});
  mocks.create.mockImplementation(() => ({ unwrap: mocks.unwrap }));
});

function setup(direction: 'income' | 'expense' = 'income', initialBankAccountId?: string) {
  const onClose = vi.fn();
  const store = configureStore({
    reducer: {
      confirmPopup,
      auth: () => ({
        loading: false,
        permissionsInitialized: true,
        permissions: ['IncomeTracking', 'ExpenseTracking'].map((feature) => ({
          name: `Finance.Accounts.${feature}.Add`,
          isGranted: mocks.canAdd,
        })),
      }),
    },
  });
  const view = render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <ManualEntryForm
          direction={direction}
          period={{ id: 'year', startDate: '2026-06-01', endDate: '2027-05-31' }}
          month="2026-10"
          onClose={onClose}
          initialBankAccountId={initialBankAccountId}
        />
      </ThemeProvider>
    </Provider>
  );
  return { ...view, onClose };
}

it('prefills a bank-originated entry as a noncash payment and clears the bank for cash', async () => {
  setup('income', 'bank');
  expect(screen.getByLabelText('Payment method')).toHaveValue('3');
  expect(screen.getByLabelText('Receiving school bank account')).toHaveValue('bank');
  fireEvent.change(screen.getByLabelText('Payment method'), { target: { value: '0' } });
  await waitFor(() =>
    expect(screen.queryByLabelText('Receiving school bank account')).not.toBeInTheDocument()
  );
});
async function fill(direction: 'income' | 'expense' = 'income') {
  fireEvent.change(
    screen.getByLabelText(direction === 'income' ? /^Income name/ : /^Expense purpose/),
    { target: { value: ' Test entry ' } }
  );
  fireEvent.change(screen.getByLabelText(direction === 'income' ? /^Received from/ : /^Paid to/), {
    target: { value: ' Test payer ' },
  });
  fireEvent.change(
    screen.getByLabelText(direction === 'income' ? 'Income category' : 'Expense category'),
    { target: { value: `${direction}-category` } }
  );
  fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '12.34' } });
  fireEvent.change(screen.getByLabelText('Payment date'), {
    target: { value: '2026-10-14T15:45:00+05:30' },
  });
  await waitFor(() => expect(screen.getByLabelText('Amount')).toHaveValue('12.34'));
}

it('blocks manual entry submission without its exact Add permission', () => {
  mocks.canAdd = false;
  setup('income');
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mocks.create).not.toHaveBeenCalled();
});

it('replaces the entry body with a prerequisite message only after categories resolve empty', () => {
  mocks.noCategories = true;
  setup('income');
  expect(screen.getByRole('heading', { name: 'Add an income category first' })).toBeVisible();
  expect(screen.queryByLabelText(/^Income name/)).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
});

it('keeps the payment method switch available when noncash banks are empty', async () => {
  mocks.noBanks = true;
  setup('income', 'bank');
  expect(screen.getByRole('heading', { name: 'Add a bank account first' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Payment method'), { target: { value: '0' } });
  await waitFor(() =>
    expect(
      screen.queryByRole('heading', { name: 'Add a bank account first' })
    ).not.toBeInTheDocument()
  );
});

it('shows pooled year cash without receipt or reference selection', () => {
  setup('expense');
  expect(screen.queryByLabelText('Cash source receipt')).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/^Payment reference/)).not.toBeInTheDocument();
  expect(screen.getByText(/Available cash:/)).toHaveTextContent('151');
  expect(mocks.cashOptions).toHaveBeenLastCalledWith(
    { academicYearId: 'year', operation: 'expense' },
    expect.objectContaining({ skip: false })
  );
});

it.each(['income', 'expense'] as const)(
  'submits exact decimal %s money and returns to the register',
  async (direction) => {
    const { onClose } = setup(direction);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Enter a transaction name.')).not.toBeInTheDocument();
    await fill(direction);
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(mocks.create).toHaveBeenCalledOnce();
    expect(mocks.create.mock.calls[0][0]).toMatchObject({
      academicYearId: 'year',
      direction,
      body: {
        name: 'Test entry',
        counterparty: 'Test payer',
        amount: 12.34,
        categoryId: `${direction}-category`,
        paymentDate: '2026-10-14T10:15:00.000Z',
        bankAccountId: undefined,
      },
    });
  }
);

it('protects a dirty draft on Back and preserves values when discard is cancelled', async () => {
  const { onClose } = setup();
  await fill();
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));
  expect(await screen.findByRole('dialog')).toHaveTextContent('Discard unsaved changes?');
  fireEvent.click(screen.getAllByRole('button', { name: 'Cancel' }).at(-1)!);
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(screen.getByLabelText(/^Income name/)).toHaveValue(' Test entry ');
  expect(onClose).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Discard changes' }));
  expect(onClose).toHaveBeenCalledOnce();
});

it('closes a clean form without discard confirmation', () => {
  const { onClose } = setup();
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(onClose).toHaveBeenCalledOnce();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('requires a school bank for non-cash and clears it when changing back to cash', async () => {
  setup('expense');
  await fill('expense');
  fireEvent.change(screen.getByLabelText('Payment method'), { target: { value: '3' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(await screen.findByText('Select a school bank account.')).toBeInTheDocument();
  expect(mocks.create).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Paying school bank account'), {
    target: { value: 'bank' },
  });
  fireEvent.change(screen.getByLabelText('Payment method'), { target: { value: '0' } });
  fireEvent.change(screen.getByLabelText('Payment method'), { target: { value: '3' } });
  expect(screen.getByLabelText('Paying school bank account')).toHaveValue('');
  fireEvent.change(screen.getByLabelText('Paying school bank account'), {
    target: { value: 'bank' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(mocks.create).toHaveBeenCalledOnce());
  expect(mocks.create.mock.calls[0][0].body.bankAccountId).toBe('bank');
});

it('uses cash category authority for cash and keeps the optional noncash reference', async () => {
  setup('expense');
  expect(mocks.routing).toHaveBeenLastCalledWith({
    academicYearId: 'year',
    operation: 'cash-expense',
  });
  expect(screen.queryByLabelText(/^Payment reference/)).not.toBeInTheDocument();
  expect(
    screen.queryByText('Enter the bill or payment reference for this cash expense.')
  ).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Payment method'), { target: { value: '3' } });
  await waitFor(() =>
    expect(mocks.routing).toHaveBeenLastCalledWith({
      academicYearId: 'year',
      operation: 'expense-entry',
    })
  );
  expect(screen.getByLabelText('Payment reference (optional)')).not.toBeRequired();
  fireEvent.change(screen.getByLabelText('Payment method'), { target: { value: '0' } });
  await waitFor(() =>
    expect(mocks.routing).toHaveBeenLastCalledWith({
      academicYearId: 'year',
      operation: 'cash-expense',
    })
  );
});

it('keeps the income category authority and optional reference for cash income', () => {
  setup('income');
  expect(mocks.routing).toHaveBeenLastCalledWith({
    academicYearId: 'year',
    operation: 'income-entry',
  });
  expect(screen.getByLabelText('Payment reference (optional)')).not.toBeRequired();
});

it('locks saving, preserves failed input, and reuses the request key on retry', async () => {
  let rejectSave!: (error: unknown) => void;
  mocks.unwrap.mockImplementationOnce(
    () =>
      new Promise((_resolve, reject) => {
        rejectSave = reject;
      })
  );
  const { onClose } = setup();
  await fill();
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(mocks.create).toHaveBeenCalledOnce());
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  expect(screen.getByLabelText(/^Income name/)).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));
  expect(onClose).not.toHaveBeenCalled();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  const key = mocks.create.mock.calls[0][0].body.idempotencyKey;
  rejectSave({ status: 500, data: { detail: 'Please retry this entry.' } });
  expect(await screen.findByText('Please retry this entry.')).toBeInTheDocument();
  expect(screen.getByLabelText('Amount')).toBeDisabled();
  expect(screen.getByLabelText('Amount')).toHaveValue('12.34');
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(mocks.create.mock.calls[1][0].body.idempotencyKey).toBe(key);
  expect(mocks.create.mock.calls[1][0]).toEqual(mocks.create.mock.calls[0][0]);
});

it('shows lookup failure with Retry and blocks saving', () => {
  mocks.error = true;
  setup();
  expect(screen.getByText('Categories and bank accounts could not be loaded.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(mocks.refetch).toHaveBeenCalledOnce();
});

it('allows spending across receipts and blocks an amount above pooled cash', async () => {
  setup('expense');
  await fill('expense');
  fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '150.26' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(await screen.findByText('Amount exceeds the available cash balance.')).toBeInTheDocument();
  expect(mocks.create).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '150.25' } });
  await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(mocks.create).toHaveBeenCalledOnce());
  const { body } = mocks.create.mock.calls[0][0];
  expect(body.amount).toBe(150.25);
  expect(body).not.toHaveProperty('cashCollectionId');
  expect(body).not.toHaveProperty('cashConcurrencyStamp');
  expect(body).not.toHaveProperty('paymentReference');
});

it.each(['loading', 'error'] as const)('blocks cash expenses while pooled cash is %s', (state) => {
  mocks.cashFetching = state === 'loading';
  mocks.cashError = state === 'error';
  setup('expense');
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
});

it('omits a previously entered noncash reference after switching to Cash', async () => {
  setup('expense');
  await fill('expense');
  fireEvent.change(screen.getByLabelText('Payment method'), { target: { value: '3' } });
  fireEvent.change(screen.getByLabelText('Payment reference (optional)'), {
    target: { value: 'R'.repeat(101) },
  });
  fireEvent.change(screen.getByLabelText('Payment method'), { target: { value: '0' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(mocks.create).toHaveBeenCalledOnce());
  expect(mocks.create.mock.calls[0][0].body).not.toHaveProperty('paymentReference');
});

it('submits the chosen actual cash payment instant after an after-noon collection', async () => {
  setup('expense');
  await fill('expense');
  fireEvent.change(screen.getByLabelText('Payment date'), {
    target: { value: '2026-10-14T15:45:00+05:30' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(mocks.create).toHaveBeenCalledOnce());
  expect(mocks.create.mock.calls[0][0].body.paymentDate).toBe('2026-10-14T10:15:00.000Z');
  expect(Date.parse(mocks.create.mock.calls[0][0].body.paymentDate)).toBeGreaterThan(
    Date.parse('2026-10-14T14:00:00+05:30')
  );
});

it('refreshes a definitive stale cash balance without losing entered expense evidence', async () => {
  mocks.unwrap.mockRejectedValueOnce({
    status: 409,
    data: { code: 'Finance:CashManagement:Stale', detail: 'Cash balance changed.' },
  });
  mocks.refetch.mockImplementationOnce(async () => {
    mocks.cashStamp = 'v2';
    return { data: {} };
  });
  const { onClose } = setup('expense');
  await fill('expense');
  fireEvent.change(screen.getByLabelText('Notes (optional)'), {
    target: { value: 'Keep these notes' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  const refresh = await screen.findByRole('button', { name: 'Refresh cash balance' });
  const key = mocks.create.mock.calls[0][0].body.idempotencyKey;
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  fireEvent.click(refresh);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
  expect(screen.getByLabelText('Amount')).toHaveValue('12.34');
  expect(screen.getByLabelText('Notes (optional)')).toHaveValue('Keep these notes');
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(mocks.create.mock.calls[1][0].body).not.toHaveProperty('cashConcurrencyStamp');
  expect(mocks.create.mock.calls[1][0].body.idempotencyKey).not.toBe(key);
});
