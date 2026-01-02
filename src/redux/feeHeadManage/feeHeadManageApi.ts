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
      query: (academicYearId: string) => ({
        url: `/v1/finance/fee-heads?academicYearId=${academicYearId}`,
        method: 'GET',
      }),
      providesTags: ['FeeHead'],
    }),
    addFeeHead: builder.mutation({
      query: (body) => ({
        url: `/v1/finance/fee-heads`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FeeHead'],
    }),
    updateFeeHead: builder.mutation({
      query: ({ feeHeadId, body }) => ({
        url: `/v1/finance/fee-heads/${feeHeadId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['FeeHead'],
    }),
    deleteFeeHead: builder.mutation({
      query: (feeHeadId: string) => ({
        url: `/v1/finance/fee-heads/${feeHeadId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FeeHead'],
    }),
    patchFeeHead: builder.mutation({
      query: ({ feeHeadId, body }) => ({
        url: `/v1/finance/fee-heads/${feeHeadId}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['FeeHead'],
    }),
  }),
});

export const {
  useGetFeeHeadsQuery,
  useAddFeeHeadMutation,
  useUpdateFeeHeadMutation,
  useDeleteFeeHeadMutation,
  usePatchFeeHeadMutation,
} = FeeHeadManagementApi;
