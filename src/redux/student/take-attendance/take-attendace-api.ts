import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const StudentTakeAttendanceApi = createApi({
  reducerPath: 'StudentTakeAttendanceApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Student-Take-Attendance'],
  endpoints: (builder) => ({
    fillStudentAttendance: builder.mutation({
      query: ({ attendanceDate, data }) => ({
        url: `/app/student-attendance/fill-attendance?attendanceDate=${attendanceDate}`,
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Student-Take-Attendance'],
    }),
    addStudentAttendance: builder.mutation({
      query: (data) => ({
        url: `/app/student-attendance`,
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Student-Take-Attendance'],
    }),
    getStudentsAttendance: builder.query({
      query: () => ({
        url: `/app/student-attendance/?Sorting=${'desc'}&SkipCount=${3}&MaxResultCount=${5}`,
        method: 'GET',
      }),
      providesTags: ['Student-Take-Attendance'],
    }),
    updateStudentAttendance: builder.mutation({
      query: ({ studentId, data }) => ({
        url: `/app/student-attendance/${studentId}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Student-Take-Attendance'],
    }),
    deleteStudentAttendance: builder.mutation({
      query: (studentId) => ({
        url: `/app/student-attendance/${studentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Student-Take-Attendance'],
    }),
    getStudentAttendance: builder.query({
      query: (studentId) => ({
        url: `/app/student-attendance/${studentId}`,
        method: 'GET',
      }),
      providesTags: ['Student-Take-Attendance'],
    }),
  }),
});

export const {
  useFillStudentAttendanceMutation,
  useAddStudentAttendanceMutation,
  useGetStudentsAttendanceQuery,
  useGetStudentAttendanceQuery,
  useDeleteStudentAttendanceMutation,
  useUpdateStudentAttendanceMutation,
} = StudentTakeAttendanceApi;
