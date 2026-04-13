import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from '../financeModuleApi';

export const feeRefundApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeeRefund: builder.query({
      query: () => ({
        url: '/feeRefundData',
        method: 'GET',
      }),
      providesTags: [financeModuleType.feeRefund],
    }),
  }),
  overrideExisting: false,
});

export const { useGetFeeRefundQuery } = feeRefundApi;
