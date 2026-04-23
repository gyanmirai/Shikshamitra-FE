import { employeeType } from 'src/redux/tagTypes';

import { employeeApi } from './employeeApi';

export interface GetDayAttendanceParams {
  attendanceDate: string;
  department?: string;
  isTeaching?: boolean;
  roleId?: string;
  search?: string;
  skipCount?: number;
  maxResultCount?: number;
}

export interface LockAttendanceDayParams {
  attendanceDate: string;
}

export const buildGetDayAttendanceQueryParams = ({
  attendanceDate,
  department,
  isTeaching,
  roleId,
  search,
  skipCount = 0,
  maxResultCount = 50,
}: GetDayAttendanceParams) => ({
  attendanceDate,
  department,
  isTeaching,
  roleId,
  search,
  skipCount,
  maxResultCount,
});

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
    saveDayAttendance: builder.mutation({
      query: (body) => ({
        url: '/hr/attendance/take-attendance/day/save',
        method: 'POST',
        body,
      }),
      invalidatesTags: [employeeType.attendance],
    }),

    // Lock/Unlock Attendance Day
    lockDayAttendance: builder.mutation({
      query: ({ attendanceDate }: LockAttendanceDayParams) => ({
        url: '/hr/attendance/take-attendance/day/lock',
        method: 'POST',
        params: { attendanceDate },
      }),
      invalidatesTags: [employeeType.attendance],
    }),
    unlockDayAttendance: builder.mutation({
      query: ({ attendanceDate }: LockAttendanceDayParams) => ({
        url: '/hr/attendance/take-attendance/day/lock',
        method: 'DELETE',
        params: { attendanceDate },
      }),
      invalidatesTags: [employeeType.attendance],
    }),

    // Take Attendance - Day (GET)
    getDayAttendance: builder.query({
      query: (params: GetDayAttendanceParams) => ({
        url: '/hr/attendance/take-attendance/day',
        method: 'GET',
        params: buildGetDayAttendanceQueryParams(params),
      }),
      providesTags: [employeeType.attendance],
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
  useSaveDayAttendanceMutation,
  useLockDayAttendanceMutation,
  useUnlockDayAttendanceMutation,
  useGetDayAttendanceQuery,
} = attendanceApi;
