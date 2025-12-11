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
        url: '/students/attendance/settings/leave-types',
        method: 'GET',
      }),
      providesTags: ['Student-Attendance-Type'],
    }),
    addStudentAttendanceType: builder.mutation({
      query: (data) => ({
        url: '/students/attendance/settings/leave-types',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Student-Attendance-Type'],
    }),
    updateStudentAttendanceType: builder.mutation({
      query: ({ id, body }) => ({
        url: `/students/attendance/settings/leave-types/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Student-Attendance-Type'],
    }),
    deleteStudentAttendanceType: builder.mutation({
      query: (id) => ({
        url: `/students/attendance/settings/leave-types/${id}`,
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
