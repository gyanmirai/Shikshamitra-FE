import { financeModuleType } from 'src/redux/tagTypes';

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
      providesTags: [financeModuleType.feeHead],
    }),

    // Add fee head
    addFeeHead: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: `/fee-heads`,
        method: 'POST',
        body,
        params: {
          academicYearId,
        },
      }),
      invalidatesTags: [financeModuleType.feeHead],
    }),

    // Update fee head
    updateFeeHead: builder.mutation({
      query: ({ id, body }) => ({
        url: `/fee-heads/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [financeModuleType.feeHead],
    }),

    // Delete fee head
    deleteFeeHead: builder.mutation({
      query: ({ id }) => ({
        url: `/fee-heads/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [financeModuleType.feeHead],
    }),
    patchFeeHead: builder.mutation({
      query: ({ feeHeadId, body }) => ({
        url: `/fee-heads/${feeHeadId}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [financeModuleType.feeHead],
    }),
  }),
});

export const {
  useGetFeeHeadsQuery,
  useLazyGetFeeHeadsQuery,
  useAddFeeHeadMutation,
  useUpdateFeeHeadMutation,
  useDeleteFeeHeadMutation,
  usePatchFeeHeadMutation,
} = FeeHeadManagementApi;
