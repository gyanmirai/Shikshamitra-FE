import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import feeCollection from '../../../financeFeeCollection.json';

const isDev = process.env.NODE_ENV === 'development';

export const paymentHistoryApi = createApi({
  reducerPath: 'PaymentHistoryApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/paymentHistory') {
          return { data: feeCollection.paymentHistory };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['Payment-History'],
  endpoints: (builder) => ({
    getPaymentHistory: builder.query({
      query: () => ({
        url: '/paymentHistory',
        method: 'GET',
      }),
      providesTags: ['Payment-History'],
    }),
  }),
});

export const { useGetPaymentHistoryQuery } = paymentHistoryApi;
