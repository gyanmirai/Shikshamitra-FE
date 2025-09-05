import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import budgetData from '../../../budgetData.json'; // <-- mock JSON

const isDev = process.env.NODE_ENV === 'development';

export const budgetSubCategoryApi = createApi({
  reducerPath: 'BudgetSubCategoryApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/budgetSubCategoryData') {
          return { data: budgetData.budgetSubCategoryData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['BudgetSubCategory'],
  endpoints: (builder) => ({
    getBudgetSubCategoryData: builder.query({
      query: () => ({
        url: '/budgetSubCategoryData',
        method: 'GET',
      }),
      providesTags: ['BudgetSubCategory'],
    }),
  }),
});

export const { useGetBudgetSubCategoryDataQuery } = budgetSubCategoryApi;
