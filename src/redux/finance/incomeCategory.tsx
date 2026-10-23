import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from './financeModuleApi';

export const incomeCategoryApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getIncomeCategories: builder.query({
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
        url: '/income-categories',
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
      providesTags: [financeModuleType.incomeCategoryData],
    }),

    postIncomeCategory: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/income-categories',
        method: 'POST',
        body,
        params: {
          academicYearId,
        },
      }),
      invalidatesTags: [financeModuleType.incomeCategoryData],
    }),

    putIncomeCategory: builder.mutation({
      query: ({ incomeCategoryId, body }) => ({
        url: `/income-categories/${incomeCategoryId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [financeModuleType.incomeCategoryData],
    }),

    deleteIncomeCategory: builder.mutation({
      query: (incomeCategoryId: string) => ({
        url: `/income-categories/${incomeCategoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [financeModuleType.incomeCategoryData],
    }),
    patchIncomeCategoryStatus: builder.mutation({
      query: ({ id, body }) => ({
        url: `/income-categories/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [financeModuleType.incomeCategoryData],
    }),
    getIncomeCategoryVersions: builder.query({
      query: (id: string) => ({ url: `/income-categories/${id}/versions`, method: 'GET' }),
      providesTags: [financeModuleType.incomeCategoryData],
    }),
    getBudgetOptions: builder.query({
      query: () => ({ url: '/incomeOptions', method: 'GET' }),
      providesTags: [financeModuleType.incomeCategoryData],
    }),
  }),
  overrideExisting: false,
});
export const {
  useGetIncomeCategoriesQuery,
  usePostIncomeCategoryMutation,
  usePutIncomeCategoryMutation,
  useDeleteIncomeCategoryMutation,
  usePatchIncomeCategoryStatusMutation,
  useGetIncomeCategoryVersionsQuery,
  useGetBudgetOptionsQuery,
} = incomeCategoryApi;
