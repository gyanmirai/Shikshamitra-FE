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
      providesTags: ['expense-category'],
    }),

    postExpenseCategory: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/expense-categories',
        method: 'POST',
        data: body,
        params: {
          academicYearId,
        },
      }),
      invalidatesTags: ['expense-category'],
    }),

    putExpenseCategory: builder.mutation({
      query: ({ expenseCategoryId, body }) => ({
        url: `/expense-categories/${expenseCategoryId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['expense-category'],
    }),

    deleteExpenseCategory: builder.mutation({
      query: (expenseCategoryId: string) => ({
        url: `/expense-categories/${expenseCategoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['expense-category'],
    }),

    getBudgetOptions: builder.query({
      query: () => ({ url: '/expenseOptions', method: 'GET' }),
      providesTags: ['expense-category'],
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
