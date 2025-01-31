import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const EntranceExamApi = createApi({
  reducerPath: 'EntranceExamApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Entrance-Exam'],
  endpoints: (builder) => ({
    getEntranceExam: builder.query({
      query: () => ({
        url: '/app/entrance-exam',
        method: 'GET',
      }),
      providesTags: ['Entrance-Exam'],
    }),
    addEntranceExam: builder.mutation({
      query: (data) => ({
        url: '/app/entrance-exam',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Entrance-Exam'],
    }),
    updateEntranceExam: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/entrance-exam/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Entrance-Exam'],
    }),
    deleteEntranceExam: builder.mutation({
      query: (id) => ({
        url: `/app/entrance-exam/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Entrance-Exam'],
    }),
  }),
});

export const {
  useAddEntranceExamMutation,
  useUpdateEntranceExamMutation,
  useDeleteEntranceExamMutation,
  useGetEntranceExamQuery,
} = EntranceExamApi;
