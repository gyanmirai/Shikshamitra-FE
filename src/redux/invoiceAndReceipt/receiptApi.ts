import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import receiptData from '../../../invoiceAndReceipt.json';

const isDev = process.env.NODE_ENV === 'development';

export const receiptApi = createApi({
  reducerPath: 'ReceiptApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/receiptData') {
          return { data: receiptData.receiptData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['Receipt'],
  endpoints: (builder) => ({
    getReceiptData: builder.query({
      query: () => ({
        url: '/receiptData',
        method: 'GET',
      }),
      providesTags: ['Receipt'],
    }),
  }),
});

export const { useGetReceiptDataQuery } = receiptApi;
