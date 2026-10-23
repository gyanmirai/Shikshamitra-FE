import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from './financeModuleApi';

export const expenseCategoryApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getExpenseCategory: builder.query({
      query: ({
        academicYearId,
        page,
        pageSize,
        search,
        filters,
        includeInactive = true,
      }: {
        academicYearId: string;
        page?: number;
        pageSize?: number;
        search?: string;
        filters?: string;
        includeInactive?: boolean;
      }) => ({
        url: '/expense-categories',
        method: 'GET',
        params: {
          academicYearId,
          page,
          pageSize,
          search: search || undefined,
          filters,
          includeInactive,
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

    patchExpenseCategoryStatus: builder.mutation({
      query: ({ id, body }) => ({
        url: `/expense-categories/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [financeModuleType.expenseCategory],
    }),
    getExpenseCategoryVersions: builder.query({
      query: (id: string) => ({ url: `/expense-categories/${id}/versions`, method: 'GET' }),
      providesTags: [financeModuleType.expenseCategory],
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
  usePatchExpenseCategoryStatusMutation,
  useGetExpenseCategoryVersionsQuery,
  useGetBudgetOptionsQuery,
} = expenseCategoryApi;
