import { paymentTermType } from 'src/redux/tagTypes';

import { api } from '../service';

export const PaymentTermApi = api.injectEndpoints({
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
