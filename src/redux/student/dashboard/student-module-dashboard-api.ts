import { api } from 'src/redux/service';
import { studentType } from 'src/redux/tagTypes';

import type {
  StudentDashboardSectionInput,
  StudentDashboardQueryIdentity,
  StudentModuleDashboardContext,
  StudentModuleDashboardSection,
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
      query: ({ section, academicYearId }) => ({
        url: `/students/dashboard/sections/${section}`,
        params: { academicYearId },
      }),
      transformResponse: (
        response: StudentModuleDashboardSection | { data: StudentModuleDashboardSection }
      ) => unwrap(response),
      providesTags: [{ type: studentType.student, id: 'MODULE-DASHBOARD' }],
      keepUnusedDataFor: 0,
    }),
  }),
});
export const {
  useGetStudentModuleDashboardContextQuery,
  useGetStudentModuleDashboardSectionQuery,
} = studentModuleDashboardApi;
