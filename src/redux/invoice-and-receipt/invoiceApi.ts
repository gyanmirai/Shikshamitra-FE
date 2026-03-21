import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import invoiceData from '../../../invoiceAndReceipt.json';

const isDev = process.env.NODE_ENV === 'development';

export const invoiceApi = createApi({
  reducerPath: 'InvoiceApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/invoiceData') {
          return { data: invoiceData.invoiceData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['Invoice'],
  endpoints: (builder) => ({
    getInvoiceData: builder.query({
      query: () => ({
        url: '/invoiceData',
        method: 'GET',
      }),
      providesTags: ['Invoice'],
    }),
  }),
});

export const { useGetInvoiceDataQuery } = invoiceApi;
