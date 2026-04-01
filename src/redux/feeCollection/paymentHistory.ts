import { api } from 'src/redux/service';
import { paymentHistoryType } from 'src/redux/tagTypes';

import feeCollection from '../../../financeFeeCollection.json';


export const paymentHistoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentHistory: builder.query({
      query: () => ({
        url: '/paymentHistory',
        method: 'GET',
      }),
      providesTags: [paymentHistoryType.paymentHistory],
    }),
  }),
});

export const { useGetPaymentHistoryQuery } = paymentHistoryApi;
