import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const EntranceExamSlotApi = createApi({
  reducerPath: 'EntranceExamSlotApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Entrance-Exam-Slot'],
  endpoints: (builder) => ({
    getEntranceExamSlot: builder.query({
      query: ({ academicYearId, startDate, endDate }) => ({
        url: `/student-enrollment/settings/entrance-exam-slots?AcademicYearId=${academicYearId}&StartDate=${startDate}&EndDate=${endDate}`,
        method: 'GET',
      }),
      providesTags: ['Entrance-Exam-Slot'],
    }),
    addEntranceExamSlot: builder.mutation({
      query: (data) => ({
        url: '/student-enrollment/settings/entrance-exam-slots',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Entrance-Exam-Slot'],
    }),
    updateEntranceExamSlot: builder.mutation({
      query: ({ id, body }) => ({
        url: `/student-enrollment/settings/entrance-exam-slots/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Entrance-Exam-Slot'],
    }),
    deleteEntranceExamSlot: builder.mutation({
      query: (id) => ({
        url: `/student-enrollment/settings/entrance-exam-slots/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Entrance-Exam-Slot'],
    }),
  }),
});

export const {
  useAddEntranceExamSlotMutation,
  useUpdateEntranceExamSlotMutation,
  useDeleteEntranceExamSlotMutation,
  useGetEntranceExamSlotQuery,
} = EntranceExamSlotApi;
