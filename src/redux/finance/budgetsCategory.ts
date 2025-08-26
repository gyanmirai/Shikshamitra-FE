import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import budgetsCategoryData from '../../json/finance/settings/Budget/budgetsCategoryData.json';

const isDev = process.env.NODE_ENV === 'development';

export const BudgetsCategoryApi = createApi({
  reducerPath: 'BudgetsCategoryApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock routes
        if (url === '/budgetsCategories') {
          return { data: budgetsCategoryData.budgetsCategories };
        }
        if (url === '/budgetsSubCategories') {
          return { data: budgetsCategoryData.budgetsSubCategories };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['Budget-Category', 'Budget-Sub-Category'],
  endpoints: (builder) => ({
    getBudgetCategory: builder.query({
      query: () => ({
        url: '/budgetsCategories',
        method: 'GET',
      }),
      providesTags: ['Budget-Category'],
    }),
    getBudgetSubCategory: builder.query({
      query: () => ({
        url: '/budgetsSubCategories',
        method: 'GET',
      }),
      providesTags: ['Budget-Sub-Category'],
    }),
  }),
});

export const { useGetBudgetCategoryQuery, useGetBudgetSubCategoryQuery } = BudgetsCategoryApi;
