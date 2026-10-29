import type { BankActivityPage, BankActivityRow } from 'src/redux/finance/BankAccountManage/bankAccountActivityApi';
import { createApi } from '@reduxjs/toolkit/query/react';
import { tagTypes } from 'src/redux/tagTypes';

export const period = { id: 'year', name: '2026–2027', startDate: '2026-04-01', endDate: '2027-03-31', boards: [] };
const bank = { id: 'bank-1', bankName: 'School Current Account', branchName: 'Surat', branchAddress: 'Surat, Gujarat',
  accountHolderName: 'Sample School', accountType: 1, maskedAccountNumber: '********8318', purpose: 'School receipts and payments',
  ifscCode: 'SBIN*******', maskedUpiId: '***@bank', isActive: true, concurrencyStamp: 'v1', version: 1, canDelete: false, isUsedInDownstream: true };
const movement = (fields: Partial<BankActivityRow> & Pick<BankActivityRow, 'key' | 'source' | 'reference'>): BankActivityRow => ({
  sourceId: 'source-1', counterparty: 'Synthetic Parent', categoryName: 'Tuition fees', paymentMethod: 6,
  occurredAt: '2026-10-23T10:00:00+05:30', incoming: 0, outgoing: 0, pendingAmount: 0,
  recognitionStatus: 0, bankConfirmationStatus: 0, canOpenSource: true, ...fields,
});
const rows = [
  movement({ key: 'collection:1', source: 'collection', reference: 'FEE-2026-0101', incoming: 12000.5 }),
  movement({ key: 'expense:1', source: 'expense', reference: 'EXP-2026-0021', counterparty: 'Sample stationery supplier', categoryName: 'Supplies', paymentMethod: 3, outgoing: 2500.25 }),
  movement({ key: 'cash-credit:1', source: 'cash-deposit', reference: 'DEP-2026-0042', cashSourceId: 'cash-1', categoryName: 'Multiple categories', paymentMethod: 0,
    incoming: 8000, bankConfirmationStatus: 1, depositId: 'deposit-1', depositAmount: 10000, creditedAmount: 8000, inTransitAmount: 2000,
    depositDate: '2026-10-21T10:00:00+05:30', bankCreditAt: '2026-10-23T10:00:00+05:30' }),
  movement({ key: 'pending:1', source: 'collection', reference: 'CHQ-2026-0045', paymentMethod: 1, pendingAmount: 3500, recognitionStatus: 1 }),
  movement({ key: 'refund-return:1', source: 'refund', reference: 'REF-2026-0008', paymentMethod: 3, incoming: 500, recognitionStatus: 2, correctsKey: 'refund:1', categoryName: 'Student refunds' }),
];
const totals = (items: BankActivityRow[]) => ({ incoming: items.reduce((n, r) => n + r.incoming, 0), outgoing: items.reduce((n, r) => n + r.outgoing, 0),
  net: items.reduce((n, r) => n + r.incoming - r.outgoing, 0), pendingIncoming: items.reduce((n, r) => n + r.pendingAmount, 0),
  inTransit: items.reduce((n, r) => n + (r.inTransitAmount || 0), 0) });
function activity(params: any, deposits = false): BankActivityPage {
  let selected = rows.filter((r) => (!deposits || r.source === 'cash-deposit') &&
    (!params.search || `${r.reference} ${r.counterparty}`.toLowerCase().includes(String(params.search).toLowerCase())) &&
    (!params.source || r.source === params.source) && (params.paymentMethod == null || r.paymentMethod === Number(params.paymentMethod)) &&
    (params.status == null || r.recognitionStatus === Number(params.status)) &&
    (!params.direction || (params.direction === 'incoming'
      ? r.incoming > 0 || r.pendingAmount > 0 || (r.inTransitAmount || 0) > 0
      : r.outgoing > 0)));
  const filters = JSON.parse(params.filters || '[]');
  selected = selected.filter((r) => filters.every((f: any) => {
    const actual = (r as any)[f.column];
    return f.type === 'equals' ? String(actual) === String(f.value) : String(actual || '').toLowerCase().includes(String(f.value).toLowerCase());
  }));
  const readonly = new URLSearchParams(window.location.search).has('readonly');
  const page = Number(params.page || 1), pageSize = Number(params.pageSize || 25);
  return { account: bank, academicYearId: 'year', academicYearName: period.name, currency: 'INR',
    from: params.from || '2026-04-01T00:00:00+05:30', toExclusive: params.toExclusive || '2026-10-29T00:00:00+05:30', generatedAt: new Date().toISOString(),
    coverage: { income: true, expense: true, cash: true, scopeLimited: true, message: 'Visible recorded activity for your authorized scope. This is not a complete bank statement.' },
    capabilities: { canAddIncome: !readonly, canAddExpense: !readonly, canDepositCash: !readonly }, summary: totals(selected),
    methodBreakdown: Array.from(new Set(selected.map((r) => r.paymentMethod))).map((paymentMethod) => ({ paymentMethod, ...totals(selected.filter((r) => r.paymentMethod === paymentMethod)) })),
    categories: [{ id: 'tuition', label: 'Tuition fees' }, { id: 'supplies', label: 'Supplies' }],
    items: selected.slice((page - 1) * pageSize, page * pageSize), totalCount: selected.length, page, pageSize };
}
export const api = createApi({ reducerPath: 'api', tagTypes, endpoints: () => ({}), baseQuery: async (args: any) => {
  const { url, params = {}, body, method } = args;
  await new Promise((resolve) => setTimeout(resolve, 120));
  if (new URLSearchParams(window.location.search).has('fixtureError') && /\/activity|\/deposits/.test(url))
    return { error: { status: 500, data: { detail: 'Synthetic unavailable activity.' } } };
  if (url === '/bank-accounts') return { data: { items: [bank], totalCount: 1, currentPage: 1, totalPages: 1, pageSize: 10 } };
  if (url.endsWith('/versions')) return { data: { items: [], totalCount: 0 } };
  if (url.endsWith('/activity/export')) return { data: new Blob(['Synthetic export verification'], { type: 'application/pdf' }) };
  if (url.endsWith('/activity')) return { data: activity(params) };
  if (url.endsWith('/deposits')) return { data: activity(params, true) };
  if (url.includes('/activity/')) {
    const row = rows.find((r) => r.key === decodeURIComponent(url.split('/activity/')[1])) || rows[0];
    return { data: { ...row, notes: 'Synthetic evidence for layout verification.', allocations: [{ category: row.categoryName, amount: row.incoming || row.outgoing || row.pendingAmount }],
      credits: row.source === 'cash-deposit' ? [{ amount: 8000, date: row.bankCreditAt, reference: 'STMT-0042' }] : [], canDownloadEvidence: false } };
  }
  if (/\/bank-accounts\//.test(url)) return { data: bank };
  if (url === '/finance-routing-options') return { data: { incomeCategories: [{ id: 'tuition', label: 'Tuition fees' }], expenseCategories: [{ id: 'supplies', label: 'Supplies' }], bankAccounts: [{ id: bank.id, label: `${bank.bankName} • 8318` }] } };
  if (url.endsWith('/options')) return { data: { bankAccounts: [{ id: bank.id, label: `${bank.bankName} • 8318` }], cashSources: [{ id: 'cash-1', label: 'Cash receipt', remainingAmount: 5329, concurrencyStamp: 'v1' }] } };
  if (url === '/finance/cash-management') return { data: { items: [], totalCount: 0, availableCash: 5329,
    yearSummary: { collected: 10000, spent: 4671, deposited: 0, remaining: 5329 }, page: 1, pageSize: 20 } };
  if (url === '/finance/cash-management/cash-1') return { data: { id: 'cash-1', sourceId: 'receipt-1', reference: 'Cash receipt', payerName: 'Synthetic Parent', amount: 10000,
    spentAmount: 2000, depositedAmount: 8000, inTransitAmount: 0, remainingAmount: 0, status: 1, collectedAt: rows[0].occurredAt, deposits: [], expenses: [] } };
  if (url === '/accounts/register') return { data: { items: [], totalCount: 0, categories: [] } };
  if (method === 'POST' && (url === '/incomes' || url === '/expenses' || url.endsWith('/bulk-deposit'))) return { data: { amount: body?.expectedAmount, sourceCount: 1 } };
  return { data: { items: [], totalCount: 0 } };
} });
