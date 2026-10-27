import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from './financeModuleApi';

export type CashRow = {
  id: string;
  sourceId: string;
  reference: string;
  payerName: string;
  amount: number;
  spentAmount: number;
  depositedAmount: number;
  inTransitAmount: number;
  remainingAmount: number;
  status: 0 | 1;
  bankAccountId: string | null;
  bankLabel: string | null;
  collectedAt: string;
  approvedAt: string | null;
  creatorId: string | null;
  concurrencyStamp: string;
  canApprove: boolean;
  canDeposit: boolean;
};
export type CashDeposit = {
  id: string;
  amount: number;
  creditedAmount: number;
  status: 0 | 1;
  reference: string;
  depositDate: string;
  creditDate: string | null;
  createdBy: string;
  canConfirm: boolean;
};
export type CashExpense = { id: string; name: string; amount: number; paymentDate: string };
export type CashDetail = CashRow & {
  notes?: string;
  approvedBy?: string;
  studentId?: string;
  financeFeeAccountId?: string;
  deposits: CashDeposit[];
  expenses: CashExpense[];
};
export type CashPage = {
  items: CashRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  statusCounts: { all: number; pending: number; approved: number };
  summary: {
    collected: number;
    pendingApproval: number;
    approved: number;
    spent: number;
    deposited: number;
    inTransit: number;
    remaining: number;
  };
};
export type CashOptions = {
  bankAccounts: { id: string; label: string }[];
  cashSources: { id: string; label: string; remainingAmount: number; concurrencyStamp: string }[];
};
type Command = {
  academicYearId: string;
  idempotencyKey: string;
  concurrencyStamp: string;
  notes?: string;
};
const changedTags = [
  financeModuleType.cashManagement,
  financeModuleType.incomeTracking,
  financeModuleType.expenseDetails,
  financeModuleType.feeCollection,
];
export const cashManagementApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getCashManagement: builder.query<
      CashPage,
      {
        academicYearId: string;
        page: number;
        pageSize: number;
        status?: 0 | 1;
        search?: string;
        filters?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
      }
    >({
      query: (params) => ({ url: '/finance/cash-management', params }),
      providesTags: [financeModuleType.cashManagement],
    }),
    getCashDetail: builder.query<CashDetail, { id: string; academicYearId: string }>({
      query: ({ id, ...params }) => ({ url: `/finance/cash-management/${id}`, params }),
      providesTags: [financeModuleType.cashManagement],
    }),
    getCashOptions: builder.query<
      CashOptions,
      { academicYearId: string; operation: 'approve' | 'expense' | 'deposit' }
    >({
      query: (params) => ({ url: '/finance/cash-management/options', params }),
      providesTags: [financeModuleType.cashManagement, financeModuleType.bankAccounts],
    }),
    approveCash: builder.mutation<
      CashDetail,
      { id: string; body: Command & { bankAccountId: string; countedAmount: number } }
    >({
      query: ({ id, body }) => ({
        url: `/finance/cash-management/${id}/approve`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_, error) => (error ? [] : changedTags),
    }),
    depositCash: builder.mutation<
      CashDetail,
      { id: string; body: Command & { amount: number; depositDate: string; reference: string } }
    >({
      query: ({ id, body }) => ({
        url: `/finance/cash-management/${id}/deposits`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_, error) => (error ? [] : changedTags),
    }),
    confirmCashDeposit: builder.mutation<
      CashDetail,
      {
        id: string;
        depositId: string;
        body: Command & { amount: number; creditDate: string; reference: string };
      }
    >({
      query: ({ id, depositId, body }) => ({
        url: `/finance/cash-management/${id}/deposits/${depositId}/confirm`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_, error) => (error ? [] : changedTags),
    }),
  }),
});
export const {
  useGetCashManagementQuery,
  useGetCashDetailQuery,
  useGetCashOptionsQuery,
  useApproveCashMutation,
  useDepositCashMutation,
  useConfirmCashDepositMutation,
} = cashManagementApi;
