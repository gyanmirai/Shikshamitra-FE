import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import expenseData from '../../../json/finance/expense/expenseTrackingData.json';

const isDev = process.env.NODE_ENV === 'development';

export const expenseApi = createApi({
  reducerPath: 'ExpenseApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/detailedExpenseTableData') {
          return { data: expenseData.detailedExpenseTableData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['Expense'],
  endpoints: (builder) => ({
    getExpenses: builder.query({
      query: () => ({
        url: '/detailedExpenseTableData',
        method: 'GET',
      }),
      providesTags: ['Expense'],
    }),
  }),
});

export const { useGetExpensesQuery } = expenseApi;
