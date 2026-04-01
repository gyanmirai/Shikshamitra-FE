import { api } from 'src/redux/service';
import { studentAttendanceType } from 'src/redux/tagTypes';

export const StudentAttendanceTypeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStudentAttendanceType: builder.query({
      query: () => ({
        url: '/students/attendance/settings/leave-types',
        method: 'GET',
      }),
      providesTags: [studentAttendanceType.studentAttendanceType],
    }),
    addStudentAttendanceType: builder.mutation({
      query: (data) => ({
        url: '/students/attendance/settings/leave-types',
        method: 'POST',
        data,
      }),
      invalidatesTags: [studentAttendanceType.studentAttendanceType],
    }),
    updateStudentAttendanceType: builder.mutation({
      query: ({ id, body }) => ({
        url: `/students/attendance/settings/leave-types/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [studentAttendanceType.studentAttendanceType],
    }),
    deleteStudentAttendanceType: builder.mutation({
      query: (id) => ({
        url: `/students/attendance/settings/leave-types/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [studentAttendanceType.studentAttendanceType],
    }),
  }),
});

export const {
  useAddStudentAttendanceTypeMutation,
  useUpdateStudentAttendanceTypeMutation,
  useDeleteStudentAttendanceTypeMutation,
  useGetStudentAttendanceTypeQuery,
} = StudentAttendanceTypeApi;
