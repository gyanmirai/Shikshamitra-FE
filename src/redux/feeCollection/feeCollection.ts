import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import feeCollection from '../../../financeFeeCollection.json';

const isDev = process.env.NODE_ENV === 'development';

export const financeFeeCollectionApi = createApi({
  reducerPath: 'FinanceFeeCollectionApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/feeCollectionData') {
          return { data: feeCollection.feeCollectionData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['Finance-Fee-Collection'],
  endpoints: (builder) => ({
    getFinanceFeeCollection: builder.query({
      query: () => ({
        url: '/feeCollectionData',
        method: 'GET',
      }),
      providesTags: ['Finance-Fee-Collection'],
    }),
  }),
});

export const { useGetFinanceFeeCollectionQuery } = financeFeeCollectionApi;
