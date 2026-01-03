import { financeModuleApi } from '../finance/financeModuleApi';

export const FeeHeadManagementApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get fee head list
    getFeeHeads: builder.query({
      query: (academicYearId: string) => ({
        url: `/v1/finance/fee-heads?academicYearId=${academicYearId}`,
        method: 'GET',
      }),
      providesTags: ['FeeHead'],
    }),
    addFeeHead: builder.mutation({
      query: (body) => ({
        url: `/v1/finance/fee-heads`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FeeHead'],
    }),
    updateFeeHead: builder.mutation({
      query: ({ feeHeadId, body }) => ({
        url: `/v1/finance/fee-heads/${feeHeadId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['FeeHead'],
    }),
    deleteFeeHead: builder.mutation({
      query: (feeHeadId: string) => ({
        url: `/v1/finance/fee-heads/${feeHeadId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FeeHead'],
    }),
    patchFeeHead: builder.mutation({
      query: ({ feeHeadId, body }) => ({
        url: `/v1/finance/fee-heads/${feeHeadId}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['FeeHead'],
    }),
  }),
});

export const {
  useGetFeeHeadsQuery,
  useAddFeeHeadMutation,
  useUpdateFeeHeadMutation,
  useDeleteFeeHeadMutation,
  usePatchFeeHeadMutation,
} = FeeHeadManagementApi;
