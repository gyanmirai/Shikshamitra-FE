import { employeeType } from 'src/redux/tagTypes';

import { employeeApi } from './employeeApi';

export const attendanceApi = employeeApi.injectEndpoints({
  endpoints: (builder) => ({
    // Attendance Configuration
    saveAttendanceConfiguration: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/attendance/configuration',
        method: 'POST',
        params: { academicYearId },
        body,
      }),
      invalidatesTags: [employeeType.attendanceRule],
    }),

    // Attendance Tracking
    getAttendanceDateWise: builder.query({
      query: ({ attendanceDate, status, page = 1, pageSize = 10, academicYearId, search }) => ({
        url: '/attendance-tracking/date-wise',
        method: 'GET',
        params: { attendanceDate, status, page, pageSize, academicYearId, search },
      }),
      providesTags: [employeeType.attendance],
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
      providesTags: [employeeType.attendance],
    }),

    // Attendance Management
    getPaginatedAttendance: builder.query({
      query: ({ date, page = 0, pageSize = 20, search }) => ({
        url: '/attendance/employees',
        method: 'GET',
        params: { date, page, pageSize, search },
      }),
      providesTags: [employeeType.attendance],
    }),
    updateAttendance: builder.mutation({
      query: (body) => ({
        url: '/attendance/employees',
        method: 'PUT',
        body,
      }),
      invalidatesTags: [employeeType.attendance],
    }),
    importAttendance: builder.mutation({
      query: (body) => ({
        url: '/attendance/import',
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body,
      }),
      invalidatesTags: [employeeType.attendance],
    }),
    previewAttendance: builder.mutation({
      query: (body) => ({
        url: '/attendance-import/preview',
        method: 'POST',
        body,
      }),
    }),
    confirmAttendance: builder.mutation({
      query: (body) => ({
        url: '/attendance-import/confirm',
        method: 'POST',
        body,
      }),
      invalidatesTags: [employeeType.attendance],
    }),
    downloadAttendanceTemplate: builder.mutation({
      query: () => ({
        url: '/attendance-import/template',
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
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
  usePreviewAttendanceMutation,
  useConfirmAttendanceMutation,
  useDownloadAttendanceTemplateMutation,
} = attendanceApi;
