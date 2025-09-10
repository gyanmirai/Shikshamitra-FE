import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const paymentStatusOptionApi = createApi({
  reducerPath: 'paymentStatusOptionApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['paymentStatusOption'],
  endpoints: (builder) => ({
    getpaymentOption: builder.query({
      query: () => ({ url: '/app/payment-status-option', redirect: 'follow' }),
      providesTags: ['paymentStatusOption'],
    }),
    getpaymentOptionById: builder.query({
      query: (id) => ({ url: `/app/payment-status-option/${id}`, redirect: 'follow' }),
      providesTags: ['paymentStatusOption'],
    }),
    addpaymentOption: builder.mutation({
      query: (body) => ({
        url: '/app/payment-status-option',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['paymentStatusOption'],
    }),
    updatepaymentOption: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/payment-status-option/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['paymentStatusOption'],
    }),
    deletepaymentOption: builder.mutation({
      query: (id) => ({
        url: `/app/payment-status-option/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['paymentStatusOption'],
    }),
  }),
});

export const {
  useAddpaymentOptionMutation,
  useDeletepaymentOptionMutation,
  useGetpaymentOptionByIdQuery,
  useGetpaymentOptionQuery,
  useLazyGetpaymentOptionByIdQuery,
  useLazyGetpaymentOptionQuery,
  useUpdatepaymentOptionMutation,
} = paymentStatusOptionApi;
