import { api } from 'src/redux/service';
import { studentType, studentLeaveType, studentTakeAttendanceType } from 'src/redux/tagTypes';

export type StudentLeaveListQuery = {
  boardId?: string;
  academicYearId?: string;
  filterText?: string;
  tableFilters?: string;
  studentId?: string;
  educationMediumId?: string;
  organizationId?: string;
  standardId?: string;
  divisionId?: string;
  studentLeaveTypeId?: string;
  status?: number;
  startDate?: string;
  endDate?: string;
  sorting?: string;
  skipCount?: number;
  maxResultCount?: number;
};

export const StudentLeaveApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStudentLeave: builder.query({
      query: (params: StudentLeaveListQuery = {}) => ({
        url: `/students/attendance/leaves`,
        method: 'GET',
        params,
      }),
      providesTags: [studentLeaveType.studentLeave],
    }),
    addStudentLeave: builder.mutation({
      query: (data) => ({
        url: `/students/attendance/leaves`,
        method: 'POST',
        data,
      }),
      invalidatesTags: (_result, error) =>
        error
          ? []
          : [
              { type: studentType.student, id: 'MODULE-DASHBOARD-attendance' },
              studentLeaveType.studentLeave,
              studentTakeAttendanceType.studentTakeAttendance,
              studentType.student,
            ],
    }),
    updateStudentLeave: builder.mutation({
      query: ({ id, data }) => ({
        url: `/students/attendance/leaves/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_result, error) =>
        error
          ? []
          : [
              studentLeaveType.studentLeave,
              { type: studentType.student, id: 'MODULE-DASHBOARD-attendance' },
            ],
    }),
    approveStudentLeave: builder.mutation({
      query: ({ id, data }) => ({
        url: `/students/attendance/leaves/${id}/approve`,
        method: 'POST',
        data,
      }),
      invalidatesTags: (_result, error) =>
        error
          ? []
          : [
              { type: studentType.student, id: 'MODULE-DASHBOARD-attendance' },
              studentLeaveType.studentLeave,
              studentTakeAttendanceType.studentTakeAttendance,
              studentType.student,
            ],
    }),
    rejectStudentLeave: builder.mutation({
      query: ({ id, data }) => ({
        url: `/students/attendance/leaves/${id}/reject`,
        method: 'POST',
        data,
      }),
      invalidatesTags: (_result, error) =>
        error
          ? []
          : [
              { type: studentType.student, id: 'MODULE-DASHBOARD-attendance' },
              studentLeaveType.studentLeave,
              studentTakeAttendanceType.studentTakeAttendance,
              studentType.student,
            ],
    }),
  }),
});

export const {
  useGetStudentLeaveQuery,
  useAddStudentLeaveMutation,
  useUpdateStudentLeaveMutation,
  useApproveStudentLeaveMutation,
  useRejectStudentLeaveMutation,
} = StudentLeaveApi;
