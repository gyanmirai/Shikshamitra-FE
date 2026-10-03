import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from './financeModuleApi';

export type AccountsActivityRow = {
  id: string;
  sourceId: string;
  studentId: string | null;
  studentName: string;
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
};

export const accountsActivityApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getAccountsActivity: builder.query<
      AccountsActivityPage,
      { academicYearId: string; source?: string; search?: string; page: number; pageSize: number }
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

export const { useGetAccountsActivityQuery } = accountsActivityApi;
