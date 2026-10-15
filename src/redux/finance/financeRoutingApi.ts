import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from './financeModuleApi';
import { bankAccountOptionLabel } from './bankAccountOptionLabel';

import type { BankAccountOptionResponse } from './bankAccountOptionLabel';

export interface RoutingOption {
  id: string;
  label: string;
}
export type RoutingOperation =
  | 'income-entry'
  | 'expense-entry'
  | 'collection'
  | 'refund'
  | 'refund-policy'
  | 'collection-policy'
  | 'fee-head'
  | 'charge-category';
export interface FinanceRoutingOptions {
  incomeCategories: RoutingOption[];
  expenseCategories: RoutingOption[];
  bankAccounts: RoutingOption[];
  items: { id: string; name: string }[];
}
interface FinanceRoutingOptionsResponse extends Omit<
  FinanceRoutingOptions,
  'items' | 'bankAccounts'
> {
  bankAccounts: BankAccountOptionResponse[];
}
export const financeRoutingApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getFinanceRoutingOptions: builder.query<
      FinanceRoutingOptions,
      { academicYearId: string; operation: RoutingOperation }
    >({
      query: (params) => ({ url: '/finance-routing-options', params }),
      transformResponse: (data: FinanceRoutingOptionsResponse) => ({
        ...data,
        bankAccounts: data.bankAccounts.map((account) => ({
          id: account.id,
          label: bankAccountOptionLabel(account),
        })),
        items: data.incomeCategories.map((x) => ({ id: x.id, name: x.label })),
      }),
      providesTags: [
        financeModuleType.incomeCategoryData,
        financeModuleType.expenseCategory,
        financeModuleType.bankAccount,
      ],
    }),
  }),
});
export const { useGetFinanceRoutingOptionsQuery } = financeRoutingApi;
