import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import libraryData from '../../../../issueReturnData.json';

const isDev = process.env.NODE_ENV === 'development';

export const bookConditionOptionsApi = createApi({
  reducerPath: 'BookConditionOptionsApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/bookConditionData') {
          return { data: libraryData.bookConditionData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['BookConditionOptions'],
  endpoints: (builder) => ({
    getBookConditionOptions: builder.query({
      query: () => ({
        url: '/bookConditionData',
        method: 'GET',
      }),
      providesTags: ['BookConditionOptions'],
    }),
  }),
});

export const { useGetBookConditionOptionsQuery } = bookConditionOptionsApi;
