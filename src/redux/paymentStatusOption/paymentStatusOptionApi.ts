import { api } from 'src/redux/service';
import { paymentStatusOptionType } from 'src/redux/tagTypes';

export const paymentStatusOptionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getpaymentOption: builder.query({
      query: () => ({ url: '/app/payment-status-option', redirect: 'follow' }),
      providesTags: [paymentStatusOptionType.paymentStatusOption],
    }),
    getpaymentOptionById: builder.query({
      query: (id) => ({ url: `/app/payment-status-option/${id}`, redirect: 'follow' }),
      providesTags: [paymentStatusOptionType.paymentStatusOption],
    }),
    addpaymentOption: builder.mutation({
      query: (body) => ({
        url: '/app/payment-status-option',
        method: 'POST',
        body,
      }),
      invalidatesTags: [paymentStatusOptionType.paymentStatusOption],
    }),
    updatepaymentOption: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/payment-status-option/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [paymentStatusOptionType.paymentStatusOption],
    }),
    deletepaymentOption: builder.mutation({
      query: (id) => ({
        url: `/app/payment-status-option/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [paymentStatusOptionType.paymentStatusOption],
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
