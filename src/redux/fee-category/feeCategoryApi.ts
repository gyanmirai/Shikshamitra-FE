import { financeModuleApi } from '../finance/financeModuleApi';

export const feeCategoryApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get fee category list
    getFeeCategories: builder.query({
      query: (params) => ({
        url: '/fee-categories',
        method: 'GET',
        params,
      }),
      providesTags: ['FeeCategory'],
    }),

    // Create fee category
    addFeeCategory: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: `/fee-categories`,
        method: 'POST',
        data: body,
        params: {
          academicYearId,
        },
      }),
      invalidatesTags: ['FeeCategory'],
    }),

    // Update fee category
    updateFeeCategory: builder.mutation({
      query: ({ feeCategoryId, body }) => ({
        url: `/fee-categories/${feeCategoryId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['FeeCategory'],
    }),

    // Delete fee category
    deleteFeeCategory: builder.mutation({
      query: ({ id }) => ({
        url: `/fee-categories/${id}`,
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
