import type { IBankAccount } from 'src/screens/finance/settings/BankAccManagement/Components/type';

import { incomeType, expenseType, financeModuleType, reconciliationType } from 'src/redux/tagTypes';

import { financeModuleApi } from '../financeModuleApi';

export type BankActivitySource = 'income' | 'expense' | 'collection' | 'refund' | 'cash-deposit';
export type BankActivityQuery = {
  academicYearId: string;
  from?: string;
  toExclusive?: string;
  direction?: 'incoming' | 'outgoing';
  source?: BankActivitySource;
  paymentMethod?: number;
  categoryId?: string;
  status?: number;
  search?: string;
  filters?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  panel?: 'activity' | 'deposits';
};
export type BankActivityRow = {
  key: string;
  source: BankActivitySource;
  sourceId: string;
  cashSourceId?: string | null;
  reference: string;
  counterparty: string;
  categoryName: string;
  paymentMethod: number;
  occurredAt: string;
  originalPaymentAt?: string | null;
  bankCreditAt?: string | null;
  incoming: number;
  outgoing: number;
  pendingAmount: number;
  recognitionStatus: number;
  bankConfirmationStatus: number;
  canOpenSource: boolean;
  paymentReference?: string | null;
  correctsKey?: string | null;
  depositId?: string | null;
  depositAmount?: number | null;
  creditedAmount?: number | null;
  inTransitAmount?: number | null;
  depositDate?: string | null;
  recordedBy?: string | null;
};
export type BankActivityDetail = BankActivityRow & {
  notes?: string | null;
  allocations: { category: string; amount: number }[];
  credits: { amount: number; date: string; reference: string }[];
  canDownloadEvidence: boolean;
  supportingDocumentName?: string | null;
};
export type BankActivitySummary = {
  incoming: number;
  outgoing: number;
  net: number;
  pendingIncoming: number;
  inTransit: number;
};
export type BankActivityPage = {
  account: IBankAccount;
  academicYearId: string;
  academicYearName: string;
  currency: 'INR';
  from: string;
  toExclusive: string;
  generatedAt: string;
  coverage: {
    income: boolean;
    expense: boolean;
    cash: boolean;
    scopeLimited: boolean;
    message: string;
  };
  capabilities: { canAddIncome: boolean; canAddExpense: boolean; canDepositCash: boolean };
  summary: BankActivitySummary;
  methodBreakdown: ({ paymentMethod: number } & BankActivitySummary)[];
  categories: { id: string; label: string }[];
  items: BankActivityRow[];
  totalCount: number;
  page: number;
  pageSize: number;
};
export type BankActivityRequest = { bankAccountId: string; query: BankActivityQuery };
export type BankActivityExportRequest = BankActivityRequest & {
  format: 'excel' | 'pdf';
  columns: { id: string; label: string }[];
};
const activityTags = [
  financeModuleType.bankAccount,
  financeModuleType.incomeTracking,
  financeModuleType.expenseDetails,
  financeModuleType.cashManagement,
  financeModuleType.feeCollection,
  financeModuleType.feeRefund,
  reconciliationType.reconciliation,
  incomeType.income,
  expenseType.expense,
];
export const bankAccountActivityApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getBankAccountActivity: builder.query<BankActivityPage, BankActivityRequest>({
      query: ({ bankAccountId, query }) => ({
        url: `/bank-accounts/${encodeURIComponent(bankAccountId)}/activity`,
        params: query,
      }),
      providesTags: activityTags,
    }),
    getBankAccountDeposits: builder.query<BankActivityPage, BankActivityRequest>({
      query: ({ bankAccountId, query }) => ({
        url: `/bank-accounts/${encodeURIComponent(bankAccountId)}/deposits`,
        params: query,
      }),
      providesTags: activityTags,
    }),
    getBankAccountActivityDetail: builder.query<
      BankActivityDetail,
      { bankAccountId: string; academicYearId: string; movementKey: string }
    >({
      query: ({ bankAccountId, movementKey, academicYearId }) => ({
        url: `/bank-accounts/${encodeURIComponent(bankAccountId)}/activity/${encodeURIComponent(movementKey)}`,
        params: { academicYearId },
      }),
      providesTags: activityTags,
    }),
    exportBankAccountActivity: builder.mutation<Blob, BankActivityExportRequest>({
      query: ({ bankAccountId, ...body }) => ({
        url: `/bank-accounts/${encodeURIComponent(bankAccountId)}/activity/export`,
        method: 'POST',
        body,
        responseHandler: (response) => (response.ok ? response.blob() : response.json()),
      }),
    }),
  }),
  overrideExisting: false,
});
export const {
  useGetBankAccountActivityQuery,
  useGetBankAccountDepositsQuery,
  useGetBankAccountActivityDetailQuery,
  useExportBankAccountActivityMutation,
} = bankAccountActivityApi;
