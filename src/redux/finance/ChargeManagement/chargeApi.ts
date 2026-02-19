import { financeModuleApi } from '../financeModuleApi';

export const chargesApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getCharges: builder.query({
      query: (params) => ({
        url: '/charges',
        method: 'GET',
        params,
      }),
      providesTags: ['Charges'],
    }),
    postCharge: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/charges',
        method: 'POST',
        data: body,
        params: { academicYearId },
      }),
      invalidatesTags: ['Charges'],
    }),
    updateCharge: builder.mutation({
      query: ({ id, body }) => ({
        url: `/charges/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Charges'],
    }),
    deleteCharge: builder.mutation({
      query: (id) => ({
        url: `/charges/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Charges'],
    }),
    approveCharge: builder.mutation({
      query: ({ id, body }) => ({
        url: `/charges/${id}/approve`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Charges'],
    }),
    rejectCharge: builder.mutation({
      query: ({ id, body }) => ({
        url: `/charges/${id}/reject`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Charges'],
    }),
    getChargeById: builder.query({
      query: (id) => ({
        url: `/charges/${id}`,
        method: 'GET',
      }),
      providesTags: ['Charges'],
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
