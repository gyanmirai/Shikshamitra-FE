import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import feeCollection from '../../../financeFeeCollection.json';

const isDev = process.env.NODE_ENV === 'development';

export const feeTermsApi = createApi({
  reducerPath: 'FeeTermsApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/terms') {
          return { data: feeCollection.terms };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['Fee-Terms'],
  endpoints: (builder) => ({
    getFeeTerms: builder.query({
      query: () => ({
        url: '/terms',
        method: 'GET',
      }),
      providesTags: ['Fee-Terms'],
    }),
  }),
});

export const { useGetFeeTermsQuery } = feeTermsApi;
