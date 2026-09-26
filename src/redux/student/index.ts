import { api } from 'src/redux/service';
import { studentType } from 'src/redux/tagTypes';

import { unwrapStudentRecordProfile } from './student-profile-types';

import type { StudentRecordProfile } from './student-profile-types';

export const StudentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFilterStudents: builder.query({
      query: ({
        academicYearId,
        academicMediumId,
        educationMediumStageId,
        standardId,
        divisionId,
      }) => {
        let queryString = '';
        if (academicYearId) {
          queryString += `AcademicYearId=${academicYearId}&`;
        }
        if (academicMediumId) {
          queryString += `AcademicMediumId=${academicMediumId}&`;
        }
        if (educationMediumStageId) {
          queryString += `EducationMediumStageId=${educationMediumStageId}&`;
        }
        if (standardId) {
          queryString += `StandardId=${standardId}&`;
        }
        if (divisionId) {
          queryString += `DivisionId=${divisionId}&`;
        }
        queryString = queryString ? `?${queryString.slice(0, -1)}` : '';

        return {
          url: `/students/admissions${queryString}`,
          method: 'GET',
        };
      },
      providesTags: [studentType.student],
    }),
    changeDivision: builder.mutation({
      query: (body) => ({
        url: `/students/records/divisions`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentType.student],
    }),
    getAllStudents: builder.query({
      query: () => ({
        url: `/app/student`,
        method: 'GET',
      }),
      providesTags: [studentType.student],
    }),
    getStudentById: builder.query<StudentRecordProfile | null, string>({
      query: (id) => ({
        url: `/students/records/${encodeURIComponent(id)}/profile`,
        method: 'GET',
      }),
      transformResponse: unwrapStudentRecordProfile,
      providesTags: [studentType.student],
    }),
    getStudentsByDivision: builder.query({
      query: (
        args:
          | string
          | { divisionId: string; skipCount?: number; maxResultCount?: number; searchTerm?: string }
      ) => {
        const params = typeof args === 'string' ? { divisionId: args } : args;
        const queryParams = new URLSearchParams();

        if (params.skipCount !== undefined) queryParams.set('skipCount', String(params.skipCount));
        if (params.maxResultCount !== undefined) {
          queryParams.set('maxResultCount', String(params.maxResultCount));
        }
        if (params.searchTerm) queryParams.set('searchTerm', params.searchTerm);

        const queryString = queryParams.toString();

        return {
          url: `/students/records/list/${params.divisionId}${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: [studentType.student],
    }),
    uploadStudentPhoto: builder.mutation({
      query: ({ studentId, body }) => ({
        url: `/students/records/${studentId}/photo`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentType.student],
    }),
    getStudentDashboardSummary: builder.query({
      query: () => ({
        url: '/students/records/dashboard-summary',
        method: 'GET',
      }),
      providesTags: [studentType.student],
    }),
    getStudentAttendanceDashboardSummary: builder.query({
      query: (params?: StudentAttendanceDashboardSummaryQuery) => ({
        url: '/students/records/attendance-dashboard-summary',
        method: 'GET',
        params,
      }),
      providesTags: [studentType.student],
    }),
    getStudentDashboardPreview: builder.query<
      StudentDashboardPreview,
      StudentDashboardKey | string
    >({
      query: (dashboardKey) => ({
        url: `/students/dashboard/previews/${dashboardKey}`,
        method: 'GET',
      }),
      providesTags: [studentType.student],
      keepUnusedDataFor: 3600,
    }),
    refreshStudentDashboardPreview: builder.mutation<
      StudentDashboardPreview,
      StudentDashboardKey | string
    >({
      query: (dashboardKey) => ({
        url: `/students/dashboard/previews/${dashboardKey}/refresh`,
        method: 'POST',
      }),
      invalidatesTags: [studentType.student],
    }),
    getStudentAttendanceHistory: builder.query({
      query: (params: StudentAttendanceHistoryQuery) => ({
        url: '/students/attendance/history',
        method: 'GET',
        params,
      }),
      providesTags: [studentType.student],
    }),
    getStudentsByScope: builder.query<
      StudentLookupItem[],
      {
        academicYearId: string;
        boardId: string;
        educationMediumId: string;
        classIds: string[];
        divisionIds?: string[];
        onlyWithFeeStructureAssignment?: boolean;
      }
    >({
      query: ({
        academicYearId,
        boardId,
        educationMediumId,
        classIds,
        divisionIds,
        onlyWithFeeStructureAssignment,
      }) => {
        const params = new URLSearchParams();
        params.append('academicYearId', academicYearId);
        params.append('boardId', boardId);
        params.append('educationMediumId', educationMediumId);
        classIds.forEach((id) => params.append('classIds', id));
        divisionIds?.forEach((id) => params.append('divisionIds', id));
        if (onlyWithFeeStructureAssignment !== undefined) {
          params.set('onlyWithFeeStructureAssignment', String(onlyWithFeeStructureAssignment));
        }
        return {
          url: `/students/records/list/by-scope?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: [studentType.student],
    }),
  }),
});

export type StudentLookupItem = {
  studentId: string;
  studentName: string;
  grNo?: number;
  rollNo?: number;
  standardId?: string;
  standardName?: string;
  divisionId?: string;
  divisionName?: string;
};

export type StudentAttendanceDashboardSummaryQuery = {
  startDate?: string;
  endDate?: string;
};

export type StudentAttendanceHistoryQuery = {
  studentId: string;
  startDate?: string;
  endDate?: string;
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
};

export type StudentDashboardKey = 'Reporting';

export type StudentDashboardPreviewStatus = 'Empty' | 'Ready' | 'Refreshing' | 'Failed' | string;

export type StudentDashboardPreview = {
  dashboardKey: StudentDashboardKey | string;
  scopeKey?: string;
  status: StudentDashboardPreviewStatus;
  payloadJson: string;
  payloadVersion: number;
  isStale?: boolean;
  lastRefreshedAt?: string | null;
  lastSuccessfulRefreshAt?: string | null;
  nextScheduledRefreshAt?: string | null;
  refreshStartedAt?: string | null;
  refreshRequestedByUserId?: string | null;
  lastError?: string | null;
};

export type StudentReportingDashboard = {
  generatedAt: string;
  rangeStart: string;
  rangeEnd: string;
  kpis: StudentReportingKpi[];
  categories: StudentReportingCategory[];
  enrollmentTrend: StudentReportingTrendPoint[];
  attendanceTrend: StudentReportingAttendanceTrendPoint[];
  classStrength: StudentReportingClassStrength[];
  alerts: StudentReportingAlert[];
  quickLinks: StudentReportingQuickLink[];
};

export type StudentReportingKpi = {
  id: string;
  label: string;
  value: number;
  displayValue?: string | null;
  tone: 'default' | 'success' | 'warning' | 'info' | 'critical' | string;
  description?: string | null;
  href?: string | null;
};

export type StudentReportingCategory = {
  id: string;
  title: string;
  description: string;
  availableReports: number;
  href: string;
  icon: string;
};

export type StudentReportingTrendPoint = {
  label: string;
  inquiries: number;
  registrations: number;
  admissions: number;
  enrolled: number;
};

export type StudentReportingAttendanceTrendPoint = {
  date: string;
  percentage: number;
  present: number;
  absent: number;
};

export type StudentReportingClassStrength = {
  standardId?: string | null;
  standard: string;
  total: number;
  divisions: StudentReportingDivisionStrength[];
};

export type StudentReportingDivisionStrength = {
  divisionId?: string | null;
  division: string;
  total: number;
};

export type StudentReportingAlert = {
  id: string;
  severity: 'info' | 'warning' | 'critical' | 'success' | string;
  title: string;
  summary: string;
  count: number;
  actionLabel: string;
  actionHref: string;
};

export type StudentReportingQuickLink = {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: string;
};

export const parseStudentDashboardPayload = <T = StudentReportingDashboard>(
  preview?: StudentDashboardPreview
): T | undefined => {
  if (!preview?.payloadJson || preview.payloadJson === '{}') return undefined;

  try {
    return JSON.parse(preview.payloadJson) as T;
  } catch {
    return undefined;
  }
};

export const {
  useGetFilterStudentsQuery,
  useLazyGetFilterStudentsQuery,
  useChangeDivisionMutation,
  useGetAllStudentsQuery,
  useGetStudentByIdQuery,
  useGetStudentsByDivisionQuery,
  useLazyGetStudentsByDivisionQuery,
  useUploadStudentPhotoMutation,
  useGetStudentDashboardSummaryQuery,
  useGetStudentAttendanceDashboardSummaryQuery,
  useGetStudentDashboardPreviewQuery,
  useRefreshStudentDashboardPreviewMutation,
  useGetStudentAttendanceHistoryQuery,
  useGetStudentsByScopeQuery,
  useLazyGetStudentsByScopeQuery,
} = StudentApi;
