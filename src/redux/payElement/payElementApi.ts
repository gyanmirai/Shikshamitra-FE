import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const payElementApi = createApi({
  reducerPath: 'payElementApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['PayElement'],
  endpoints: (builder) => ({
    getPayElements: builder.query({
      query: () => ({ url: '/app/pay-element' }),
      providesTags: ['PayElement'],
    }),
    addPayElement: builder.mutation({
      query: (body) => ({
        url: '/app/pay-element',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['PayElement'],
    }),
    updatePayElement: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/pay-element/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['PayElement'],
    }),
    deletePayElement: builder.mutation({
      query: (id) => ({
        url: `/app/pay-element/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PayElement'],
    }),
  }),
});

export const {
  useAddPayElementMutation,
  useDeletePayElementMutation,
  useUpdatePayElementMutation,
  useGetPayElementsQuery,
} = payElementApi;
