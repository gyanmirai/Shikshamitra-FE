import { api } from 'src/redux/service';
import { studentType } from 'src/redux/tagTypes';

import type {
  StudentDashboardSectionInput,
  StudentDashboardQueryIdentity,
  StudentModuleDashboardContext,
  StudentModuleDashboardSection,
  StudentDashboardFilterOptions,
} from './student-module-dashboard-types';

const unwrap = <T>(response: T | { data: T }): T =>
  response && typeof response === 'object' && 'data' in response ? response.data : (response as T);
export const studentModuleDashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStudentModuleDashboardContext: builder.query<
      StudentModuleDashboardContext,
      StudentDashboardQueryIdentity
    >({
      query: () => '/students/dashboard/context',
      transformResponse: (
        response: StudentModuleDashboardContext | { data: StudentModuleDashboardContext }
      ) => unwrap(response),
      keepUnusedDataFor: 0,
      providesTags: [{ type: studentType.student, id: 'MODULE-DASHBOARD' }],
    }),
    getStudentModuleDashboardSection: builder.query<
      StudentModuleDashboardSection,
      StudentDashboardSectionInput
    >({
      query: ({ section, academicYearId, boardId, mediumId, standardId, divisionId }) => ({
        url: `/students/dashboard/sections/${section}`,
        params: { academicYearId, boardId, mediumId, standardId, divisionId },
      }),
      transformResponse: (
        response: StudentModuleDashboardSection | { data: StudentModuleDashboardSection }
      ) => unwrap(response),
      providesTags: (_result, _error, { section }) => [
        { type: studentType.student, id: 'MODULE-DASHBOARD' },
        { type: studentType.student, id: `MODULE-DASHBOARD-${section}` },
      ],
      keepUnusedDataFor: 0,
    }),
    getStudentModuleDashboardFilters: builder.query<
      StudentDashboardFilterOptions,
      StudentDashboardQueryIdentity & { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: '/students/dashboard/filters',
        params: { academicYearId },
      }),
      transformResponse: (
        response: StudentDashboardFilterOptions | { data: StudentDashboardFilterOptions }
      ) => unwrap(response),
      keepUnusedDataFor: 0,
      providesTags: [{ type: studentType.student, id: 'MODULE-DASHBOARD' }],
    }),
  }),
});
export const {
  useGetStudentModuleDashboardContextQuery,
  useGetStudentModuleDashboardSectionQuery,
  useGetStudentModuleDashboardFiltersQuery,
} = studentModuleDashboardApi;
