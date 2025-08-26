import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import incomeDetailsData from '../../../financeIncomeData.json'; // your mock JSON

const isDev = process.env.NODE_ENV === 'development';

export const incomeDetailsApi = createApi({
  reducerPath: 'IncomeDetailsApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/detailedIncomeData') {
          return { data: incomeDetailsData.detailedIncomeData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['IncomeDetails'],
  endpoints: (builder) => ({
    getIncomeDetails: builder.query({
      query: () => ({
        url: '/detailedIncomeData',
        method: 'GET',
      }),
      providesTags: ['IncomeDetails'],
    }),
  }),
});

export const { useGetIncomeDetailsQuery } = incomeDetailsApi;
