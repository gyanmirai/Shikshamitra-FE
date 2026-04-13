import { api } from 'src/redux/service';
import { feeRefundTermsType } from 'src/redux/tagTypes';

export const feeRefundsTermsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRefundTerms: builder.query({
      query: () => ({
        url: '/refundTermsData',
        method: 'GET',
      }),
      providesTags: [feeRefundTermsType.refundTermsData],
    }),
  }),
});

export const { useGetRefundTermsQuery } = feeRefundsTermsApi;
