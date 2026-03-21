import { financeModuleApi } from '../finance/financeModuleApi';

export const feeCollectionApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get fee collection list (table view)
    getFeeCollectionList: builder.query({
      query: (params) => ({
        url: '/v1/finance/fee-collection',
        method: 'GET',
        params,
      }),
      providesTags: ['FeeCollection'],
    }),

    // Get fee collection details for a student
    getFeeCollectionDetails: builder.query({
      query: (studentFeeId) => ({
        url: `/v1/finance/fee-collection/${studentFeeId}`,
        method: 'GET',
      }),
      providesTags: ['FeeCollection'],
    }),

    // Get student fee details
    getStudentFeeDetails: builder.query({
      query: ({ studentId, academicYearId }) => ({
        url: `/v1/finance/fee-details/${studentId}`,
        method: 'GET',
        params: { academicYearId },
      }),
      providesTags: ['FeeDetails'],
    }),

    // Collect fee with multiple payment methods
    collectFee: builder.mutation({
      query: (body) => ({
        url: '/v1/finance/fee-collections',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['FeeCollection', 'FeeDetails'],
    }),
  }),
});

export const {
  useGetFeeCollectionListQuery,
  useGetFeeCollectionDetailsQuery,
  useGetStudentFeeDetailsQuery,
  useCollectFeeMutation,
} = feeCollectionApi;
