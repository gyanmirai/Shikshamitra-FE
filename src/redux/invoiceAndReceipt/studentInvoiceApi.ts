import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import studentInvoiceData from '../../../invoiceAndReceipt.json';

const isDev = process.env.NODE_ENV === 'development';

export const studentInvoiceApi = createApi({
  reducerPath: 'StudentInvoiceApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/studentInvoiceData') {
          return { data: studentInvoiceData.studentInvoiceData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['StudentInvoice'],
  endpoints: (builder) => ({
    getStudentInvoiceData: builder.query({
      query: () => ({
        url: '/studentInvoiceData',
        method: 'GET',
      }),
      providesTags: ['StudentInvoice'],
    }),
  }),
});

export const { useGetStudentInvoiceDataQuery } = studentInvoiceApi;
