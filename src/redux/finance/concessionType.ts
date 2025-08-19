import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import financeData from '../../../financeData.json';

const isDev = process.env.NODE_ENV === 'development';

export const ConcessionTypeApi = createApi({
  reducerPath: 'ConcessionTypeApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/concessionTypeSetting') {
          return { data: financeData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['Concession-Type'],
  endpoints: (builder) => ({
    getConcessionType: builder.query({
      query: () => ({
        url: '/concessionTypeSetting',
        method: 'GET',
      }),
      providesTags: ['Concession-Type'],
    }),
  }),
});

export const { useGetConcessionTypeQuery } = ConcessionTypeApi;
