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
    getEntranceExamByStudentId: builder.query({
      query: (id) => ({
        url: `/app/entrance-exam/by-student-enrollment-id/${id}`,
        method: 'GET',
      }),
      providesTags: ['Entrance-Exam'],
    }),
    getStudentForSlotByDate: builder.query({
      query: ({ slotId, examDate }) => ({
        url: `/app/entrance-exam/student-count-for-slot-by-date/${slotId}?examDate=${examDate}`,
        method: 'GET',
      }),
      providesTags: ['Entrance-Exam'],
    }),
  }),
});

export const {
  useAddEntranceExamMutation,
  useUpdateEntranceExamMutation,
  useDeleteEntranceExamMutation,
  useGetEntranceExamQuery,
  useGetEntranceExamByStudentIdQuery,
  useGetStudentForSlotByDateQuery,
  useLazyGetStudentForSlotByDateQuery,
} = EntranceExamApi;
