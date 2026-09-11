import { api } from 'src/redux/service';
import { studentAdmissionsCrmType as tags } from 'src/redux/tagTypes';

import { unwrapEligibility, eligibilityStageUrl } from './admission-eligibility-types';

import type {
  EligibilitySummary,
  EligibilityCommand,
  EligibilityStageKey,
  EligibilityEvaluation,
} from './admission-eligibility-types';

const eligibilityTags = [tags.admissionApplication];
export const admissionEligibilityApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getApplicationEligibility: builder.query<EligibilitySummary, EligibilityStageKey>({
      query: eligibilityStageUrl,
      transformResponse: unwrapEligibility<EligibilitySummary>,
      providesTags: eligibilityTags,
    }),
    getEligibilityHistory: builder.query<EligibilityEvaluation[], EligibilityStageKey>({
      query: (key) => `${eligibilityStageUrl(key)}/history`,
      transformResponse: unwrapEligibility<EligibilityEvaluation[]>,
      providesTags: eligibilityTags,
    }),
    evaluateAdmissionEligibility: builder.mutation<EligibilitySummary, EligibilityCommand>({
      query: ({ concurrencyStamp, ...key }) => ({
        url: `${eligibilityStageUrl(key)}/evaluate`,
        method: 'POST',
        body: { concurrencyStamp },
      }),
      transformResponse: unwrapEligibility<EligibilitySummary>,
      invalidatesTags: eligibilityTags,
    }),
    requestEligibilityException: builder.mutation<
      EligibilitySummary,
      EligibilityCommand & { evaluationId: string; reason: string }
    >({
      query: ({ evaluationId, concurrencyStamp, reason, ...key }) => ({
        url: `${eligibilityStageUrl(key)}/evaluations/${evaluationId}/exceptions`,
        method: 'POST',
        body: { concurrencyStamp, reason },
      }),
      transformResponse: unwrapEligibility<EligibilitySummary>,
      invalidatesTags: eligibilityTags,
    }),
    reviewEligibilityException: builder.mutation<
      EligibilitySummary,
      EligibilityCommand & {
        exceptionId: string;
        decision: 'approved' | 'rejected';
        reason: string;
      }
    >({
      query: ({ exceptionId, concurrencyStamp, decision, reason, ...key }) => ({
        url: `${eligibilityStageUrl(key)}/exceptions/${exceptionId}/review`,
        method: 'POST',
        body: { concurrencyStamp, decision, reason },
      }),
      transformResponse: unwrapEligibility<EligibilitySummary>,
      invalidatesTags: eligibilityTags,
    }),
  }),
});
export const {
  useGetApplicationEligibilityQuery,
  useGetEligibilityHistoryQuery,
  useEvaluateAdmissionEligibilityMutation,
  useRequestEligibilityExceptionMutation,
  useReviewEligibilityExceptionMutation,
} = admissionEligibilityApi;
