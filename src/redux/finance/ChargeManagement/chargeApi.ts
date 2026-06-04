import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from '../financeModuleApi';

export const chargesApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getCharges: builder.query({
      query: (params) => ({
        url: '/charges',
        method: 'GET',
        params,
      }),
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
      invalidatesTags: [financeModuleType.charges],
    }),
    rejectCharge: builder.mutation({
      query: ({ id, body }) => ({
        url: `/charges/${id}/reject`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [financeModuleType.charges],
    }),
    getChargeById: builder.query({
      query: ({ id }: { id: string }) => ({
        url: `/charges/${id}`,
        method: 'GET',
      }),
      providesTags: [financeModuleType.charges],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetChargesQuery,
  usePostChargeMutation,
  useUpdateChargeMutation,
  useDeleteChargeMutation,
  useApproveChargeMutation,
  useRejectChargeMutation,
  useGetChargeByIdQuery,
} = chargesApi;
