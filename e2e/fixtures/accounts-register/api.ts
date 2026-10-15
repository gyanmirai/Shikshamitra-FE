import { createApi } from '@reduxjs/toolkit/query/react';
import { tagTypes } from 'src/redux/tagTypes';
import type {
  AccountsActivityRow,
  AccountsActivityDetail,
} from 'src/redux/finance/accountsActivityApi';
export const fixtureState = { failList: false, failOptions: false };
const row = (
  id: string,
  source: AccountsActivityRow['source'],
  reference: string,
  amount: number
): AccountsActivityRow => ({
  id,
  sourceId: id,
  source,
  reference,
  amount,
  studentId: source === 'Collection' || source === 'Refund' ? 'student' : null,
  studentName:
    source === 'Collection' || source === 'Refund'
      ? 'Ayaan Prerna Atre'
      : source === 'Income'
        ? 'Parent association'
        : 'School supplier',
  categoryId: source === 'Refund' || source === 'Expense' ? 'expense-category' : 'income-category',
  categoryName:
    source === 'Refund'
      ? 'Student refunds'
      : source === 'Expense'
        ? 'School supplies'
        : 'Tuition fee income',
  bankLabel: 'SBI • 9384',
  bankAccountId: 'bank',
  sourceStatus:
    source === 'Refund' ? 'Awaiting payout' : source === 'Expense' ? 'Paid' : 'Received',
  accountingStatus: 'Not posted',
  occurredAt: '2026-10-05T11:31:00Z',
  canOpenSource: true,
});
export const rows = [
  row('receipt', 'Collection', 'REC-2026-000010', 2000),
  row('donation', 'Income', 'Parent association donation', 1000),
  row('supplies', 'Expense', 'Stationery purchase', 500),
  row('refund', 'Refund', 'REF-2026-000001', 200),
];
export function confirmRefund() {
  const index = rows.findIndex((x) => x.id === 'refund');
  rows[index] = { ...rows[index], sourceStatus: 'Paid' };
}
export function returnRefund() {
  const original = rows.find((x) => x.id === 'refund')!;
  if (!rows.some((x) => x.id === 'refund-return'))
    rows.push({ ...original, id: 'refund-return', sourceStatus: 'Returned', amount: -200 });
}
const saved = new Map<string, unknown>();
export const api = createApi({
  reducerPath: 'api',
  tagTypes,
  baseQuery: async (args: any) => {
    await new Promise((resolve) => setTimeout(resolve, 120));
    const params = args.params ?? {};
    if (args.url === '/finance-routing-options')
      return fixtureState.failOptions
        ? { error: { status: 500, data: {} } }
        : {
            data: {
              incomeCategories: [{ id: 'income-category', label: 'Other school income' }],
              expenseCategories: [{ id: 'expense-category', label: 'School supplies' }],
              bankAccounts: [{ id: 'bank', label: 'SBI • 9384' }],
            },
          };
    if (args.url === '/accounts/register') {
      if (fixtureState.failList) return { error: { status: 500, data: {} } };
      let result =
        params.academicYearId === 'year-2026'
          ? rows.filter((x) =>
              params.direction === 'income'
                ? x.source === 'Income' || x.source === 'Collection'
                : x.source === 'Expense' || x.source === 'Refund'
            )
          : [];
      if (params.source) result = result.filter((x) => x.source.toLowerCase() === params.source);
      const categories = [
        ...new Map(
          result.map((x) => [x.categoryId, { id: x.categoryId, label: x.categoryName }])
        ).values(),
      ];
      if (params.month)
        result = result.filter(
          (x) =>
            Number(x.occurredAt.slice(5, 7)) === params.month &&
            Number(x.occurredAt.slice(0, 4)) === params.year
        );
      if (params.categoryId) result = result.filter((x) => x.categoryId === params.categoryId);
      if (params.search)
        result = result.filter((x) =>
          (x.reference + x.studentName + x.categoryName)
            .toLowerCase()
            .includes(params.search.toLowerCase())
        );
      const sortBy = (params.sortBy ?? 'occurredAt') as keyof AccountsActivityRow;
      const descending = params.sortDescending !== false;
      result = [...result].sort((left, right) => {
        const a = sortBy === 'occurredAt' ? Date.parse(left.occurredAt) : left[sortBy];
        const b = sortBy === 'occurredAt' ? Date.parse(right.occurredAt) : right[sortBy];
        const comparison =
          typeof a === 'number' && typeof b === 'number'
            ? a - b
            : String(a ?? '').localeCompare(String(b ?? ''));
        return (descending ? -comparison : comparison) || right.id.localeCompare(left.id);
      });
      return {
        data: {
          items: result
            .slice((params.page - 1) * params.pageSize, params.page * params.pageSize)
            .map((x) => ({ ...x })),
          totalCount: result.length,
          page: params.page,
          pageSize: params.pageSize,
          categories,
        },
      };
    }
    if (args.url.startsWith('/accounts/register/')) {
      const item = rows.find((x) => x.id === args.url.split('/').at(-1))!;
      const detail: AccountsActivityDetail = {
        ...item,
        academicYearId: params.academicYearId,
        academicYearName: '2026–2027',
        grNumber: item.studentId ? 'GR-0010' : undefined,
        className: item.studentId ? 'Class 5' : undefined,
        divisionName: item.studentId ? 'A' : undefined,
        counterparty: item.studentId ? undefined : 'Parent association',
        notes: 'Synthetic verification record',
        originalReceiptNumber: item.source === 'Refund' ? 'REC-2026-000010' : undefined,
        refundReason: item.source === 'Refund' ? 'Approved excess payment refund' : undefined,
        approvedPaymentMethod: item.source === 'Refund' ? 'BankTransfer' : undefined,
        refundStatus:
          item.source === 'Refund'
            ? item.sourceStatus === 'Awaiting payout'
              ? 'Approved'
              : 'Processed'
            : undefined,
        categoryAmounts: item.studentId
          ? [{ category: item.categoryName, amount: item.amount, bankLabel: item.bankLabel }]
          : [],
        allocations: item.studentId
          ? [
              {
                name: 'Tuition fee',
                period: 'October 2026',
                amount: item.amount,
                coverageStartDate: '2026-10-01',
                coverageEndDate: '2026-10-31',
              },
            ]
          : [],
        payments:
          item.sourceStatus === 'Awaiting payout'
            ? []
            : [
                {
                  method: 'BankTransfer',
                  date: item.occurredAt,
                  amount: item.amount,
                  bankLabel: item.bankLabel,
                  reference: 'UTR-SYNTHETIC-001',
                  status: 'Confirmed',
                },
              ],
      };
      return { data: detail };
    }
    if (args.method === 'POST') {
      if (saved.has(args.body.idempotencyKey)) return { data: saved.get(args.body.idempotencyKey) };
      const source = args.url === '/incomes' ? 'Income' : 'Expense';
      const item = {
        ...row(args.body.idempotencyKey, source, args.body.name, args.body.amount),
        occurredAt: args.body.paymentDate,
        bankLabel: args.body.bankAccountId ? 'SBI • 9384' : '',
        bankAccountId: args.body.bankAccountId,
        studentName: args.body.counterparty,
      };
      rows.push(item);
      const response = { success: true, data: item };
      saved.set(item.id, response);
      return { data: response };
    }
    return { error: { status: 404, data: {} } };
  },
  endpoints: () => ({}),
});
