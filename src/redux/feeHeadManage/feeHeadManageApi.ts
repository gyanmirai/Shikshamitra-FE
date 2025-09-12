import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import feeHeadData from '../../../feeHeadData.json';

const isDev = process.env.NODE_ENV === 'development';

export const FeeHeadManagementApi = createApi({
  reducerPath: 'feeHeadManagementApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/feeHeadData') {
          return { data: feeHeadData.feeHeadData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['FeeHead'],
  endpoints: (builder) => ({
    getFeeHeads: builder.query({
      query: () => ({
        url: '/feeHeadData',
        method: 'GET',
      }),
      providesTags: ['FeeHead'],
    }),
  }),
});

export const { useGetFeeHeadsQuery } = FeeHeadManagementApi;
