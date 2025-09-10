import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import expenseDetailsData from '../../../json/finance/expense/expenseTrackingData.json';

const isDev = process.env.NODE_ENV === 'development';

export const expenseDetailsApi = createApi({
  reducerPath: 'ExpenseDetailsApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock routes
        if (url === '/detailedExpenseData') {
          return { data: expenseDetailsData.detailedExpenseData };
        }
        if (url === '/expenseOptions') {
          return {
            data: expenseDetailsData.expenseOptions,
          };
        }
        if (url === '/paymentMethodsConfig') {
          return {
            data: expenseDetailsData.paymentMethodsConfig,
          };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['ExpenseDetails', 'ExpenseOptions', 'paymentMethodsConfig'],
  endpoints: (builder) => ({
    getExpenseDetails: builder.query({
      query: () => ({
        url: '/detailedExpenseData',
        method: 'GET',
      }),
      providesTags: ['ExpenseDetails'],
    }),
    getExpenseOptions: builder.query({
      query: () => ({
        url: '/expenseOptions',
        method: 'GET',
      }),
      providesTags: ['ExpenseOptions'],
    }),
    getPaymentMethodsConfig: builder.query({
      query: () => ({
        url: '/paymentMethodsConfig',
        method: 'GET',
      }),
      providesTags: ['paymentMethodsConfig'],
    }),
  }),
});

export const {
  useGetExpenseDetailsQuery,
  useGetExpenseOptionsQuery,
  useGetPaymentMethodsConfigQuery,
} = expenseDetailsApi;
