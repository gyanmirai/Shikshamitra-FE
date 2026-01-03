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
        url: '/finance/fee-structures',
        method: 'GET',
      }),
      providesTags: ['Finance-Fee-Structure'],
    }),
    createFeeStructure: builder.mutation({
      query: (body) => ({
        url: '/v1/finance/fee-structures',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Finance-Fee-Structure'],
    }),
    updateFeeStructure: builder.mutation({
      query: ({ feeStructureId, body }) => ({
        url: `/v1/finance/fee-structures/${feeStructureId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Finance-Fee-Structure'],
    }),
    patchFeeStructureStatus: builder.mutation({
      query: ({ feeStructureId, body }) => ({
        url: `/v1/finance/fee-structures/${feeStructureId}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Finance-Fee-Structure'],
    }),
  }),
});

export const {
  useGetFinanceFeeStructureQuery,
  useCreateFeeStructureMutation,
  useUpdateFeeStructureMutation,
  usePatchFeeStructureStatusMutation,
} = FinanceFeeStructureApi;
