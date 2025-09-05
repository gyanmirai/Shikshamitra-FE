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
        if (url === '/allBoard') {
          return { data: feeCollection.allBoard };
        }
        if (url === '/allMedium') {
          return { data: feeCollection.allMedium };
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
    getAllBoard: builder.query({
      query: () => ({
        url: '/allBoard',
        method: 'GET',
      }),
      providesTags: ['Finance-Fee-Collection'],
    }),
    getAllMedium: builder.query({
      query: () => ({
        url: '/allMedium',
        method: 'GET',
      }),
      providesTags: ['Finance-Fee-Collection'],
    }),
  }),
});

export const { useGetFinanceFeeCollectionQuery, useGetAllBoardQuery, useGetAllMediumQuery } =
  financeFeeCollectionApi;
