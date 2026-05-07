import { api } from 'src/redux/service';
import { studentLeaveType } from 'src/redux/tagTypes';

export const StudentLeaveApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStudentLeave: builder.query({
      query: () => ({
        url: `/students/attendance/leaves`,
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
    approveStudentLeave: builder.mutation({
      query: ({ id, data }) => ({
        url: `/students/attendance/leaves/${id}/approve`,
        method: 'POST',
        data,
      }),
      invalidatesTags: [studentLeaveType.studentLeave],
    }),
    rejectStudentLeave: builder.mutation({
      query: ({ id, data }) => ({
        url: `/students/attendance/leaves/${id}/reject`,
        method: 'POST',
        data,
      }),
      invalidatesTags: [studentLeaveType.studentLeave],
    }),
  }),
});

export const {
  useGetStudentLeaveQuery,
  useAddStudentLeaveMutation,
  useApproveStudentLeaveMutation,
  useRejectStudentLeaveMutation,
} = StudentLeaveApi;
