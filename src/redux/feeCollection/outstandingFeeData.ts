import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import feeCollection from '../../../financeFeeCollection.json';

const isDev = process.env.NODE_ENV === 'development';
export const outstandingFeeApi = createApi({
  reducerPath: 'OutstandingFeeApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/outstandingFeeData') {
          return { data: feeCollection.outstandingFeeData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['Outstanding-Fee'],
  endpoints: (builder) => ({
    getOutstandingFees: builder.query({
      query: () => ({
        url: '/outstandingFeeData',
        method: 'GET',
      }),
      providesTags: ['Outstanding-Fee'],
    }),
  }),
});

export const { useGetOutstandingFeesQuery } = outstandingFeeApi;
