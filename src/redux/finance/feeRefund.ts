import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import financeData from '../../../feeRefundData.json';

const isDev = process.env.NODE_ENV === 'development';

export const FeeRefundApi = createApi({
  reducerPath: 'FeeRefundApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        if (url === '/feeRefundData') {
          return { data: financeData.feeRefundData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['Fee-Refund'],
  endpoints: (builder) => ({
    getFeeRefund: builder.query({
      query: () => ({
        url: '/feeRefundData',
        method: 'GET',
      }),
      providesTags: ['Fee-Refund'],
    }),
  }),
});

export const { useGetFeeRefundQuery } = FeeRefundApi;
