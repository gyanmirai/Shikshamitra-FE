import { api } from 'src/redux/service';
import { studentType, studentTakeAttendanceType } from 'src/redux/tagTypes';

import type {
  AttendanceDay,
  AttendanceMark,
  AttendanceScope,
  AttendanceFilter,
  AttendanceContext,
  AttendanceWorkspace,
  AttendanceMarkResult,
  AttendanceWorkspaceFilter,
  AttendanceCorrectionRequest,
} from './attendance-types';

export const attendanceDayCacheId = (args: AttendanceFilter | AttendanceScope) =>
  'AcademicYearId' in args
    ? `${args.AcademicYearId}/${args.StandardId}/${args.DivisionId}/${args.Date}`
    : `${args.academicYearId}/${args.standardId}/${args.divisionId}/${args.date}`;

export const buildAttendanceRequest = (args: AttendanceFilter) => ({
  url: '/students/attendance/students',
  method: 'GET',
  params: args,
});

export const normalizeAttendanceDay = (day: AttendanceDay): AttendanceDay => ({
  ...day,
  students: day.students.map((student) => ({
    ...student,
    grNo: student.grNumber || student.grNo,
  })),
});

export const StudentTakeAttendanceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAttendanceContext: builder.query<AttendanceContext, { academicYearId: string }>({
      query: (params) => ({ url: '/students/attendance/context', params }),
      providesTags: [
        { type: studentTakeAttendanceType.studentTakeAttendance, id: 'CONTEXT' },
        studentType.student,
      ],
    }),
    getAttendanceWorkspace: builder.query<AttendanceWorkspace, AttendanceWorkspaceFilter>({
      query: (params) => ({ url: '/students/attendance/workspace', params }),
      providesTags: [
        { type: studentTakeAttendanceType.studentTakeAttendance, id: 'WORKSPACE' },
        { type: studentTakeAttendanceType.studentTakeAttendance, id: 'ROSTER' },
        studentType.student,
      ],
    }),
    requestAttendanceCorrection: builder.mutation<
      { id: string; status: 'Pending' | 'Applied' },
      AttendanceCorrectionRequest
    >({
      query: (data) => ({ url: '/students/attendance/corrections', method: 'POST', data }),
      invalidatesTags: (_result, error, args) =>
        error
          ? []
          : [
              {
                type: studentTakeAttendanceType.studentTakeAttendance,
                id: attendanceDayCacheId(args),
              },
              { type: studentTakeAttendanceType.studentTakeAttendance, id: 'REPORTS' },
              { type: studentTakeAttendanceType.studentTakeAttendance, id: 'WORKSPACE' },
              { type: studentTakeAttendanceType.studentTakeAttendance, id: 'CORRECTIONS' },
              studentType.student,
            ],
    }),
    getAttendanceByFilter: builder.query<AttendanceDay, AttendanceFilter>({
      query: buildAttendanceRequest,
      transformResponse: normalizeAttendanceDay,
      providesTags: (_result, _error, args) => [
        { type: studentTakeAttendanceType.studentTakeAttendance, id: attendanceDayCacheId(args) },
        { type: studentTakeAttendanceType.studentTakeAttendance, id: 'ROSTER' },
      ],
    }),
    markAttendance: builder.mutation<AttendanceMarkResult, AttendanceMark>({
      query: (data) => ({ url: '/students/attendance/mark', method: 'POST', data }),
      invalidatesTags: (_result, error, args) =>
        error
          ? []
          : [
              {
                type: studentTakeAttendanceType.studentTakeAttendance,
                id: attendanceDayCacheId(args),
              },
              { type: studentTakeAttendanceType.studentTakeAttendance, id: 'REPORTS' },
              { type: studentTakeAttendanceType.studentTakeAttendance, id: 'WORKSPACE' },
              studentType.student,
            ],
    }),
    lockAttendance: builder.mutation<void, AttendanceScope>({
      query: (data) => ({ url: '/students/attendance/lock', method: 'POST', data }),
      invalidatesTags: (_result, error, args) =>
        error
          ? []
          : [
              {
                type: studentTakeAttendanceType.studentTakeAttendance,
                id: attendanceDayCacheId(args),
              },
              { type: studentTakeAttendanceType.studentTakeAttendance, id: 'WORKSPACE' },
            ],
    }),
    unlockAttendance: builder.mutation<void, AttendanceScope>({
      query: (data) => ({ url: '/students/attendance/unlock', method: 'POST', data }),
      invalidatesTags: (_result, error, args) =>
        error
          ? []
          : [
              {
                type: studentTakeAttendanceType.studentTakeAttendance,
                id: attendanceDayCacheId(args),
              },
            ],
    }),
  }),
  overrideExisting: false,
});
export const {
  useGetAttendanceContextQuery,
  useGetAttendanceWorkspaceQuery,
  useRequestAttendanceCorrectionMutation,
  useGetAttendanceByFilterQuery,
  useMarkAttendanceMutation,
  useLockAttendanceMutation,
  useUnlockAttendanceMutation,
} = StudentTakeAttendanceApi;
