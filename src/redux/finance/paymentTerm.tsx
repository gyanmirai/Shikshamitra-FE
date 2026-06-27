import { paymentTermType } from 'src/redux/tagTypes';

import { api } from '../service';

export const PaymentTermApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentTerm: builder.query({
      query: (params?: any) => ({
        url: '/paymentTerms',
        method: 'GET',
        params,
      }),
      providesTags: [paymentTermType.paymentTerm],
    }),
    createPaymentTerm: builder.mutation({
      query: (body) => ({
        url: '/paymentTerms',
        method: 'POST',
        body,
      }),
      invalidatesTags: [paymentTermType.paymentTerm],
    }),
    updatePaymentTerm: builder.mutation({
      query: ({ id, body }) => ({
        url: `/paymentTerms/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [paymentTermType.paymentTerm],
    }),
    patchPaymentTerm: builder.mutation({
      query: ({ id, body }) => ({
        url: `/paymentTerms/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [paymentTermType.paymentTerm],
    }),
    deletePaymentTerm: builder.mutation({
      query: (id) => ({
        url: `/paymentTerms/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [paymentTermType.paymentTerm],
    }),
    clonePaymentTerms: builder.mutation({
      query: (body: { sourceAcademicYearId: string; targetAcademicYearId: string }) => ({
        url: '/paymentTerms/clone',
        method: 'POST',
        body,
      }),
      invalidatesTags: [paymentTermType.paymentTerm],
    }),
  }),
});

export const {
  useGetPaymentTermQuery,
  useCreatePaymentTermMutation,
  useUpdatePaymentTermMutation,
  usePatchPaymentTermMutation,
  useDeletePaymentTermMutation,
  useClonePaymentTermsMutation,
} = PaymentTermApi;
