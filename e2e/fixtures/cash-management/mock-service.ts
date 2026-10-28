import type { CashDetail } from 'src/redux/finance/cashManagementApi';

import { tagTypes } from 'src/redux/tagTypes';
import { createApi } from '@reduxjs/toolkit/query/react';

const row: CashDetail = {
  id: 'cash-1',
  sourceId: 'receipt-1',
  reference: 'CASH-2026-0001',
  payerName: 'Synthetic Parent',
  amount: 10000,
  spentAmount: 0,
  depositedAmount: 0,
  inTransitAmount: 0,
  remainingAmount: 10000,
  status: 0,
  bankAccountId: null,
  bankLabel: null,
  collectedAt: '2026-10-20T10:30:00+05:30',
  approvedAt: null,
  creatorId: 'other-user',
  concurrencyStamp: 'v1',
  canApprove:
    !new URLSearchParams(window.location.search).has('readonly') &&
    (!new URLSearchParams(window.location.search).has('collector') ||
      new URLSearchParams(window.location.search).has('admin')),
  canDeposit: false,
  deposits: [],
  expenses: [],
};
if (new URLSearchParams(window.location.search).has('legacy'))
  Object.assign(row, {
    status: 1,
    bankAccountId: 'bank',
    bankLabel: 'School current account • 4321',
    approvedAt: '2026-10-21T10:30:00+05:30',
    canApprove: false,
    canDeposit: true,
  });
let version = 1;
const completed = new Map<string, unknown>();
const invalid = (detail: string, code = 'Finance:CashManagement:InvalidAmount') => ({
  error: { status: 409, data: { code, detail } },
});
export const api = createApi({
  reducerPath: 'api',
  tagTypes,
  endpoints: () => ({}),
  baseQuery: async (args: any) => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const { url, body, params } = args;
    if (new URLSearchParams(window.location.search).has('error'))
      return { error: { status: 500, data: { detail: 'Synthetic connection failure.' } } };
    if (url === '/finance-routing-options')
      return {
        data: {
          incomeCategories: [{ id: 'income', label: 'Other Income' }],
          expenseCategories: [{ id: 'expense', label: 'Supplies' }],
          bankAccounts: [{ id: 'bank', label: 'School current account • 4321' }],
        },
      };
    if (url.endsWith('/options'))
      return {
        data: {
          bankAccounts: [{ id: 'bank', label: 'School current account • 4321' }],
          cashSources:
            row.status === (params?.operation === 'deposit' ? 1 : 0) && row.remainingAmount > 0
              ? [
                  {
                    id: row.id,
                    label: row.reference,
                    remainingAmount: row.remainingAmount,
                    concurrencyStamp: row.concurrencyStamp,
                  },
                ]
              : [],
        },
      };
    if (url === '/finance/cash-management') {
      const filters = JSON.parse(params.filters || '[]');
      const matches =
        (!params.search ||
          `${row.reference} ${row.payerName}`
            .toLowerCase()
            .includes(params.search.toLowerCase())) &&
        filters.every((filter: any) => {
          const value = row[filter.column as keyof CashDetail];
          const expected = filter.value;
          if (filter.type === 'greaterThan') return Number(value) > Number(expected);
          if (filter.type === 'lessThan') return Number(value) < Number(expected);
          if (filter.type === 'between')
            return Number(value) >= Number(expected.min) && Number(value) <= Number(expected.max);
          const text = String(value ?? '').toLowerCase();
          if (filter.type === 'startsWith') return text.startsWith(String(expected).toLowerCase());
          if (filter.type === 'endsWith') return text.endsWith(String(expected).toLowerCase());
          if (filter.type === 'equals') return text === String(expected).toLowerCase();
          return text.includes(String(expected).toLowerCase());
        });
      const visible = matches && (params.status === undefined || params.status === row.status);
      return {
        data: {
          items: visible ? [structuredClone(row)] : [],
          page: 1,
          pageSize: 20,
          totalCount: visible ? 1 : 0,
          statusCounts: {
            all: matches ? 1 : 0,
            pending: matches && row.status === 0 ? 1 : 0,
            approved: matches && row.status === 1 ? 1 : 0,
          },
          summary: {
            collected: visible ? row.amount : 0,
            pendingApproval: visible && row.status === 0 ? row.remainingAmount : 0,
            approved: visible && row.status === 1 ? row.amount : 0,
            spent: visible ? row.spentAmount : 0,
            deposited: visible ? row.depositedAmount : 0,
            inTransit: visible ? row.inTransitAmount : 0,
            remaining: visible ? row.remainingAmount : 0,
          },
        },
      };
    }
    if (body) {
      if (body.idempotencyKey && completed.has(body.idempotencyKey))
        return { data: structuredClone(completed.get(body.idempotencyKey)) };
      const expectedStamp = url === '/expenses' ? body.cashConcurrencyStamp : body.concurrencyStamp;
      if (expectedStamp && expectedStamp !== row.concurrencyStamp)
        return invalid('Cash changed. Refresh cash details.', 'Finance:CashManagement:Stale');
      if (url.endsWith('/approve')) {
        if (
          !row.canApprove ||
          row.status !== 0 ||
          body.countedAmount !== row.remainingAmount ||
          body.bankAccountId !== 'bank'
        )
          return invalid('Count must match the remaining cash and select the receiving bank.');
        const net = row.remainingAmount;
        Object.assign(row, {
          status: 1,
          bankAccountId: body.bankAccountId,
          bankLabel: 'School current account • 4321',
          approvedAt: new Date().toISOString(),
          approvedBy: 'Independent checker',
          canApprove: false,
          canDeposit: false,
          depositedAmount: net,
          remainingAmount: 0,
        });
        if (net > 0)
          row.deposits.push({
            id: `deposit-${version}`,
            amount: net,
            creditedAmount: net,
            status: 1,
            reference: 'Final cash approval',
            depositDate: row.approvedAt!,
            creditDate: row.approvedAt!,
            createdBy: 'Final approver',
            canConfirm: false,
          });
      } else if (url.endsWith('/deposits')) {
        row.remainingAmount -= body.amount;
        row.inTransitAmount += body.amount;
        row.deposits.push({
          id: `deposit-${version}`,
          amount: body.amount,
          creditedAmount: 0,
          status: 0,
          reference: body.reference,
          depositDate: body.depositDate,
          creditDate: null,
          createdBy: 'other-depositor',
          canConfirm: true,
        });
      } else if (url.endsWith('/confirm')) {
        const d = row.deposits.find((item) => url.includes(item.id))!;
        d.creditedAmount += body.amount;
        d.creditDate = body.creditDate;
        d.status = d.creditedAmount === d.amount ? 1 : 0;
        d.canConfirm = d.status === 0;
        row.inTransitAmount -= body.amount;
        row.depositedAmount += body.amount;
      } else if (url === '/expenses') {
        if (
          row.status !== 0 ||
          body.cashCollectionId !== row.id ||
          body.amount <= 0 ||
          body.amount > row.remainingAmount
        )
          return invalid('Select a pending cash receipt with enough remaining cash.');
        row.spentAmount += body.amount;
        row.remainingAmount -= body.amount;
        row.expenses.push({
          id: `expense-${version}`,
          name: body.name,
          amount: body.amount,
          paymentDate: body.paymentDate,
        });
      }
      version += 1;
      row.concurrencyStamp = `v${version}`;
      if (body.idempotencyKey) completed.set(body.idempotencyKey, structuredClone(row));
    }
    return { data: structuredClone(row) };
  },
});
