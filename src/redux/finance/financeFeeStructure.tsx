import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import feeStructureData from '../../../financeData.json';

const isDev = process.env.NODE_ENV === 'development';

export const FinanceFeeStructureApi = createApi({
  reducerPath: 'FinanceFeeStructureApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/feeStructure') {
          return { data: feeStructureData.feeStructure };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['Finance-Fee-Structure'],
  endpoints: (builder) => ({
    getFinanceFeeStructure: builder.query({
      query: () => ({
        url: '/feeStructure',
        method: 'GET',
      }),
      providesTags: ['Finance-Fee-Structure'],
    }),
  }),
});

export const { useGetFinanceFeeStructureQuery } = FinanceFeeStructureApi;
