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
        if (url === '/expenseListData') {
          return { data: expenseDetailsData.expenseListData };
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
        url: '/finance/expenses',
        method: 'GET',
      }),
      providesTags: ['ExpenseDetails'],
    }),
    getExpenseById: builder.query({
      query: (expenseId: string) => ({
        url: `/finance/expenses/${expenseId}`,
        method: 'GET',
      }),
      providesTags: ['ExpenseDetails'],
    }),
    postExpenseDetails: builder.mutation({
      query: (body) => ({
        url: '/finance/expenses',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ExpenseDetails'],
    }),
    putExpenseDetails: builder.mutation({
      query: ({ expenseId, body }) => ({
        url: `/finance/expenses/${expenseId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['ExpenseDetails'],
    }),
    deleteExpenseDetails: builder.mutation({
      query: (expenseId: string) => ({
        url: `/finance/expenses/${expenseId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ExpenseDetails'],
    }),
    getExpenseList: builder.query({
      query: () => ({
        url: '/expenseListData',
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
  usePostExpenseDetailsMutation,
  usePutExpenseDetailsMutation,
  useDeleteExpenseDetailsMutation,
  useGetExpenseOptionsQuery,
  useGetExpenseByIdQuery,
  useGetExpenseListQuery,
  useGetPaymentMethodsConfigQuery,
} = expenseDetailsApi;
