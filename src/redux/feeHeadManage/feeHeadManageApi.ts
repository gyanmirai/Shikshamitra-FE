import { financeModuleApi } from '../finance/financeModuleApi';

export const FeeHeadManagementApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get fee head list
    getFeeHeads: builder.query({
      query: (params) => ({
        url: '/api/v1/finance/fee-heads',
        method: 'GET',
        params,
      }),
      providesTags: ['FeeHead'],
    }),

    // Create fee head
    addFeeHead: builder.mutation({
      query: (body) => ({
        url: '/api/v1/finance/fee-heads',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['FeeHead'],
    }),

    // Update fee head
    updateFeeHead: builder.mutation({
      query: ({ feeHeadId, body }) => ({
        url: `/api/v1/finance/fee-heads/${feeHeadId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['FeeHead'],
    }),

    // Delete fee head
    deleteFeeHead: builder.mutation({
      query: (feeHeadId) => ({
        url: `/api/v1/finance/fee-heads/${feeHeadId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FeeHead'],
    }),

    // Change fee head active status
    updateFeeHeadStatus: builder.mutation({
      query: ({ feeHeadId, body }) => ({
        url: `/api/v1/finance/fee-heads/${feeHeadId}/status`,
        method: 'PATCH',
        data: body,
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
  useUpdateFeeHeadStatusMutation,
} = FeeHeadManagementApi;
