import { classManagementType } from 'src/redux/tagTypes';

import { classManagementApi } from '../classManagementApi';

export const subjectProgressManageApi = classManagementApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubjects: builder.query<
      any,
      { academicMediumId: string; classId: string; divisionId?: string }
    >({
      query: ({ academicMediumId, classId, divisionId }) => ({
        url: `/subjects`,
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
        url: 'chapters/progress',
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
        url: `chapters/${chapterId}/progress`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: [classManagementType.subjectProgress],
    }),
  }),
});

export const {
  useGetSubjectsQuery,
  useGetChaptersProgressQuery,
  useUpdateChapterProgressMutation,
} = subjectProgressManageApi;
