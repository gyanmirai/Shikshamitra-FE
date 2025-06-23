import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const yearApi = createApi({
  reducerPath: 'yearApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Year'],
  endpoints: (builder) => ({
    getYear: builder.query({
      query: () => ({ url: '/app/academic-year?Sorting=name' }),
      providesTags: ['Year'],
    }),
    getYearById: builder.query({
      query: (id) => ({ url: `/app/academic-year/${id}` }),
      providesTags: ['Year'],
    }),
    addYear: builder.mutation({
      query: (body) => ({
        url: '/app/academic-year',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Year'],
    }),
    updateYear: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/academic-year/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Year'],
    }),
    deleteYear: builder.mutation({
      query: (id) => ({
        url: `/app/academic-year/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Year'],
    }),
  }),
});

export const {
  useGetYearQuery,
  useGetYearByIdQuery,
  useAddYearMutation,
  useUpdateYearMutation,
  useDeleteYearMutation,
} = yearApi;
