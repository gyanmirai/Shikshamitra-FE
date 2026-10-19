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
}));
vi.mock('src/redux/finance/accountsActivityApi', () => ({
  useCreateAccountsManualEntryMutation: () => [mocks.create, { isLoading: false }],
}));
vi.mock('src/redux/finance/financeRoutingApi', () => ({
  useGetFinanceRoutingOptionsQuery: () => ({
    isFetching: mocks.fetching,
    isError: mocks.error,
    refetch: mocks.refetch,
    currentData: mocks.error
      ? undefined
      : {
          incomeCategories: [{ id: 'income-category', label: 'Other income' }],
          expenseCategories: [{ id: 'expense-category', label: 'Supplies' }],
          bankAccounts: [{ id: 'bank', label: 'School bank' }],
        },
  }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden="true" /> }));
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
      {helperText}
    </label>
  ),
}));
vi.mock('@mui/x-date-pickers', () => ({
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
    mocks.canAdd = true;
  mocks.unwrap.mockReset().mockResolvedValue({});
  mocks.create.mockImplementation(() => ({ unwrap: mocks.unwrap }));
});

function setup(direction: 'income' | 'expense' = 'income') {
  const onClose = vi.fn();
  const store = configureStore({ reducer: { confirmPopup, auth: () => ({
    loading: false,
    permissionsInitialized: true,
    permissions: ['IncomeTracking', 'ExpenseTracking'].map((feature) => ({
      name: `Finance.Accounts.${feature}.Add`, isGranted: mocks.canAdd,
    })),
  }) } });
  const view = render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <ManualEntryForm
          direction={direction}
          period={{ id: 'year', startDate: '2026-06-01', endDate: '2027-05-31' }}
          month="2026-10"
          onClose={onClose}
        />
      </ThemeProvider>
    </Provider>
  );
  return { ...view, onClose };
}
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
  fireEvent.change(screen.getByLabelText('Payment date'), { target: { value: '2026-10-14' } });
  await waitFor(() => expect(screen.getByLabelText('Amount')).toHaveValue('12.34'));
}

it('blocks manual entry submission without its exact Add permission', () => {
  mocks.canAdd = false;
  setup('income');
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mocks.create).not.toHaveBeenCalled();
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
        paymentDate: '2026-10-14T12:00:00+05:30',
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
  expect(screen.getByLabelText('Amount')).toHaveValue('12.34');
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(mocks.create.mock.calls[1][0].body.idempotencyKey).toBe(key);
});

it('shows lookup failure with Retry and blocks saving', () => {
  mocks.error = true;
  setup();
  expect(screen.getByText('Categories and bank accounts could not be loaded.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(mocks.refetch).toHaveBeenCalledOnce();
});
