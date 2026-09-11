import { api } from 'src/redux/service';
import { studentAdmissionsCrmType as tags } from 'src/redux/tagTypes';

import { REVIEW_URL, unwrapReview, reviewStageUrl } from './admission-review-types';

import type {
  ReviewDraft,
  ReviewRecord,
  ReviewSummary,
  ReviewCommand,
  ReviewStageKey,
  ReviewQueueItem,
  ReviewQueueInput,
} from './admission-review-types';

const reviewTags = [tags.admissionApplication];
export const admissionReviewApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getApplicationReview: builder.query<ReviewSummary, ReviewStageKey>({
      query: reviewStageUrl,
      transformResponse: unwrapReview<ReviewSummary>,
      providesTags: reviewTags,
    }),
    getAdmissionReviewHistory: builder.query<ReviewRecord[], ReviewStageKey>({
      query: (key) => `${reviewStageUrl(key)}/history`,
      transformResponse: unwrapReview<ReviewRecord[]>,
      providesTags: reviewTags,
    }),
    saveAdmissionReviewDraft: builder.mutation<ReviewSummary, ReviewCommand & ReviewDraft>({
      query: ({ applicationId, stageId, ...body }) => ({
        url: `${reviewStageUrl({ applicationId, stageId })}/draft`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrapReview<ReviewSummary>,
      invalidatesTags: reviewTags,
    }),
    submitAdmissionReview: builder.mutation<ReviewSummary, ReviewCommand & ReviewDraft>({
      query: ({ applicationId, stageId, ...body }) => ({
        url: `${reviewStageUrl({ applicationId, stageId })}/submit`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrapReview<ReviewSummary>,
      invalidatesTags: reviewTags,
    }),
    assignAdmissionReview: builder.mutation<
      ReviewSummary,
      ReviewCommand & {
        assignedReviewerId: string | null;
        dueAt: string | null;
        reason: string;
      }
    >({
      query: ({ applicationId, stageId, ...body }) => ({
        url: `${reviewStageUrl({ applicationId, stageId })}/assignment`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrapReview<ReviewSummary>,
      invalidatesTags: reviewTags,
    }),
    requestAdmissionReviewCorrection: builder.mutation<
      ReviewSummary,
      ReviewCommand & { reason: string }
    >({
      query: ({ applicationId, stageId, ...body }) => ({
        url: `${reviewStageUrl({ applicationId, stageId })}/request-correction`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrapReview<ReviewSummary>,
      invalidatesTags: reviewTags,
    }),
    getAdmissionReviewQueue: builder.query<
      { items: ReviewQueueItem[]; totalCount: number },
      ReviewQueueInput
    >({
      query: (params) => ({ url: `${REVIEW_URL}/queue`, params }),
      transformResponse: unwrapReview<{ items: ReviewQueueItem[]; totalCount: number }>,
      providesTags: reviewTags,
    }),
  }),
});
export const {
  useGetApplicationReviewQuery,
  useGetAdmissionReviewHistoryQuery,
  useSaveAdmissionReviewDraftMutation,
  useSubmitAdmissionReviewMutation,
  useAssignAdmissionReviewMutation,
  useRequestAdmissionReviewCorrectionMutation,
  useGetAdmissionReviewQueueQuery,
} = admissionReviewApi;
