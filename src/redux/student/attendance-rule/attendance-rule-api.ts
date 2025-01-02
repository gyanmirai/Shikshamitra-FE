import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const StudentAttendanceRuleApi = createApi({
  reducerPath: 'StudentAttendanceRuleApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Student-Attendance-Rule'],
  endpoints: (builder) => ({
    getStudentAttendanceRule: builder.query({
      query: () => ({
        url: '/app/student-attendance-rule',
        method: 'GET',
      }),
      providesTags: ['Student-Attendance-Rule'],
    }),
    addStudentAttendanceRule: builder.mutation({
      query: (data) => ({
        url: '/app/student-attendance-rule',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Student-Attendance-Rule'],
    }),
    updateStudentAttendanceRule: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/student-attendance-rule/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Student-Attendance-Rule'],
    }),
    deleteStudentAttendanceRule: builder.mutation({
      query: (id) => ({
        url: `/app/student-attendance-rule/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Student-Attendance-Rule'],
    }),
  }),
});

export const {
  useAddStudentAttendanceRuleMutation,
  useDeleteStudentAttendanceRuleMutation,
  useGetStudentAttendanceRuleQuery,
  useUpdateStudentAttendanceRuleMutation,
} = StudentAttendanceRuleApi;
