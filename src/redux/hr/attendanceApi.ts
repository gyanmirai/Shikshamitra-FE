import { employeeApi } from './employeeApi';

export const attendanceApi = employeeApi.injectEndpoints({
  endpoints: (builder) => ({
    // Attendance Configuration
    saveAttendanceConfiguration: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/attendance/configuration',
        method: 'POST',
        params: { academicYearId },
        data: body,
      }),
      invalidatesTags: ['AttendanceRule'],
    }),

    // Attendance Tracking
    getAttendanceDateWise: builder.query({
      query: ({ attendanceDate, status, page = 1, pageSize = 10, academicYearId, search }) => ({
        url: '/attendance-tracking/date-wise',
        method: 'GET',
        params: { attendanceDate, status, page, pageSize, academicYearId, search },
      }),
      providesTags: ['Attendance'],
    }),
    getAttendanceEmployeeWise: builder.query({
      query: ({
        employeeId,
        startDate,
        endDate,
        status,
        page = 1,
        pageSize = 10,
        academicYearId,
        search,
      }) => ({
        url: '/attendance-tracking/employee-wise',
        method: 'GET',
        params: { employeeId, startDate, endDate, status, page, pageSize, academicYearId, search },
      }),
      providesTags: ['Attendance'],
    }),

    // Attendance Management
    getPaginatedAttendance: builder.query({
      query: ({ date, page = 0, pageSize = 20, search }) => ({
        url: '/attendance/employees',
        method: 'GET',
        params: { date, page, pageSize, search },
      }),
      providesTags: ['Attendance'],
    }),
    updateAttendance: builder.mutation({
      query: (body) => ({
        url: '/attendance/employees',
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Attendance'],
    }),
    importAttendance: builder.mutation({
      query: (body) => ({
        url: '/attendance/import',
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        data: body,
      }),
      invalidatesTags: ['Attendance'],
    }),
  }),
});

export const {
  useSaveAttendanceConfigurationMutation,
  useGetAttendanceDateWiseQuery,
  useGetAttendanceEmployeeWiseQuery,
  useLazyGetAttendanceEmployeeWiseQuery,
  useGetPaginatedAttendanceQuery,
  useUpdateAttendanceMutation,
  useImportAttendanceMutation,
} = attendanceApi;
