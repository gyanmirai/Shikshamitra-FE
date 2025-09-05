import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import issueReturnData from '../../../issueReturnData.json';

const isDev = process.env.NODE_ENV === 'development';

export const bookCategoryOptionsApi = createApi({
  reducerPath: 'BookCategoryOptionsApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/bookCategoryData') {
          return { data: issueReturnData.bookCategoryData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['BookCategoryOptions'],
  endpoints: (builder) => ({
    getBookCategoryOptions: builder.query({
      query: () => ({
        url: '/bookCategoryData',
        method: 'GET',
      }),
      providesTags: ['BookCategoryOptions'],
    }),
  }),
});

export const { useGetBookCategoryOptionsQuery } = bookCategoryOptionsApi;
