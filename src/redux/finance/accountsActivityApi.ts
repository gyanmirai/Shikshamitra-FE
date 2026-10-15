import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from './financeModuleApi';

export type AccountsActivityRow = {
  id: string;
  sourceId: string;
  studentId: string | null;
  studentName: string;
  grNumber?: string;
  classDivision?: string;
  counterparty?: string;
  categoryId?: string;
  categoryName: string;
  bankAccountId?: string;
  bankLabel: string;
  source: 'Collection' | 'Refund' | 'Income' | 'Expense';
  reference: string;
  sourceStatus: string;
  accountingStatus: string;
  amount: number;
  occurredAt: string;
  canOpenSource: boolean;
};

export type AccountsActivityPage = {
  totalCount: number;
  page: number;
  pageSize: number;
  items: AccountsActivityRow[];
  categories?: { id: string; label: string }[];
};

export const accountsActivityApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getAccountsActivityDetail: builder.query<
      AccountsActivityDetail,
      { academicYearId: string; source: string; id: string }
    >({
      query: ({ academicYearId, source, id }) => ({
        url: `/accounts/register/${source}/${id}`,
        params: { academicYearId },
      }),
      providesTags: [
        financeModuleType.incomeTracking,
        financeModuleType.expenseDetails,
        financeModuleType.feeCollection,
        financeModuleType.feeRefund,
      ],
    }),
    createAccountsManualEntry: builder.mutation<
      unknown,
      { academicYearId: string; direction: 'income' | 'expense'; body: AccountsManualEntry }
    >({
      query: ({ academicYearId, direction, body }) => ({
        url: direction === 'income' ? '/incomes' : '/expenses',
        method: 'POST',
        params: { academicYearId },
        body,
      }),
      invalidatesTags: [financeModuleType.incomeTracking, financeModuleType.expenseDetails],
    }),
    getAccountsActivity: builder.query<
      AccountsActivityPage,
      {
        academicYearId: string;
        direction?: 'income' | 'expense';
        source?: string;
        month?: number;
        year?: number;
        categoryId?: string;
        sortBy?: string;
        sortDescending?: boolean;
        search?: string;
        filters?: string;
        page: number;
        pageSize: number;
      }
    >({
      query: (params) => ({ url: '/accounts/register', method: 'GET', params }),
      providesTags: [
        financeModuleType.incomeTracking,
        financeModuleType.expenseDetails,
        financeModuleType.feeCollection,
        financeModuleType.feeRefund,
      ],
    }),
  }),
});

export const {
  useGetAccountsActivityQuery,
  useGetAccountsActivityDetailQuery,
  useCreateAccountsManualEntryMutation,
} = accountsActivityApi;

export interface AccountsManualEntry {
  idempotencyKey: string;
  name: string;
  counterparty: string;
  categoryId: string;
  amount: number;
  paymentMethod: number;
  paymentDate: string;
  bankAccountId?: string;
  paymentReference?: string;
  notes?: string;
  categoryTags: string[];
}
export interface AccountsActivityDetail extends AccountsActivityRow {
  academicYearId: string;
  academicYearName: string;
  grNumber?: string;
  className?: string;
  divisionName?: string;
  counterparty?: string;
  notes?: string;
  originalReceiptNumber?: string;
  refundReason?: string;
  approvalNotes?: string;
  approvedPaymentMethod?: string;
  refundStatus?: string;
  processedAt?: string;
  failureReason?: string;
  allocations: {
    name: string;
    period?: string;
    amount: number;
    coverageStartDate?: string;
    coverageEndDate?: string;
  }[];
  payments: {
    method: string;
    amount: number;
    date: string;
    bankLabel?: string;
    reference?: string;
    evidenceReference?: string;
    status?: string;
  }[];
  categoryAmounts: { category: string; amount: number; bankLabel?: string }[];
}
