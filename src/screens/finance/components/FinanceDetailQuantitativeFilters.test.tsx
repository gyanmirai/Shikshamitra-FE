import type { CashDetail } from 'src/redux/finance/cashManagementApi';
import type { CollectFeeOutput } from 'src/redux/feeCollection/feeCollection';

import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { act, render, screen, within, waitFor, fireEvent } from '@testing-library/react';

import CashDetails from '../accounts/CashManagement/CashDetails';
import AdjustmentView from '../adjustments/components/AdjustmentView';
import { AdjustmentStatusEnum } from '../adjustments/enums/adjustment.enum';
import FeeCollectionOutcomePanel from '../FeeCollection/FeeCollectionComponent/FeeCollectionOutcomePanel';

const readOnly = vi.hoisted(() => ({
  cash: {
    id: 'cash', sourceId: 'source', reference: 'Cash reference', payerName: 'Payer', creatorId: 'collector',
    concurrencyStamp: 'stamp', status: 1, amount: 5000, spentAmount: 2000.5, remainingAmount: 2999.5,
    depositedAmount: 0, inTransitAmount: 0, collectedAt: '2026-10-01T09:00:00Z', approvedAt: null,
    bankAccountId: null, bankLabel: null, canApprove: false, canDeposit: false, deposits: [],
    expenses: [
      { id: 'alpha', name: 'Alpha expense', amount: 1000.25, paymentDate: '2026-10-01T10:00:00Z' },
      { id: 'beta', name: 'Beta expense', amount: 0.25, paymentDate: '2026-10-15T10:00:00Z' },
      { id: 'gamma', name: 'Gamma expense', amount: 1000, paymentDate: '2026-11-01T10:00:00Z' },
    ],
  } satisfies CashDetail,
  adjustment: {
    studentName: 'Student', status: 1, createdAt: '2026-10-01T10:00:00Z', requestedByName: 'Requester',
    requestedAmount: 2000.5, appliedAmount: 2000.5, remainingAmount: 0, voucherNumber: 'Voucher', sourceLines: [],
    targetAllocations: [
      { id: 'alpha', feeHeadName: 'Alpha allocation', amount: 1000.25, month: 10, year: 2026 },
      { id: 'beta', feeHeadName: 'Beta allocation', amount: 0.25, month: 10, year: 2026 },
      { id: 'gamma', feeHeadName: 'Gamma allocation', amount: 1000, month: 10, year: 2026 },
    ],
  },
}));
vi.mock('src/redux/finance/cashManagementApi', () => ({
  useGetCashDetailQuery: () => ({ currentData: readOnly.cash, isFetching: false, isError: false, refetch: vi.fn() }),
  useDownloadCashSupportingDocumentMutation: () => [vi.fn(), { isLoading: false }],
}));
vi.mock('src/redux/customQueryAndMutation', () => ({ default: () => ({ data: readOnly.adjustment, isLoading: false }) }));
vi.mock('src/redux/finance/adjustments/adjustmentApi', () => ({ useGetFeeAdjustmentQuery: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('../accounts/CashManagement/CashCommandDialog', () => ({ default: () => null }));

const output: CollectFeeOutput = {
  id: 'collection', studentId: 'student', studentName: 'Student', academicYearId: 'year',
  totalAmount: 2000.5, receivedAmount: 2000.5, status: 1, receiptNumber: 'Receipt reference',
  collectedBy: 'Collector', collectedAt: '2026-10-01T10:00:00Z', createdAt: '2026-10-01T10:00:00Z',
  paidFeeHeads: [], paidDueFees: [],
  auditSummary: { headline: 'Allocation result', totalAmount: 2000.5, changedFields: [], allocationLines: [
    { dueFeeId: 'alpha', feeHeadId: 'alpha', feeHeadName: 'Alpha fee', installmentLabel: 'October', amountPaid: 1000.25, pendingBefore: 1000.25, pendingAfter: 0 },
    { dueFeeId: 'beta', feeHeadId: 'beta', feeHeadName: 'Beta fee', installmentLabel: 'October', amountPaid: 0.25, pendingBefore: 0.5, pendingAfter: 0.25 },
    { dueFeeId: 'gamma', feeHeadId: 'gamma', feeHeadName: 'Gamma fee', installmentLabel: 'October', amountPaid: 1000, pendingBefore: 1990, pendingAfter: 990 },
  ] },
};
const theme = createTheme(defaultSettings);
function show(child: React.ReactNode) {
  const store = configureStore({ reducer: { confirmPopup, auth: () => ({ permissionsInitialized: true, loading: false, permissions: [] }) } });
  render(<Provider store={store}><ThemeProvider theme={theme}><LocalizationProvider dateAdapter={AdapterDayjs}>{child}</LocalizationProvider></ThemeProvider></Provider>);
}
function parent(kind: string) {
  if (kind === 'cash') return <CashDetails id="cash" academicYearId="year" onClose={vi.fn()} />;
  if (kind === 'adjustment') return <AdjustmentView adjustmentId="adjustment" viewMeta={{ id: 'adjustment', status: AdjustmentStatusEnum.Approved }} onClose={vi.fn()} onApprove={vi.fn()} onReject={vi.fn()} />;
  return <FeeCollectionOutcomePanel collectResponse={output} showAuditTrail={false} />;
}
function assertRows(table: HTMLElement, all: string[], expected: string[]) {
  expect(within(table).getAllByRole('row')).toHaveLength(expected.length + 1);
  all.forEach((name) => {
    if (expected.includes(name)) expect(within(table).getByText(name)).toBeInTheDocument();
    else expect(within(table).queryByText(name)).not.toBeInTheDocument();
  });
}
async function clearAndRestore(table: HTMLElement, names: string[]) {
  fireEvent.click(screen.getByRole('button', { name: 'Clear (1)' }));
  await waitFor(() => assertRows(table, names, names));
}
beforeEach(() => localStorage.clear());

it.each([
  { kind: 'cash', column: 'Paid', names: ['Alpha expense', 'Beta expense', 'Gamma expense'], operator: 'Greater Than', value: '1000', expected: ['Alpha expense'] },
  { kind: 'adjustment', column: 'Applied Amount', names: ['Alpha allocation', 'Beta allocation', 'Gamma allocation'], operator: 'Greater Than', value: '1000', expected: ['Alpha allocation'] },
  { kind: 'outcome', column: 'Paid', names: ['Alpha fee', 'Beta fee', 'Gamma fee'], operator: 'Greater Than', value: '1000', expected: ['Alpha fee'] },
  { kind: 'outcome', column: 'Pending after', names: ['Alpha fee', 'Beta fee', 'Gamma fee'], operator: 'Between', min: '0.2', max: '0.3', expected: ['Beta fee'] },
])('$kind $column filters fractional raw amounts and Clear restores all rows', async ({ kind, column, names, operator, value, min, max, expected }) => {
  show(parent(kind));
  const table = screen.getByRole('table');
  assertRows(table, names, names);
  fireEvent.click(within(table).getByRole('button', { name: `Filter ${column}` }));
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Filter Type *' }));
  fireEvent.click(screen.getByRole('option', { name: operator }));
  if (operator === 'Between') {
    fireEvent.change(screen.getByRole('spinbutton', { name: `${column} Min *` }), { target: { value: min } });
    fireEvent.change(screen.getByRole('spinbutton', { name: `${column} Max *` }), { target: { value: max } });
  } else {
    fireEvent.change(screen.getByRole('spinbutton', { name: `${column} *` }), { target: { value } });
  }
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Apply' })); });
  await waitFor(() => assertRows(table, names, expected));
  await clearAndRestore(table, names);
}, 30000);

it('cash Payment date uses the actual date sections and Clear restores all expenses', async () => {
  const user = userEvent.setup();
  show(parent('cash'));
  const table = screen.getByRole('table');
  const names = ['Alpha expense', 'Beta expense', 'Gamma expense'];
  assertRows(table, names, names);
  fireEvent.click(within(table).getByRole('button', { name: 'Filter Payment date' }));
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Filter Type *' }));
  fireEvent.click(screen.getByRole('option', { name: 'Equals' }));
  const field = screen.getByRole('group', { name: 'Payment date *' });
  await user.click(within(field).getByRole('spinbutton', { name: 'Day' }));
  await user.keyboard('15');
  await user.click(within(field).getByRole('spinbutton', { name: 'Month' }));
  await user.keyboard('10');
  await user.click(within(field).getByRole('spinbutton', { name: 'Year' }));
  await user.keyboard('2026');
  await user.click(screen.getByRole('button', { name: 'Apply' }));
  await waitFor(() => assertRows(table, names, ['Beta expense']));
  await clearAndRestore(table, names);
}, 30000);
