import { financeModuleApi } from './financeModuleApi';

export const expenseCategoryApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getExpenseCategory: builder.query({
      query: () => ({
        url: '/expenseCategories',
        method: 'GET',
      }),
      providesTags: ['expense-category'],
    }),

    getBudgetOptions: builder.query({
      query: () => ({
        url: '/budgetOptions',
        method: 'GET',
      }),
      providesTags: ['budget-options'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetExpenseCategoryQuery, useGetBudgetOptionsQuery } = expenseCategoryApi;
