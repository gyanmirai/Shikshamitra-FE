import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const StudentAttendanceTypeApi = createApi({
  reducerPath: 'StudentAttendanceTypeApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Student-Attendance-Type'],
  endpoints: (builder) => ({
    getStudentAttendanceType: builder.query({
      query: () => ({
        url: '/app/attendance-type',
        method: 'GET',
      }),
      providesTags: ['Student-Attendance-Type'],
    }),
    addStudentAttendanceType: builder.mutation({
      query: (data) => ({
        url: '/app/attendance-type',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Student-Attendance-Type'],
    }),
    updateStudentAttendanceType: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/attendance-type/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Student-Attendance-Type'],
    }),
    deleteStudentAttendanceType: builder.mutation({
      query: (id) => ({
        url: `/app/attendance-type/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Student-Attendance-Type'],
    }),
  }),
});

export const {
  useAddStudentAttendanceTypeMutation,
  useUpdateStudentAttendanceTypeMutation,
  useDeleteStudentAttendanceTypeMutation,
  useGetStudentAttendanceTypeQuery,
} = StudentAttendanceTypeApi;
