import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import reservationData from '../../../issueReturnData.json';

const isDev = process.env.NODE_ENV === 'development';

export const bookManagementApi = createApi({
  reducerPath: 'BookManagementApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/bookTitleData') {
          return { data: reservationData.bookTitleData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['BookManagement'],
  endpoints: (builder) => ({
    getBooks: builder.query({
      query: () => ({
        url: '/bookTitleData',
        method: 'GET',
      }),
      providesTags: ['BookManagement'],
    }),
  }),
});

export const { useGetBooksQuery } = bookManagementApi;
