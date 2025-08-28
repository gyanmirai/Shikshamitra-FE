import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import budgetData from '../../../budgetData.json'; // <-- your mock JSON

const isDev = process.env.NODE_ENV === 'development';

export const budgetApi = createApi({
  reducerPath: 'BudgetApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/budgetData') {
          return { data: budgetData.budgetData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['Budget'],
  endpoints: (builder) => ({
    getBudgetData: builder.query({
      query: () => ({
        url: '/budgetData',
        method: 'GET',
      }),
      providesTags: ['Budget'],
    }),
  }),
});

export const { useGetBudgetDataQuery } = budgetApi;
