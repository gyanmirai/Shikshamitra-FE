import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const shiftManagementApi = createApi({
  reducerPath: 'shiftManagementApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Shift'],
  endpoints: (builder) => ({
    addShift: builder.mutation({
      query: (body) => ({
        url: '/app/shift-management/',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Shift'],
    }),
    getShiftById: builder.query({
      query: (id) => ({
        url: `/app/shift-management/${id}`,
      }),
      providesTags: ['Shift'],
    }),
    updateShift: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/shift-management/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Shift'],
    }),
    deleteShift: builder.mutation({
      query: (id) => ({
        url: `/app/shift-management/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Shift'],
    }),
    getShifts: builder.query({
      query: () => ({
        url: `/app/shift-management`,
      }),
      providesTags: ['Shift'],
    }),
  }),
});

export const {
  useAddShiftMutation,
  useDeleteShiftMutation,
  useGetShiftByIdQuery,
  useUpdateShiftMutation,
  useGetShiftsQuery,
} = shiftManagementApi;
