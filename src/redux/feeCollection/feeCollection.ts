import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from '../finance/financeModuleApi';

export const feeCollectionApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get fee collection list (table view)
    getFeeCollectionList: builder.query({
      query: (params) => ({
        url: '/fee-collections',
        method: 'GET',
        params,
      }),
      providesTags: [financeModuleType.feeCollection],
    }),

    // Get fee collection details for a student
    getFeeCollectionDetails: builder.query({
      query: (studentFeeId) => ({
        url: `/fee-collections/${studentFeeId}`,
        method: 'GET',
      }),
      providesTags: [financeModuleType.feeCollection],
    }),

    // Get student fee details
    getStudentFeeDetails: builder.query({
      query: ({ studentId, academicYearId }) => ({
        url: `/fee-details/${studentId}`,
        method: 'GET',
        params: { academicYearId },
      }),
      providesTags: [financeModuleType.feeDetails],
    }),

    // Collect fee with multiple payment methods
    collectFee: builder.mutation({
      query: (body) => ({
        url: '/fee-collections',
        method: 'POST',
        body,
      }),
      invalidatesTags: [financeModuleType.feeCollection, financeModuleType.feeDetails],
    }),
  }),
});

export const {
  useGetFeeCollectionListQuery,
  useGetFeeCollectionDetailsQuery,
  useGetStudentFeeDetailsQuery,
  useCollectFeeMutation,
} = feeCollectionApi;
