import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import bookCategoryData from '../../../bookCategoryData.json';

const isDev = process.env.NODE_ENV === 'development';

export const bookCategoryApi = createApi({
  reducerPath: 'BookCategoryApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/bookCategoryData') {
          return { data: bookCategoryData.bookCategoryData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['BookCategory'],
  endpoints: (builder) => ({
    getBookCategories: builder.query({
      query: () => ({
        url: '/bookCategoryData',
        method: 'GET',
      }),
      providesTags: ['BookCategory'],
    }),
  }),
});

export const { useGetBookCategoriesQuery } = bookCategoryApi;
