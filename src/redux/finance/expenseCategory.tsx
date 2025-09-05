import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';
import expenseCategoryData from 'src/json/finance/settings/expense-category/expenseCategoryData.json';

const isDev = process.env.NODE_ENV === 'development';

export const ExpenseCategoryApi = createApi({
  reducerPath: 'ExpenseCategoryApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock routes
        if (url === '/expenseCategories') {
          return { data: expenseCategoryData.expenseCategories };
        }
        if (url === '/budgetOptions') {
          return { data: expenseCategoryData.budgetOptions };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['expense-category', 'budget-options'],
  endpoints: (builder) => ({
    getExpenseCategory: builder.query({
      query: () => ({
        url: '/expenseCategories',
        method: 'GET',
      }),
      providesTags: ['expense-category'],
    }),
    getBudgetOptions: builder.query({
      query: () => ({
        url: '/budgetOptions',
        method: 'GET',
      }),
      providesTags: ['budget-options'],
    }),
  }),
});

export const { useGetExpenseCategoryQuery, useGetBudgetOptionsQuery } = ExpenseCategoryApi;
