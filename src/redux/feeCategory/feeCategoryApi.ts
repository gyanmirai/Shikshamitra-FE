import { financeModuleApi } from '../finance/financeModuleApi';
import { financeModuleType } from 'src/redux/tagTypes';


export const feeCategoryApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get fee category list
    getFeeCategories: builder.query({
      query: (params) => ({
        url: '/fee-categories',
        method: 'GET',
        params,
      }),
      providesTags: [financeModuleType.feeCategory],
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
      invalidatesTags: [financeModuleType.feeCategory],
    }),

    // Update fee category
    updateFeeCategory: builder.mutation({
      query: ({ feeCategoryId, body }) => ({
        url: `/fee-categories/${feeCategoryId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [financeModuleType.feeCategory],
    }),

    // Delete fee category
    deleteFeeCategory: builder.mutation({
      query: ({ id }) => ({
        url: `/fee-categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [financeModuleType.feeCategory],
    }),
  }),
});

export const {
  useGetFeeCategoriesQuery,
  useAddFeeCategoryMutation,
  useUpdateFeeCategoryMutation,
  useDeleteFeeCategoryMutation,
} = feeCategoryApi;
