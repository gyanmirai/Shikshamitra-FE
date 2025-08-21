import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import feeCollection from '../../../financeFeeCollection.json';

const isDev = process.env.NODE_ENV === 'development';
export const feeConcessionApi = createApi({
  reducerPath: 'FeeConcessionApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/feeConcession') {
          return { data: feeCollection.feeConcession };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['Fee-Concession'],
  endpoints: (builder) => ({
    getFeeConcessions: builder.query({
      query: () => ({
        url: '/feeConcession',
        method: 'GET',
      }),
      providesTags: ['Fee-Concession'],
    }),
  }),
});

export const { useGetFeeConcessionsQuery } = feeConcessionApi;
