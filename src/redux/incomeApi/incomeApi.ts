import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import incomeData from '../../../financeIncomeData.json';

const isDev = process.env.NODE_ENV === 'development';

export const incomeApi = createApi({
  reducerPath: 'IncomeApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock routes
        if (url === '/incomeData') {
          return { data: incomeData.incomeData };
        }
        if (url === '/paymentMethodsConfig') {
          return { data: incomeData.paymentMethodsConfig };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['Income', 'paymentMethodsConfig'],
  endpoints: (builder) => ({
    getIncomes: builder.query({
      query: () => ({
        url: '/incomeData',
        method: 'GET',
      }),
      providesTags: ['Income'],
    }),
    getIncomePaymentMethodsConfig: builder.query({
      query: () => ({
        url: '/paymentMethodsConfig',
        method: 'GET',
      }),
      providesTags: ['paymentMethodsConfig'],
    }),
  }),
});

export const { useGetIncomesQuery, useGetIncomePaymentMethodsConfigQuery } = incomeApi;
