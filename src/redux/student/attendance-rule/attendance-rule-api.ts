import { api } from 'src/redux/service';
import { studentAttendanceRuleType } from 'src/redux/tagTypes';

export const StudentAttendanceRuleApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStudentAttendanceRule: builder.query({
      query: () => ({
        url: '/app/student-attendance-rule',
        method: 'GET',
      }),
      providesTags: [studentAttendanceRuleType.studentAttendanceRule],
    }),
    addStudentAttendanceRule: builder.mutation({
      query: (data) => ({
        url: '/app/student-attendance-rule',
        method: 'POST',
        data,
      }),
      invalidatesTags: [studentAttendanceRuleType.studentAttendanceRule],
    }),
    updateStudentAttendanceRule: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/student-attendance-rule/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentAttendanceRuleType.studentAttendanceRule],
    }),
    deleteStudentAttendanceRule: builder.mutation({
      query: (id) => ({
        url: `/app/student-attendance-rule/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [studentAttendanceRuleType.studentAttendanceRule],
    }),
  }),
});

export const {
  useAddStudentAttendanceRuleMutation,
  useDeleteStudentAttendanceRuleMutation,
  useGetStudentAttendanceRuleQuery,
  useUpdateStudentAttendanceRuleMutation,
} = StudentAttendanceRuleApi;
