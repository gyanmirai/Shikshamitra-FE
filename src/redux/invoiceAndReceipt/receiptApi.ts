import { api } from 'src/redux/service';
import { receiptType } from 'src/redux/tagTypes';

export const receiptApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getReceiptData: builder.query({
      query: () => ({
        url: '/receiptData',
        method: 'GET',
      }),
      providesTags: [receiptType.receipt],
    }),
  }),
});

export const { useGetReceiptDataQuery } = receiptApi;
