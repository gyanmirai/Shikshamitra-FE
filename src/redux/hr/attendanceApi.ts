import type {
  PagedResult,
  AttendanceConfiguration,
  AttendancePolicyEvaluationRun,
  AttendancePolicyEvaluationResult,
  AttendancePolicyEvaluationRequest,
  AttendanceConfigurationPreviewRequest,
  AttendanceConfigurationPreviewResponse,
  AttendancePolicyEvaluationResultsRequest,
} from 'src/screens/hr/attendance-setting/types';

import { employeeType } from 'src/redux/tagTypes';

import { employeeApi } from './employeeApi';

export const attendanceEvaluationPublishInvalidationTags = [
  employeeType.attendanceRule,
  employeeType.employeePayroll,
  employeeType.runPayroll,
];

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

export type AttendanceConfigurationResponse = Partial<AttendanceConfiguration> & {
  success: boolean;
  message: string;
};

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
    getAttendanceConfiguration: builder.query<
      AttendanceConfigurationResponse,
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: '/attendance/configuration',
        method: 'GET',
        params: { academicYearId },
      }),
      providesTags: [employeeType.attendanceRule],
    }),
    saveAttendanceConfiguration: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/attendance/configuration',
        method: 'POST',
        params: { academicYearId },
        body,
      }),
      invalidatesTags: [employeeType.attendanceRule],
    }),
    previewAttendanceConfiguration: builder.mutation<
      AttendanceConfigurationPreviewResponse,
      { academicYearId: string; body: AttendanceConfigurationPreviewRequest }
    >({
      query: ({ academicYearId, body }) => ({
        url: '/attendance/configuration/preview',
        method: 'POST',
        params: { academicYearId },
        body,
      }),
    }),
    previewAttendancePolicyEvaluation: builder.mutation<
      AttendancePolicyEvaluationRun,
      { body: AttendancePolicyEvaluationRequest }
    >({
      query: ({ body }) => ({
        url: '/attendance/configuration/evaluations/preview',
        method: 'POST',
        body,
      }),
    }),
    createAttendancePolicyEvaluation: builder.mutation<
      AttendancePolicyEvaluationRun,
      { body: AttendancePolicyEvaluationRequest }
    >({
      query: ({ body }) => ({
        url: '/attendance/configuration/evaluations',
        method: 'POST',
        body,
      }),
      invalidatesTags: [employeeType.attendanceRule],
    }),
    getAttendancePolicyEvaluations: builder.query<
      AttendancePolicyEvaluationRun[],
      { academicYearId: string; month: number; year: number }
    >({
      query: ({ academicYearId, month, year }) => ({
        url: '/attendance/configuration/evaluations',
        method: 'GET',
        params: { academicYearId, month, year },
      }),
      providesTags: [employeeType.attendanceRule],
    }),
    getAttendancePolicyEvaluation: builder.query<AttendancePolicyEvaluationRun, { runId: string }>({
      query: ({ runId }) => ({
        url: `/attendance/configuration/evaluations/${runId}`,
        method: 'GET',
      }),
      providesTags: [employeeType.attendanceRule],
    }),
    getAttendancePolicyEvaluationResults: builder.query<
      PagedResult<AttendancePolicyEvaluationResult>,
      AttendancePolicyEvaluationResultsRequest
    >({
      query: ({ runId, ...params }) => ({
        url: `/attendance/configuration/evaluations/${runId}/results`,
        method: 'GET',
        params,
      }),
      providesTags: [employeeType.attendanceRule],
    }),
    approveAttendancePolicyEvaluation: builder.mutation<
      AttendancePolicyEvaluationRun,
      { runId: string }
    >({
      query: ({ runId }) => ({
        url: `/attendance/configuration/evaluations/${runId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: [employeeType.attendanceRule],
    }),
    publishAttendancePolicyEvaluation: builder.mutation<
      AttendancePolicyEvaluationRun,
      { runId: string }
    >({
      query: ({ runId }) => ({
        url: `/attendance/configuration/evaluations/${runId}/publish`,
        method: 'POST',
      }),
      invalidatesTags: attendanceEvaluationPublishInvalidationTags,
    }),
    cancelAttendancePolicyEvaluation: builder.mutation<
      AttendancePolicyEvaluationRun,
      { runId: string }
    >({
      query: ({ runId }) => ({
        url: `/attendance/configuration/evaluations/${runId}/cancel`,
        method: 'POST',
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
  useGetAttendanceConfigurationQuery,
  useSaveAttendanceConfigurationMutation,
  usePreviewAttendanceConfigurationMutation,
  usePreviewAttendancePolicyEvaluationMutation,
  useCreateAttendancePolicyEvaluationMutation,
  useGetAttendancePolicyEvaluationsQuery,
  useGetAttendancePolicyEvaluationQuery,
  useGetAttendancePolicyEvaluationResultsQuery,
  useApproveAttendancePolicyEvaluationMutation,
  usePublishAttendancePolicyEvaluationMutation,
  useCancelAttendancePolicyEvaluationMutation,
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
