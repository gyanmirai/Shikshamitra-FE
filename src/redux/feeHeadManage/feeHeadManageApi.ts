import { financeModuleApi } from '../finance/financeModuleApi';

export const FeeHeadManagementApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get fee head list
    getFeeHeads: builder.query({
      query: (params) => ({
        url: '/fee-heads',
        method: 'GET',
        params,
      }),
      providesTags: ['FeeHead'],
    }),

    // Add fee head
    addFeeHead: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: `/fee-heads`,
        method: 'POST',
        data: body,
        params: {
          academicYearId,
        },
      }),
      invalidatesTags: ['FeeHead'],
    }),

    // Update fee head
    updateFeeHead: builder.mutation({
      query: ({ id, body }) => ({
        url: `/fee-heads/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['FeeHead'],
    }),

    // Delete fee head
    deleteFeeHead: builder.mutation({
      query: ({ id }) => ({
        url: `/fee-heads/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FeeHead'],
    }),
    patchFeeHead: builder.mutation({
      query: ({ feeHeadId, body }) => ({
        url: `/fee-heads/${feeHeadId}/status`,
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
  usePatchFeeHeadMutation,
} = FeeHeadManagementApi;
