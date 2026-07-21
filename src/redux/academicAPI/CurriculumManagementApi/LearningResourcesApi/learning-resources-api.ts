import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

export enum LearningResourceStatus {
  Draft = 0,
  Submitted = 1,
  Published = 2,
  Rejected = 3,
  Archived = 4,
}

export enum LearningResourceVisibility {
  Private = 0,
  Teachers = 1,
  Students = 2,
  Public = 3,
}

export type DocumentDto = {
  blobName?: string | null;
  fileName?: string | null;
  contentType?: string | null;
  size?: number | null;
};

export type LearningResourceDto = {
  id: string;
  standardId: string;
  standardName?: string | null;
  subjectId: string;
  subjectName?: string | null;
  chapterId: string;
  chapterName?: string | null;
  divisionId?: string | null;
  divisionName?: string | null;
  resourceTitle: string;
  topic?: string | null;
  resourceType: string;
  blobName: string;
  fileName: string;
  contentType: string;
  size: number;
  status: LearningResourceStatus;
  visibility: LearningResourceVisibility;
  submittedBy?: string | null;
  submittedAt?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reviewRemarks?: string | null;
  publishedAt?: string | null;
  archiveReason?: string | null;
};

export type LearningResourceListParams = {
  standardId?: string;
  subjectId?: string;
  chapterId?: string;
  divisionId?: string;
  status?: LearningResourceStatus;
  visibility?: LearningResourceVisibility;
  search?: string;
};

export type CreateUpdateLearningResourceDto = {
  standardId: string;
  subjectId: string;
  chapterId: string;
  divisionId?: string | null;
  resourceTitle: string;
  topic?: string | null;
  resourceType?: string;
  blobName?: string | null;
  fileName?: string | null;
  contentType?: string | null;
  size?: number | null;
  visibility?: LearningResourceVisibility;
  learningResource?: DocumentDto | null;
};

export type LearningResourceReviewDto = {
  remarks?: string | null;
};

export type LearningResourceArchiveDto = {
  reason: string;
};

export type LearningResourceHealthDto = {
  totalResources: number;
  draftResources: number;
  submittedResources: number;
  publishedResources: number;
  rejectedResources: number;
  archivedResources: number;
  brokenTargetCount: number;
  warnings: string[];
};

export const learningResourcesApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    getLearningResources: builder.query<LearningResourceDto[], LearningResourceListParams | void>({
      query: (params) => ({
        url: '/academic/learning-resources',
        method: 'GET',
        params: params ?? undefined,
      }),
      providesTags: [academicType.learningResource],
    }),

    getLearningResourceById: builder.query<LearningResourceDto, string>({
      query: (id) => ({
        url: `/academic/learning-resources/${id}`,
        method: 'GET',
      }),
      providesTags: [academicType.learningResource],
    }),

    addLearningResource: builder.mutation<LearningResourceDto, CreateUpdateLearningResourceDto>({
      query: (body) => ({
        url: '/academic/learning-resources',
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.learningResource],
    }),

    updateLearningResource: builder.mutation<
      LearningResourceDto,
      { id: string; body: CreateUpdateLearningResourceDto }
    >({
      query: ({ id, body }) => ({
        url: `/academic/learning-resources/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [academicType.learningResource],
    }),

    submitLearningResource: builder.mutation<void, string>({
      query: (id) => ({
        url: `/academic/learning-resources/${id}/submit`,
        method: 'POST',
      }),
      invalidatesTags: [academicType.learningResource],
    }),

    publishLearningResource: builder.mutation<
      void,
      { id: string; body?: LearningResourceReviewDto }
    >({
      query: ({ id, body }) => ({
        url: `/academic/learning-resources/${id}/publish`,
        method: 'POST',
        body: body ?? {},
      }),
      invalidatesTags: [academicType.learningResource],
    }),

    rejectLearningResource: builder.mutation<void, { id: string; body: LearningResourceReviewDto }>(
      {
        query: ({ id, body }) => ({
          url: `/academic/learning-resources/${id}/reject`,
          method: 'POST',
          body,
        }),
        invalidatesTags: [academicType.learningResource],
      }
    ),

    archiveLearningResource: builder.mutation<
      void,
      { id: string; body: LearningResourceArchiveDto }
    >({
      query: ({ id, body }) => ({
        url: `/academic/learning-resources/${id}/archive`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.learningResource],
    }),

    restoreLearningResource: builder.mutation<void, string>({
      query: (id) => ({
        url: `/academic/learning-resources/${id}/restore`,
        method: 'POST',
      }),
      invalidatesTags: [academicType.learningResource],
    }),

    getLearningResourceHealth: builder.query<
      LearningResourceHealthDto,
      LearningResourceListParams | void
    >({
      query: (params) => ({
        url: '/academic/learning-resources/health',
        method: 'GET',
        params: params ?? undefined,
      }),
      providesTags: [academicType.learningResource],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLearningResourcesQuery,
  useGetLearningResourceByIdQuery,
  useAddLearningResourceMutation,
  useUpdateLearningResourceMutation,
  useSubmitLearningResourceMutation,
  usePublishLearningResourceMutation,
  useRejectLearningResourceMutation,
  useArchiveLearningResourceMutation,
  useRestoreLearningResourceMutation,
  useGetLearningResourceHealthQuery,
} = learningResourcesApi;
