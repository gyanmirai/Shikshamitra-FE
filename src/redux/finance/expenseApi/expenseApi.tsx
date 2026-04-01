import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';
import { expenseType } from 'src/redux/tagTypes';

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
  tagTypes: [expenseType.expense],
  endpoints: (builder) => ({
    getExpenses: builder.query({
      query: () => ({
        url: '/detailedExpenseTableData',
        method: 'GET',
      }),
      providesTags: [expenseType.expense],
    }),
  }),
});

export const { useGetExpensesQuery } = expenseApi;
