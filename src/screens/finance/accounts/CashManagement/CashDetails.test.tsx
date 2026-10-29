import type { CashDetail, CashDeposit } from 'src/redux/finance/cashManagementApi';

import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { fDateTime } from 'src/utils/format-time';
import { it, vi, expect, beforeEach } from 'vitest';
import { formatNumber } from 'src/utils/formate_number';
import { render, screen, fireEvent } from '@testing-library/react';

import CashDetails from './CashDetails';

const mock = vi.hoisted(() => ({
  data: {} as CashDetail,
  fetching: false,
  error: false,
  refetch: vi.fn(),
  query: vi.fn(),
  onClose: vi.fn(),
}));
vi.mock('src/redux/finance/cashManagementApi', () => ({
  useDownloadCashSupportingDocumentMutation: () => [vi.fn(), { isLoading: false }],
  useGetCashDetailQuery: (...args: unknown[]) => {
    mock.query(...args);
    return {
      currentData: mock.data,
      isFetching: mock.fetching,
      isError: mock.error,
      refetch: mock.refetch,
    };
  },
}));
vi.mock('./CashCommandDialog', () => ({
  default: ({ action, deposit, academicYearId, onClose }: any) => (
    <div role="dialog" aria-label="Bank credit confirmation">
      {action}:{deposit.id}:{academicYearId}
      <button type="button" onClick={onClose}>
        Cancel confirmation
      </button>
    </div>
  ),
}));
vi.mock('src/components/scrollbar', () => ({
  Scrollbar: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/detail-view', () => ({
  DetailSection: ({ title, helpText, children }: any) => (
    <section aria-label={title}>
      <h3>{title}</h3>
      <span>{helpText}</span>
      {children}
    </section>
  ),
  DetailGrid: ({ children }: any) => <div>{children}</div>,
  DetailField: ({ label, value }: any) => (
    <div>
      {label}: {value}
    </div>
  ),
}));
vi.mock('src/components/customizabaleTable', () => ({ default: () => null }));
vi.mock('src/screens/finance/policies/components/FinancePolicyDrawerHeader', () => ({
  default: ({ title, titleId, helpText, badges }: any) => (
    <header>
      <h2 id={titleId}>{title}</h2>
      <span>{helpText}</span>
      {badges}
    </header>
  ),
}));

const transitDeposit = (): CashDeposit => ({
  id: 'deposit-1',
  reference: 'BANK-001',
  amount: 10000,
  creditedAmount: 2000,
  status: 0,
  depositDate: '2026-10-27T10:00:00Z',
  creditDate: null,
  createdBy: 'collector',
  canConfirm: true,
});

function setup({ permissions = [] as string[], initialized = true, loading = false } = {}) {
  const store = configureStore({
    reducer: {
      auth: () => ({
        permissionsInitialized: initialized,
        loading,
        permissions: permissions.map((name) => ({ name, isGranted: true })),
      }),
    },
  });
  return render(
    <Provider store={store}>
      <CashDetails id="cash" academicYearId="selected-year" onClose={mock.onClose} />
    </Provider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mock.fetching = false;
  mock.error = false;
  mock.data = {
    id: 'cash',
    sourceId: 'source',
    reference: 'REC-001',
    payerName: 'Asha',
    creatorId: 'collector',
    concurrencyStamp: 'stamp',
    status: 0,
    amount: 23000,
    remainingAmount: 18000,
    spentAmount: 5000,
    depositedAmount: 0,
    inTransitAmount: 0,
    collectedAt: '2026-10-27T09:00:00Z',
    approvedAt: null,
    bankAccountId: null,
    bankLabel: null,
    canApprove: true,
    canDeposit: true,
    notes: 'Original collection note',
    deposits: [],
    expenses: [],
  };
});

it('shows source evidence without approval or individual deposit controls even with grants', () => {
  setup({
    permissions: [
      'Finance.Accounts.CashManagement.Approve',
      'Finance.Accounts.CashManagement.Deposit',
    ],
  });
  expect(screen.getByText(`Original collected cash: ${formatNumber(23000, 'INR')}`)).toBeVisible();
  expect(screen.getByText(`Expenses paid: ${formatNumber(5000, 'INR')}`)).toBeVisible();
  expect(
    screen.getByText(`Deposited (confirmed bank credit): ${formatNumber(0, 'INR')}`)
  ).toBeVisible();
  expect(screen.getByText(`Remaining cash: ${formatNumber(18000, 'INR')}`)).toBeVisible();
  expect(screen.getByText('Receiving school bank account: Not deposited')).toBeVisible();
  expect(screen.getByText('Latest deposit date: Not deposited')).toBeVisible();
  expect(screen.getByText('Notes: Original collection note')).toBeVisible();
  expect(screen.queryByText(/approv/i)).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /record bank deposit/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /confirm bank credit/i })).not.toBeInTheDocument();
  expect(mock.query).toHaveBeenCalledWith(
    { id: 'cash', academicYearId: 'selected-year' },
    { refetchOnMountOrArgChange: true }
  );
});

it('uses deposit evidence for the latest date and shows the saved receiving bank', () => {
  mock.data.status = 1;
  mock.data.bankLabel = 'School bank •1234';
  mock.data.approvedAt = '2026-10-28T01:00:00Z';
  mock.data.deposits = [
    { ...transitDeposit(), id: 'newer', depositDate: '2026-10-28T10:00:00Z' },
    transitDeposit(),
  ];
  setup();
  expect(screen.getByText('Receiving school bank account: School bank •1234')).toBeVisible();
  expect(
    screen.getByText(`Latest deposit date: ${fDateTime('2026-10-28T10:00:00Z')}`)
  ).toBeVisible();
  expect(screen.queryByText(/approv/i)).not.toBeInTheDocument();
});

it('shows the saved supporting document with an authorized download action', () => {
  mock.data.supportingDocumentName = 'deposit-slip.pdf';
  setup();
  expect(screen.getByRole('region', { name: 'Attachments' })).toHaveTextContent('deposit-slip.pdf');
  expect(screen.getByRole('button', { name: 'Download supporting document' })).toBeEnabled();
});

it('opens the existing bank credit confirmation for an eligible legacy deposit with Reconcile', () => {
  mock.data.deposits = [transitDeposit()];
  setup({ permissions: ['Finance.Accounts.CashManagement.Reconcile'] });
  fireEvent.click(screen.getByRole('button', { name: 'Confirm bank credit' }));
  expect(screen.getByRole('dialog', { name: 'Bank credit confirmation' })).toHaveTextContent(
    'confirm:deposit-1:selected-year'
  );
  expect(screen.getByRole('button', { name: /^Close$/ })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Refresh details' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Cancel confirmation' }));
  expect(screen.getByRole('button', { name: /^Close$/ })).toBeEnabled();
});

it.each([
  { permissions: ['Finance.Accounts.CashManagement.Approve'], eligible: true, credited: 2000 },
  { permissions: ['Finance.Accounts.CashManagement.Deposit'], eligible: true, credited: 2000 },
  { permissions: ['Finance.Accounts.CashManagement.Reconcile'], eligible: false, credited: 2000 },
  { permissions: ['Finance.Accounts.CashManagement.Reconcile'], eligible: true, credited: 10000 },
])('requires Reconcile, server eligibility and actual cash in transit: %j', (testCase) => {
  mock.data.deposits = [
    { ...transitDeposit(), canConfirm: testCase.eligible, creditedAmount: testCase.credited },
  ];
  setup({ permissions: testCase.permissions });
  expect(screen.queryByRole('button', { name: 'Confirm bank credit' })).not.toBeInTheDocument();
});

it.each([
  { fetching: true, error: false, initialized: true, loading: false },
  { fetching: false, error: true, initialized: true, loading: false },
  { fetching: false, error: false, initialized: false, loading: false },
  { fetching: false, error: false, initialized: true, loading: true },
])('blocks reconciliation when current evidence or permissions are unavailable: %j', (testCase) => {
  mock.data.deposits = [transitDeposit()];
  mock.fetching = testCase.fetching;
  mock.error = testCase.error;
  setup({
    permissions: ['Finance.Accounts.CashManagement.Reconcile'],
    initialized: testCase.initialized,
    loading: testCase.loading,
  });
  expect(screen.queryByRole('button', { name: 'Confirm bank credit' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^Close$/ })).toBeEnabled();
});

it('refreshes and closes the read-only source view', () => {
  setup();
  fireEvent.click(screen.getByRole('button', { name: 'Refresh details' }));
  expect(mock.refetch).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole('button', { name: /^Close$/ }));
  expect(mock.onClose).toHaveBeenCalledOnce();
});
