import { api } from 'src/redux/service';
import { studentAdmissionsCrmType as tags } from 'src/redux/tagTypes';

import { ASSESSMENTS_URL, unwrapAssessment } from './admission-assessment-types';

import type {
  AssessmentStageKey,
  ApplicationAssessment,
  AssessmentAttemptAction,
} from './admission-assessment-types';

const stageUrl = ({ applicationId, stageInstanceId }: AssessmentStageKey) =>
  `${ASSESSMENTS_URL}/applications/${applicationId}/stages/${stageInstanceId}`;
const assessmentTags = [tags.exam, tags.admissionApplication, tags.admissionApplicant];
export const admissionAssessmentsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getApplicationAssessment: builder.query<ApplicationAssessment, AssessmentStageKey>({
      query: stageUrl,
      transformResponse: unwrapAssessment<ApplicationAssessment>,
      providesTags: assessmentTags,
    }),
    bookAssessmentAttempt: builder.mutation<
      ApplicationAssessment,
      AssessmentStageKey & { sessionId?: string; slotStartsAt?: string; concurrencyStamp: string }
    >({
      query: ({ applicationId, stageInstanceId, ...body }) => ({
        url: `${stageUrl({ applicationId, stageInstanceId })}/attempts`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrapAssessment<ApplicationAssessment>,
      invalidatesTags: assessmentTags,
    }),
    recordAssessmentAttendance: builder.mutation<
      ApplicationAssessment,
      AssessmentAttemptAction & { attendance: 'present' | 'absent' }
    >({
      query: ({ attemptId, ...body }) => ({
        url: `${ASSESSMENTS_URL}/attempts/${attemptId}/attendance`,
        method: 'PUT',
        body,
      }),
      transformResponse: unwrapAssessment<ApplicationAssessment>,
      invalidatesTags: assessmentTags,
    }),
    recordAssessmentResult: builder.mutation<
      ApplicationAssessment,
      AssessmentAttemptAction & { marks?: number; outcome?: 'passed' | 'failed' }
    >({
      query: ({ attemptId, ...body }) => ({
        url: `${ASSESSMENTS_URL}/attempts/${attemptId}/result`,
        method: 'PUT',
        body,
      }),
      transformResponse: unwrapAssessment<ApplicationAssessment>,
      invalidatesTags: assessmentTags,
    }),
    allowAssessmentRetake: builder.mutation<ApplicationAssessment, AssessmentAttemptAction>({
      query: ({ attemptId, ...body }) => ({
        url: `${ASSESSMENTS_URL}/attempts/${attemptId}/retake`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrapAssessment<ApplicationAssessment>,
      invalidatesTags: assessmentTags,
    }),
    cancelAssessmentAttempt: builder.mutation<ApplicationAssessment, AssessmentAttemptAction>({
      query: ({ attemptId, ...body }) => ({
        url: `${ASSESSMENTS_URL}/attempts/${attemptId}/cancel`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrapAssessment<ApplicationAssessment>,
      invalidatesTags: assessmentTags,
    }),
    waiveApplicationAssessment: builder.mutation<
      ApplicationAssessment,
      AssessmentStageKey & { reason: string; concurrencyStamp: string }
    >({
      query: ({ applicationId, stageInstanceId, ...body }) => ({
        url: `${stageUrl({ applicationId, stageInstanceId })}/waive`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrapAssessment<ApplicationAssessment>,
      invalidatesTags: assessmentTags,
    }),
  }),
});

export const {
  useGetApplicationAssessmentQuery,
  useBookAssessmentAttemptMutation,
  useRecordAssessmentAttendanceMutation,
  useRecordAssessmentResultMutation,
  useAllowAssessmentRetakeMutation,
  useCancelAssessmentAttemptMutation,
  useWaiveApplicationAssessmentMutation,
} = admissionAssessmentsApi;
