import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import receiptData from '../../../invoiceAndReceipt.json';

const isDev = process.env.NODE_ENV === 'development';

export const studentReceiptApi = createApi({
  reducerPath: 'StudentReceiptApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/studentReceiptData') {
          return { data: receiptData.receiptData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['StudentReceipt'],
  endpoints: (builder) => ({
    getStudentReceiptData: builder.query({
      query: () => ({
        url: '/studentReceiptData',
        method: 'GET',
      }),
      providesTags: ['StudentReceipt'],
    }),
  }),
});

export const { useGetStudentReceiptDataQuery } = studentReceiptApi;
