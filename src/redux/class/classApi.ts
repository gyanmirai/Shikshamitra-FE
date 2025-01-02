import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const classApi = createApi({
  reducerPath: 'classApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Class'],
  endpoints: (builder) => ({
    getClass: builder.query({
      query: () => ({ url: '/app/standard', redirect: 'follow' }),
      providesTags: ['Class'],
    }),
    getClassById: builder.query({
      query: (id) => ({ url: `/app/standard/${id}` }),
      providesTags: ['Class'],
    }),
    addClass: builder.mutation({
      query: (body) => ({
        url: '/app/standard',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Class'],
    }),
    updateClass: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/standard/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Class'],
    }),
    deleteClass: builder.mutation({
      query: (id) => ({
        url: `/app/standard/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Class'],
    }),
  }),
});

export const {
  useGetClassQuery,
  useGetClassByIdQuery,
  useLazyGetClassByIdQuery,
  useAddClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
} = classApi;
