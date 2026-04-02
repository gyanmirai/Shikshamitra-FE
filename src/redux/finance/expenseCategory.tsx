import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from './financeModuleApi';

export const expenseCategoryApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getExpenseCategory: builder.query({
      query: ({ academicYearId }: { academicYearId: string }) => ({
        url: '/expense-categories',
        method: 'GET',
        params: {
          academicYearId,
        },
      }),
      providesTags: [financeModuleType.expenseCategory],
    }),

    postExpenseCategory: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/expense-categories',
        method: 'POST',
        body,
        params: {
          academicYearId,
        },
      }),
      invalidatesTags: [financeModuleType.expenseCategory],
    }),

    putExpenseCategory: builder.mutation({
      query: ({ expenseCategoryId, body }) => ({
        url: `/expense-categories/${expenseCategoryId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [financeModuleType.expenseCategory],
    }),

    deleteExpenseCategory: builder.mutation({
      query: (expenseCategoryId: string) => ({
        url: `/expense-categories/${expenseCategoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [financeModuleType.expenseCategory],
    }),

    getBudgetOptions: builder.query({
      query: () => ({ url: '/expenseOptions', method: 'GET' }),
      providesTags: [financeModuleType.expenseCategory],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetExpenseCategoryQuery,
  usePostExpenseCategoryMutation,
  usePutExpenseCategoryMutation,
  useDeleteExpenseCategoryMutation,
  useGetBudgetOptionsQuery,
} = expenseCategoryApi;
