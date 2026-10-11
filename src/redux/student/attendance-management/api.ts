import { api } from 'src/redux/service';
import { studentType, studentLeaveType, studentTakeAttendanceType } from 'src/redux/tagTypes';

import type {
  AttendanceRange,
  AttendanceScope,
  AttendanceSummary,
  AttendanceMetrics,
  AttendanceCorrection,
} from './types';

const base = '/students/attendance';
const attendanceTag = studentTakeAttendanceType.studentTakeAttendance;
const unwrap = <T>(response: T | { data: T }): T =>
  response && typeof response === 'object' && 'data' in response ? response.data : (response as T);
export const attendanceManagementApi = api.injectEndpoints({
  endpoints: (builder) => ({
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
  useGetAttendanceRegisterQuery,
  useGetAttendanceSummaryQuery,
  useGetAttendanceCorrectionsQuery,
  useDecideAttendanceCorrectionMutation,
} = attendanceManagementApi;
