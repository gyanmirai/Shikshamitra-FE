import { financeModuleApi } from '../finance/financeModuleApi';
import { financeModuleType } from 'src/redux/tagTypes';


export const feeCollectionApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get fee collection list (table view)
    getFeeCollectionList: builder.query({
      query: (params) => ({
        url: '/v1/finance/fee-collection',
        method: 'GET',
        params,
      }),
      providesTags: [financeModuleType.feeCollection],
    }),

    // Get fee collection details for a student
    getFeeCollectionDetails: builder.query({
      query: (studentFeeId) => ({
        url: `/v1/finance/fee-collection/${studentFeeId}`,
        method: 'GET',
      }),
      providesTags: [financeModuleType.feeCollection],
    }),

    // Get student fee details
    getStudentFeeDetails: builder.query({
      query: ({ studentId, academicYearId }) => ({
        url: `/v1/finance/fee-details/${studentId}`,
        method: 'GET',
        params: { academicYearId },
      }),
      providesTags: [financeModuleType.feeDetails],
    }),

    // Collect fee with multiple payment methods
    collectFee: builder.mutation({
      query: (body) => ({
        url: '/v1/finance/fee-collections',
        method: 'POST',
        data: body,
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
