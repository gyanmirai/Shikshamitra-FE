import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import bookManagementData from '../../../issueReturnData.json';

const isDev = process.env.NODE_ENV === 'development';

export const bookIssuedApi = createApi({
  reducerPath: 'BookIssuedApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/bookIssuedData') {
          return { data: bookManagementData.bookIssuedData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['BookIssued'],
  endpoints: (builder) => ({
    getIssuedBooks: builder.query({
      query: () => ({
        url: '/bookIssuedData',
        method: 'GET',
      }),
      providesTags: ['BookIssued'],
    }),
  }),
});

export const { useGetIssuedBooksQuery } = bookIssuedApi;
