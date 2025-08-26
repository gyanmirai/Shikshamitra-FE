import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import chargesData from '../../../chargesData.json';

const isDev = process.env.NODE_ENV === 'development';

export const chargesApi = createApi({
  reducerPath: 'ChargesApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/chargesData') {
          return { data: chargesData.chargesData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['Charges'],
  endpoints: (builder) => ({
    getCharges: builder.query({
      query: () => ({
        url: '/chargesData',
        method: 'GET',
      }),
      providesTags: ['Charges'],
    }),
  }),
});

export const { useGetChargesQuery } = chargesApi;
