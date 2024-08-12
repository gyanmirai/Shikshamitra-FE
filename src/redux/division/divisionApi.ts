import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/httpService';

export const divisionApi = createApi({
  reducerPath: 'divisionApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Division'],
  endpoints: (builder) => ({
    getDivision: builder.query({
      query: () => ({ url: '/app/division', redirect: 'follow' }),
      providesTags: ['Division'],
    }),
    getDivisionById: builder.query({
      query: (id) => ({ url: `/app/division/${id}` }),
      providesTags: ['Division'],
    }),
    addDivision: builder.mutation({
      query: (body) => ({
        url: '/app/division',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Division'],
    }),
    updateDivision: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/division/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Division'],
    }),
    deleteDivision: builder.mutation({
      query: (id) => ({
        url: `/app/division/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Division'],
    }),
  }),
});

export const {
  useGetDivisionQuery,
  useGetDivisionByIdQuery,
  useAddDivisionMutation,
  useUpdateDivisionMutation,
  useDeleteDivisionMutation,
} = divisionApi;
