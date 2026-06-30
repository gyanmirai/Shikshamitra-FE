import { financeModuleType } from 'src/redux/tagTypes';

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
      providesTags: [financeModuleType.feeCategory],
    }),

    // Create fee category
    addFeeCategory: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: `/fee-categories`,
        method: 'POST',
        body,
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
        body,
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

    // Patch fee category status
    patchFeeCategoryStatus: builder.mutation({
      query: ({ id, body }) => ({
        url: `/fee-categories/${id}/status`,
        method: 'PATCH',
        body,
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
  usePatchFeeCategoryStatusMutation,
} = feeCategoryApi;
