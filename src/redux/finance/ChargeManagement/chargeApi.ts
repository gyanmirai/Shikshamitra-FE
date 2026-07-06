import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from '../financeModuleApi';

const unwrapDetail = (response: any) => response?.data ?? response;
const unwrapList = (response: any) => ({
  ...response,
  items: response?.items ?? [],
});

export const chargesApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getCharges: builder.query({
      query: (params) => ({
        url: '/charges',
        method: 'GET',
        params,
      }),
      transformResponse: unwrapList,
      providesTags: [financeModuleType.charges],
    }),
    getChargeLines: builder.query({
      query: (params) => ({
        url: '/charges/lines',
        method: 'GET',
        params,
      }),
      transformResponse: unwrapList,
      providesTags: [financeModuleType.charges],
    }),
    postCharge: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/charges',
        method: 'POST',
        body,
        params: { academicYearId },
      }),
      invalidatesTags: [financeModuleType.charges],
    }),
    updateCharge: builder.mutation({
      query: ({ id, body }) => ({
        url: `/charges/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [financeModuleType.charges],
    }),
    deleteCharge: builder.mutation({
      query: (id) => ({
        url: `/charges/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [financeModuleType.charges],
    }),
    approveCharge: builder.mutation({
      query: ({ id, body }) => ({
        url: `/charges/${id}/approve`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        financeModuleType.charges,
        financeModuleType.accountPosting,
        financeModuleType.draftPosting,
      ],
    }),
    rejectCharge: builder.mutation({
      query: ({ id, body }) => ({
        url: `/charges/${id}/reject`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        financeModuleType.charges,
        financeModuleType.accountPosting,
        financeModuleType.draftPosting,
      ],
    }),
    getChargeById: builder.query({
      query: ({ id }: { id: string }) => ({
        url: `/charges/${id}`,
        method: 'GET',
      }),
      transformResponse: unwrapDetail,
      providesTags: [financeModuleType.charges],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetChargesQuery,
  useGetChargeLinesQuery,
  usePostChargeMutation,
  useUpdateChargeMutation,
  useDeleteChargeMutation,
  useApproveChargeMutation,
  useRejectChargeMutation,
  useGetChargeByIdQuery,
} = chargesApi;
