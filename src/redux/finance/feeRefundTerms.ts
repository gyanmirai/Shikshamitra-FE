import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import financeData from '../../../feeRefundData.json';

const isDev = process.env.NODE_ENV === 'development';

export const feeRefundsTermsApi = createApi({
  reducerPath: 'FeeRefundTermsApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock routes
        if (url === '/refundTermsData') {
          return { data: financeData.refundTermsData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['refund-terms-data'],
  endpoints: (builder) => ({
    getRefundTerms: builder.query({
      query: () => ({
        url: '/refundTermsData',
        method: 'GET',
      }),
      providesTags: ['refund-terms-data'],
    }),
  }),
});

export const { useGetRefundTermsQuery } = feeRefundsTermsApi;
