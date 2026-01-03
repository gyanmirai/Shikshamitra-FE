import { financeModuleApi } from '../finance/financeModuleApi';

export const feeCategoryApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get fee category list
    getFeeCategories: builder.query({
      query: (params) => ({
        url: '/v1/finance/fee-categories',
        method: 'GET',
        params,
      }),
      providesTags: ['FeeCategory'],
    }),

    // Create fee category
    addFeeCategory: builder.mutation({
      query: (body) => ({
        url: '/v1/finance/fee-categories',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['FeeCategory'],
    }),

    // Update fee category
    updateFeeCategory: builder.mutation({
      query: ({ feeCategoryId, body }) => ({
        url: `/v1/finance/fee-categories/${feeCategoryId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['FeeCategory'],
    }),

    // Delete fee category
    deleteFeeCategory: builder.mutation({
      query: (feeCategoryId) => ({
        url: `/v1/finance/fee-categories/${feeCategoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FeeCategory'],
    }),
  }),
});

export const {
  useGetFeeCategoriesQuery,
  useAddFeeCategoryMutation,
  useUpdateFeeCategoryMutation,
  useDeleteFeeCategoryMutation,
} = feeCategoryApi;
