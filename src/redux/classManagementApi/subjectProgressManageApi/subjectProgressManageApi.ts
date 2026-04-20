import { classManagementType } from 'src/redux/tagTypes';

import { classManagementApi } from '../classManagementApi';

export const subjectProgressManageApi = classManagementApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubjects: builder.query<any, { academicMediumId: string; classId: string }>({
      query: ({ academicMediumId, classId }) => ({
        url: `/academic-mediums/${academicMediumId}/subjects`,
        method: 'GET',
      }),
      providesTags: [classManagementType.subjectProgress],
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
