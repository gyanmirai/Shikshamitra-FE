import { financeModuleApi } from './financeModuleApi';

export const expenseCategoryApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getExpenseCategory: builder.query({
      query: (academicYearId: string) => ({
        url: `/finance/expense-categories/${academicYearId}`,
        method: 'GET',
      }),
      providesTags: ['expense-category'],
    }),

    postExpenseCategory: builder.mutation({
      query: (body: any) => ({
        url: '/finance/expense-categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['expense-category'],
    }),

    putExpenseCategory: builder.mutation({
      query: ({ expenseCategoryId, body }) => ({
        url: `/finance/expense-categories/${expenseCategoryId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['expense-category'],
    }),

    deleteExpenseCategory: builder.mutation({
      query: (expenseCategoryId: string) => ({
        url: `/finance/expense-categories/${expenseCategoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['expense-category'],
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

export const {
  useGetExpenseCategoryQuery,
  usePostExpenseCategoryMutation,
  usePutExpenseCategoryMutation,
  useDeleteExpenseCategoryMutation,
  useGetBudgetOptionsQuery,
} = expenseCategoryApi;
