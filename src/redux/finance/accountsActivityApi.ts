import { financeModuleApi } from './financeModuleApi';

export type AccountsActivityRow = {
  id: string;
  sourceId: string;
  studentId: string;
  studentName: string;
  source: 'Collection' | 'Refund';
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
      query: (params) => ({ url: '/accounts/activity', method: 'GET', params }),
    }),
  }),
});

export const { useGetAccountsActivityQuery } = accountsActivityApi;
