import { academicType, employeeType } from 'src/redux/tagTypes';

import { employeeApi } from './employeeApi';

export type PagedResult<T> = {
  items: T[];
  totalCount: number;
};

export interface GetDayAttendanceParams {
  attendanceDate: string;
  department?: string;
  isTeaching?: boolean;
  roleId?: string;
  search?: string;
  skipCount?: number;
  maxResultCount?: number;
}

export interface TakeAttendanceDayResponse {
  totalCount: number;
  date: string;
  isDayLocked: boolean;
  isHoliday?: boolean;
  captureMode?: 'manual_status' | 'manual_with_time' | 'integrated';
  holidayName?: string | null;
  holidayReason?: string | null;
  items: Array<{
    employeeId: string;
    isTeaching?: boolean;
    isHoliday?: boolean;
    holidayName?: string | null;
    holidayReason?: string | null;
    isApprovedLeave?: boolean;
    approvedLeaveId?: string | null;
    approvedLeaveKind?: 'FullDay' | 'HalfDay' | null;
    approvedLeaveLabel?: string | null;
    captureMode?: 'manual_status' | 'manual_with_time' | 'integrated';
    source?: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export interface LockAttendanceDayParams {
  attendanceDate: string;
}

export interface GetAttendanceRegisterParams {
  startDate: string;
  endDate: string;
  academicYearId?: string;
  educationMediumStageId?: string;
  employeeId?: string;
  employeeGroup?: 'Teaching' | 'NonTeaching';
  department?: string;
  roleId?: string;
  isTeaching?: boolean;
  status?: 'Present' | 'HalfDayLeave' | 'FullDayLeave';
  payrollState?: 'All' | 'Editable' | 'Locked';
  search?: string;
  skipCount?: number;
  maxResultCount?: number;
}

export interface GetGroupedAttendanceRegisterParams extends GetAttendanceRegisterParams {
  exceptionFilter?: 'All' | 'NeedsAttention' | 'Absent' | 'HalfDay' | 'MissingPunch' | 'Locked';
}

const compactParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  );

export const attendancePayrollInvalidationTags = [
  employeeType.attendance,
  employeeType.runPayroll,
  employeeType.hrDashboard,
  academicType.substitutionAvailability,
  academicType.substitutionAffectedLectures,
  academicType.substitutionSuggestions,
  academicType.substitutionDashboard,
];

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
      invalidatesTags: attendancePayrollInvalidationTags,
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
      invalidatesTags: attendancePayrollInvalidationTags,
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
      invalidatesTags: attendancePayrollInvalidationTags,
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
      invalidatesTags: attendancePayrollInvalidationTags,
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

    getAttendanceRegister: builder.query({
      query: (params: GetAttendanceRegisterParams) => ({
        url: '/hr/attendance/register',
        method: 'GET',
        params: compactParams({
          ...params,
          skipCount: params.skipCount ?? 0,
          maxResultCount: params.maxResultCount ?? 50,
        }),
      }),
      providesTags: [employeeType.attendance],
    }),
    getGroupedAttendanceRegister: builder.query({
      query: (params: GetGroupedAttendanceRegisterParams) => ({
        url: '/hr/attendance/register/grouped',
        method: 'GET',
        params: compactParams({
          ...params,
          skipCount: params.skipCount ?? 0,
          maxResultCount: params.maxResultCount ?? 50,
        }),
      }),
      providesTags: [employeeType.attendance],
    }),
    adjustAttendanceRegister: builder.mutation({
      query: (body) => ({
        url: '/hr/attendance/register/adjust',
        method: 'POST',
        body,
      }),
      invalidatesTags: [employeeType.attendance, employeeType.runPayroll],
    }),
    bulkAdjustAttendanceRegister: builder.mutation({
      query: (body) => ({
        url: '/hr/attendance/register/bulk-adjust',
        method: 'POST',
        body,
      }),
      invalidatesTags: [employeeType.attendance, employeeType.runPayroll],
    }),
  }),
});

export const {
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
  useGetAttendanceRegisterQuery,
  useGetGroupedAttendanceRegisterQuery,
  useAdjustAttendanceRegisterMutation,
  useBulkAdjustAttendanceRegisterMutation,
} = attendanceApi;
