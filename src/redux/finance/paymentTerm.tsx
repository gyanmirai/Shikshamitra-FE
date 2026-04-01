import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';
import { paymentTermType } from 'src/redux/tagTypes';

import financeData from '../../../financeData.json';

const isDev = process.env.NODE_ENV === 'development';

export const PaymentTermApi = createApi({
  reducerPath: 'PaymentTermApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/paymentTerms') {
          return { data: financeData.paymentTerms };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: [paymentTermType.paymentTerm],
  endpoints: (builder) => ({
    getPaymentTerm: builder.query({
      query: () => ({
        url: '/paymentTerms',
        method: 'GET',
      }),
      providesTags: [paymentTermType.paymentTerm],
    }),
    deletePaymentTerm: builder.mutation({
      query: (id) => ({
        url: `/paymentTerms/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [paymentTermType.paymentTerm],
    }),
  }),
});

export const { useGetPaymentTermQuery, useDeletePaymentTermMutation } = PaymentTermApi;
