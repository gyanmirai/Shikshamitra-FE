import { classManagementApi } from '../classManagementApi';

export const subjectProgressManageApi = classManagementApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubjects: builder.query<any, { academicMediumId: string; classId: string }>({
      query: (params) => ({
        url: 'subjects',
        method: 'GET',
        params,
      }),
      providesTags: ['SubjectProgress'],
    }),
    getChaptersProgress: builder.query<
      any,
      {
        academicMediumId: string;
        classId: string;
        divisionId: string;
        subjectId: string;
        search?: string;
      }
    >({
      query: (params) => ({
        url: 'chapters/progress',
        method: 'GET',
        params,
      }),
      providesTags: ['SubjectProgress'],
    }),
    updateChapterProgress: builder.mutation<any, { chapterId: string; data: any }>({
      query: ({ chapterId, data }) => ({
        url: `chapters/${chapterId}/progress`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['SubjectProgress'],
    }),
  }),
});

export const {
  useGetSubjectsQuery,
  useGetChaptersProgressQuery,
  useUpdateChapterProgressMutation,
} = subjectProgressManageApi;
