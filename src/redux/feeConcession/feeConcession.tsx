import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import concessionData from '../../../concession.json';

const isDev = process.env.NODE_ENV === 'development';

export const ConcessionApi = createApi({
  reducerPath: 'ConcessionApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/concessionStudentInfo') {
          return { data: concessionData.concessionStudentInfo };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['Concession'],
  endpoints: (builder) => ({
    getConcessions: builder.query({
      query: () => ({
        url: '/concessionStudentInfo',
        method: 'GET',
      }),
      providesTags: ['Concession'],
    }),
  }),
});

export const { useGetConcessionsQuery } = ConcessionApi;
