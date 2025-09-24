import { financeModuleApi } from '../financeModuleApi';

export const feeRefundApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeeRefund: builder.query({
      query: () => ({
        url: '/feeRefundData',
        method: 'GET',
      }),
      providesTags: ['FeeRefund'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetFeeRefundQuery } = feeRefundApi;
