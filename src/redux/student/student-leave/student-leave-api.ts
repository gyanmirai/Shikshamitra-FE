import { api } from 'src/redux/service';
import { studentLeaveType } from 'src/redux/tagTypes';

export const StudentLeaveApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStudentLeave: builder.query({
      query: () => ({
        url: `/app/student-leave`,
        method: 'GET',
      }),
      providesTags: [studentLeaveType.studentLeave],
    }),
    addStudentLeave: builder.mutation({
      query: (data) => ({
        url: `/students/attendance/leaves`,
        method: 'POST',
        data,
      }),
      invalidatesTags: [studentLeaveType.studentLeave],
    }),
    changeLeaveStatus: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/student-leave/${id}/leave-request-status`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [studentLeaveType.studentLeave],
    }),
  }),
});

export const { useGetStudentLeaveQuery, useAddStudentLeaveMutation, useChangeLeaveStatusMutation } =
  StudentLeaveApi;
