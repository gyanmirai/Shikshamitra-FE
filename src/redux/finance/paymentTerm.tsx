import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import financeData from '../../../financeData.json';

const isDev = process.env.NODE_ENV === 'development';

export const PaymentTermApi = createApi({
  reducerPath: 'PaymentTermApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/paymentTerms') {
          return { data: financeData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['Payment-Term'],
  endpoints: (builder) => ({
    getPaymentTerm: builder.query({
      query: () => ({
        url: '/paymentTerms',
        method: 'GET',
      }),
      providesTags: ['Payment-Term'],
    }),
  }),
});

export const { useGetPaymentTermQuery } = PaymentTermApi;
