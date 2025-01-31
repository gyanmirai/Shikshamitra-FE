import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const feeHeadApi = createApi({
  reducerPath: 'feeHeadApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['feeHead'],
  endpoints: (builder) => ({
    getfeeHead: builder.query({
      query: () => ({ url: '/app/fee-head', redirect: 'follow' }),
      providesTags: ['feeHead'],
    }),
    getfeeHeadById: builder.query({
      query: (id) => ({ url: `/app/fee-head/${id}`, redirect: 'follow' }),
      providesTags: ['feeHead'],
    }),
    addfeeHead: builder.mutation({
      query: (body) => ({
        url: '/app/fee-head',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['feeHead'],
    }),
    updatefeeHead: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/fee-head/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['feeHead'],
    }),
    deletefeeHead: builder.mutation({
      query: (id) => ({
        url: `/app/fee-head/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['feeHead'],
    }),
  }),
});

export const {
  useAddfeeHeadMutation,
  useDeletefeeHeadMutation,
  useGetfeeHeadByIdQuery,
  useGetfeeHeadQuery,
  useLazyGetfeeHeadByIdQuery,
  useLazyGetfeeHeadQuery,
  useUpdatefeeHeadMutation,
} = feeHeadApi;

// direct call query
//
