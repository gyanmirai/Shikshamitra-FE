import { api } from 'src/redux/service';
import { studentType, studentLeaveType, studentTakeAttendanceType } from 'src/redux/tagTypes';

import type {
  AttendanceRange,
  AttendanceScope,
  AttendancePolicy,
  AttendancePreview,
  AttendanceSummary,
  AttendanceMetrics,
  AttendanceSettings,
  AttendanceSchedule,
  AttendanceCorrection,
  AttendanceEnrollment,
} from './types';

const base = '/students/attendance';
const attendanceTag = studentTakeAttendanceType.studentTakeAttendance;
const unwrap = <T>(response: T | { data: T }): T =>
  response && typeof response === 'object' && 'data' in response ? response.data : (response as T);
const settingsTag = (year?: string) => [
  { type: attendanceTag, id: `SETTINGS-${year || 'school'}` },
];
type Draft = { academicYearId?: string; concurrencyStamp?: string; policy: AttendancePolicy };
export const attendanceManagementApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAttendanceSettings: builder.query<AttendanceSettings, { academicYearId?: string }>({
      query: (params) => ({ url: `${base}/settings`, params }),
      transformResponse: unwrap<AttendanceSettings>,
      providesTags: (_, __, args) => settingsTag(args.academicYearId),
    }),
    saveAttendanceDraft: builder.mutation<AttendanceSettings, Draft>({
      query: (body) => ({ url: `${base}/settings/draft`, method: 'PUT', body }),
      transformResponse: unwrap<AttendanceSettings>,
      invalidatesTags: (_, __, args) => settingsTag(args.academicYearId),
    }),
    previewAttendancePolicy: builder.mutation<AttendancePreview, Draft>({
      query: (body) => ({ url: `${base}/settings/preview`, method: 'POST', body }),
      transformResponse: unwrap<AttendancePreview>,
    }),
    publishAttendancePolicy: builder.mutation<
      AttendanceSettings,
      { academicYearId?: string; concurrencyStamp?: string; effectiveFrom: string }
    >({
      query: (body) => ({ url: `${base}/settings/publish`, method: 'POST', body }),
      transformResponse: unwrap<AttendanceSettings>,
      invalidatesTags: [attendanceTag, studentType.student],
    }),
    getAttendanceEnrollments: builder.query<
      { items: AttendanceEnrollment[]; totalCount: number },
      AttendanceScope & { skipCount?: number; maxResultCount?: number }
    >({
      query: (params) => ({ url: `${base}/enrollments`, params }),
      transformResponse: unwrap<{ items: AttendanceEnrollment[]; totalCount: number }>,
      providesTags: [attendanceTag, studentType.student],
    }),
    confirmAttendanceStart: builder.mutation<
      void,
      { enrollmentId: string; date: string; revision: string }
    >({
      query: ({ enrollmentId, ...body }) => ({
        url: `${base}/enrollments/${enrollmentId}/start-date`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [attendanceTag, studentType.student],
    }),
    getAttendanceSchedules: builder.query<
      { items: AttendanceSchedule[] },
      { enrollmentId: string }
    >({
      query: (params) => ({ url: `${base}/schedules`, params }),
      transformResponse: unwrap<{ items: AttendanceSchedule[] }>,
      providesTags: [attendanceTag],
    }),
    saveAttendanceSchedule: builder.mutation<AttendanceSchedule, AttendanceSchedule>({
      query: (body) => ({ url: `${base}/schedules`, method: 'POST', body }),
      transformResponse: unwrap<AttendanceSchedule>,
      invalidatesTags: [attendanceTag, studentType.student],
    }),
    deleteAttendanceSchedule: builder.mutation<void, { id: string; concurrencyStamp?: string }>({
      query: ({ id, concurrencyStamp }) => ({
        url: `${base}/schedules/${id}`,
        method: 'DELETE',
        params: { concurrencyStamp },
      }),
      invalidatesTags: [attendanceTag, studentType.student],
    }),
    getAttendanceRegister: builder.query<
      { rows: AttendanceMetrics[]; totalCount: number },
      AttendanceRange
    >({
      query: (params) => ({ url: `${base}/register`, params }),
      transformResponse: unwrap<{ rows: AttendanceMetrics[]; totalCount: number }>,
      providesTags: [{ type: attendanceTag, id: 'REPORTS' }, studentLeaveType.studentLeave],
    }),
    getAttendanceSummary: builder.query<AttendanceSummary, AttendanceRange & { studentId: string }>(
      {
        query: (params) => ({ url: `${base}/summary`, params }),
        transformResponse: unwrap<AttendanceSummary>,
        providesTags: [{ type: attendanceTag, id: 'REPORTS' }, studentLeaveType.studentLeave],
      }
    ),
    getAttendanceCorrections: builder.query<
      { items: AttendanceCorrection[]; totalCount: number },
      AttendanceScope & { skipCount?: number; maxResultCount?: number; status?: string }
    >({
      query: (params) => ({ url: `${base}/corrections`, params }),
      transformResponse: unwrap<{ items: AttendanceCorrection[]; totalCount: number }>,
      providesTags: [{ type: attendanceTag, id: 'CORRECTIONS' }],
    }),
    decideAttendanceCorrection: builder.mutation<
      void,
      { id: string; action: 'approve' | 'reject'; reason: string; revision: string }
    >({
      query: ({ id, action, ...body }) => ({
        url: `${base}/corrections/${id}/${action}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [attendanceTag, studentType.student],
    }),
  }),
});
export const {
  useGetAttendanceSettingsQuery,
  useSaveAttendanceDraftMutation,
  usePreviewAttendancePolicyMutation,
  usePublishAttendancePolicyMutation,
  useGetAttendanceEnrollmentsQuery,
  useConfirmAttendanceStartMutation,
  useGetAttendanceSchedulesQuery,
  useSaveAttendanceScheduleMutation,
  useDeleteAttendanceScheduleMutation,
  useGetAttendanceRegisterQuery,
  useGetAttendanceSummaryQuery,
  useGetAttendanceCorrectionsQuery,
  useDecideAttendanceCorrectionMutation,
} = attendanceManagementApi;
