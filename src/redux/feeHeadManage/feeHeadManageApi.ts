import { financeModuleApi } from '../finance/financeModuleApi';
import { financeModuleType } from 'src/redux/tagTypes';


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
        data: body,
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
        data: body,
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
        data: body,
      }),
      invalidatesTags: [financeModuleType.feeHead],
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
