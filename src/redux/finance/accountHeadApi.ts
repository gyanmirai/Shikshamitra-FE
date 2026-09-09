import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from './financeModuleApi';

export const accountHeadApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getAccountHeads: builder.query({
      query: ({
        academicYearId,
        headType,
        page,
        pageSize,
        search,
        includeInactive = true,
      }: {
        academicYearId: string;
        headType?: string;
        page?: number;
        pageSize?: number;
        search?: string;
        includeInactive?: boolean;
      }) => ({
        url: '/account-heads',
        method: 'GET',
        params: {
          academicYearId,
          headType,
          page,
          pageSize,
          search: search || undefined,
          includeInactive,
        },
      }),
      providesTags: [financeModuleType.accountHead],
    }),

    getAccountHeadById: builder.query({
      query: (id: string) => ({
        url: `/account-heads/${id}`,
        method: 'GET',
      }),
      providesTags: [financeModuleType.accountHead],
    }),

    getAccountHeadOptions: builder.query({
      query: ({ academicYearId, headType, categoryType }: {
        academicYearId?: string;
        headType?: string;
        categoryType?: 'Income' | 'Expense';
      }) => ({
        url: categoryType
          ? `/${categoryType.toLowerCase()}-categories/account-head-options`
          : '/account-heads/options',
        method: 'GET',
        params: categoryType ? { academicYearId } : { academicYearId, headType },
      }),
      providesTags: [financeModuleType.accountHead],
    }),

    getPayableAgeing: builder.query({
      query: (academicYearId: string) => ({
        url: '/reports/payable-ageing',
        method: 'GET',
        params: { academicYearId },
      }),
      providesTags: [financeModuleType.accountHead],
    }),

    postAccountHead: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/account-heads',
        method: 'POST',
        params: { academicYearId },
        body,
      }),
      invalidatesTags: [financeModuleType.accountHead],
    }),

    putAccountHead: builder.mutation({
      query: ({ id, body }) => ({
        url: `/account-heads/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [financeModuleType.accountHead],
    }),

    deleteAccountHead: builder.mutation({
      query: (id: string) => ({
        url: `/account-heads/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [financeModuleType.accountHead],
    }),

    patchAccountHeadStatus: builder.mutation({
      query: ({ id, body }) => ({
        url: `/account-heads/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [financeModuleType.accountHead],
    }),
    getAccountHeadVersions: builder.query({
      query: (id: string) => ({ url: `/account-heads/${id}/versions`, method: 'GET' }),
      providesTags: [financeModuleType.accountHead],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAccountHeadsQuery,
  useGetAccountHeadByIdQuery,
  useGetAccountHeadOptionsQuery,
  usePostAccountHeadMutation,
  usePutAccountHeadMutation,
  useDeleteAccountHeadMutation,
  usePatchAccountHeadStatusMutation,
  useGetAccountHeadVersionsQuery,
  useGetPayableAgeingQuery,
} = accountHeadApi;
