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
      }: {
        academicYearId: string;
        headType?: string;
        page?: number;
        pageSize?: number;
        search?: string;
      }) => ({
        url: '/account-heads',
        method: 'GET',
        params: {
          academicYearId,
          headType,
          page,
          pageSize,
          search: search || undefined,
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
      query: ({ academicYearId, headType }: { academicYearId?: string; headType?: string }) => ({
        url: '/account-heads/options',
        method: 'GET',
        params: { academicYearId, headType },
      }),
      providesTags: [financeModuleType.accountHead],
    }),

    getAccountHeadBalances: builder.query({
      query: (academicYearId: string) => ({
        url: '/account-heads/balances',
        method: 'GET',
        params: { academicYearId },
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
      query: (body) => ({
        url: '/account-heads',
        method: 'POST',
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
  useGetAccountHeadBalancesQuery,
  useGetPayableAgeingQuery,
} = accountHeadApi;
