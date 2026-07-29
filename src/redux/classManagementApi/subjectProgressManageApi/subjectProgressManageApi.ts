import { classManagementType } from 'src/redux/tagTypes';

import { classManagementApi } from '../classManagementApi';

export const subjectProgressManageApi = classManagementApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubjects: builder.query<
      any,
      { academicMediumId: string; classId: string; divisionId?: string }
    >({
      query: ({ academicMediumId, classId, divisionId }) => ({
        url: `class-management/chapter-progress/subjects`,
        method: 'GET',
        params: {
          academicMediumId,
          classId,
          ...(divisionId ? { divisionId } : {}),
        },
      }),
      providesTags: [classManagementType.subjectProgress],
    }),
    getChaptersProgress: builder.query<
      any,
      {
        academicMediumId: string;
        classId: string;
        divisionId?: string;
        subjectId: string;
      }
    >({
      query: ({ academicMediumId, classId, divisionId, subjectId }) => ({
        url: 'class-management/chapter-progress',
        method: 'GET',
        params: {
          academicMediumId,
          classId,
          subjectId,
          ...(divisionId ? { divisionId } : {}),
        },
      }),
      providesTags: [classManagementType.subjectProgress],
    }),
    updateChapterProgress: builder.mutation<any, { chapterId: string; data: any }>({
      query: ({ chapterId, data }) => ({
        url: `class-management/chapters/${chapterId}/progress`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: [classManagementType.subjectProgress],
    }),
    getChapterProgressLogs: builder.query<any, { chapterId: string; divisionId?: string }>({
      query: ({ chapterId, divisionId }) => ({
        url: `class-management/chapters/${chapterId}/progress/logs`,
        method: 'GET',
        params: {
          divisionId,
        },
      }),
      providesTags: [classManagementType.subjectProgress],
    }),
    getEmployeeClasses: builder.query<any, { employeeId: string }>({
      query: ({ employeeId }) => ({
        url: `class-management/chapter-progress/employee/${employeeId}/classes`,
        method: 'GET',
      }),
      providesTags: [classManagementType.subjectProgress],
    }),
    getEmployeeDivisions: builder.query<any, { employeeId: string; classId?: string }>({
      query: ({ employeeId, classId }) => ({
        url: `class-management/chapter-progress/employee/${employeeId}/divisions`,
        method: 'GET',
        params: {
          ...(classId ? { classId } : {}),
        },
      }),
      providesTags: [classManagementType.subjectProgress],
    }),
    getEmployeeSubjectsProgress: builder.query<
      any,
      { employeeId: string; classId?: string; divisionId?: string }
    >({
      query: ({ employeeId, classId, divisionId }) => ({
        url: `class-management/chapter-progress/employee/${employeeId}/subjects-progress`,
        method: 'GET',
        params: {
          ...(classId ? { classId } : {}),
          ...(divisionId ? { divisionId } : {}),
        },
      }),
      providesTags: [classManagementType.subjectProgress],
    }),
  }),
});

export const {
  useGetSubjectsQuery,
  useGetChaptersProgressQuery,
  useUpdateChapterProgressMutation,
  useGetChapterProgressLogsQuery,
  useGetEmployeeClassesQuery,
  useGetEmployeeDivisionsQuery,
  useGetEmployeeSubjectsProgressQuery,
} = subjectProgressManageApi;
