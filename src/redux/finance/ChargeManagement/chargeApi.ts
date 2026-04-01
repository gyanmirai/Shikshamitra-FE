import { financeModuleApi } from '../financeModuleApi';
import { financeModuleType } from 'src/redux/tagTypes';


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
        data: body,
        params: { academicYearId },
      }),
      invalidatesTags: [financeModuleType.charges],
    }),
    updateCharge: builder.mutation({
      query: ({ id, body }) => ({
        url: `/charges/${id}`,
        method: 'PUT',
        data: body,
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
        data: body,
      }),
      invalidatesTags: [financeModuleType.charges],
    }),
    rejectCharge: builder.mutation({
      query: ({ id, body }) => ({
        url: `/charges/${id}/reject`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: [financeModuleType.charges],
    }),
    getChargeById: builder.query({
      query: (id) => ({
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
