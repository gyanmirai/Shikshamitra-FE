import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import feeCategoryData from '../../../feeCategoryData.json';

const isDev = process.env.NODE_ENV === 'development';

export const feeCategoryApi = createApi({
  reducerPath: 'FeeCategoryApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/feeCategoryData') {
          return { data: feeCategoryData.feeCategoryData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['FeeCategory'],
  endpoints: (builder) => ({
    getFeeCategories: builder.query({
      query: () => ({
        url: '/feeCategoryData',
        method: 'GET',
      }),
      providesTags: ['FeeCategory'],
    }),
  }),
});

export const { useGetFeeCategoriesQuery } = feeCategoryApi;
