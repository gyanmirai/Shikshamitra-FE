import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import incomeData from '../../../financeIncomeData.json'; // your mock JSON

const isDev = process.env.NODE_ENV === 'development';

export const incomeApi = createApi({
  reducerPath: 'IncomeApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/incomeData') {
          return { data: incomeData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['Income'],
  endpoints: (builder) => ({
    getIncomes: builder.query({
      query: () => ({
        url: '/incomeData',
        method: 'GET',
      }),
      providesTags: ['Income'],
    }),
  }),
});

export const { useGetIncomesQuery } = incomeApi;
