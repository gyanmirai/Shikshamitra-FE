import { api } from 'src/redux/service';
import { studentAdmissionsCrmType as tags } from 'src/redux/tagTypes';

import { ASSESSMENTS_URL, unwrapAssessment } from './admission-assessment-types';

import type {
  AssessmentScope,
  AssessmentSession,
  AssessmentSessionInput,
} from './admission-assessment-types';

const sessionTags = [tags.exam, tags.admissionApplication];
export const admissionAssessmentSessionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAssessmentScopes: builder.query<AssessmentScope[], void>({
      query: () => `${ASSESSMENTS_URL}/scopes`,
      transformResponse: unwrapAssessment<AssessmentScope[]>,
      providesTags: [tags.exam, tags.admissionOffering, tags.admissionWorkflow],
    }),
    getAssessmentSessions: builder.query<
      AssessmentSession[],
      {
        admissionOfferingId: string;
        workflowStageDefinitionId: string;
      }
    >({
      query: (params) => ({ url: `${ASSESSMENTS_URL}/sessions`, params }),
      transformResponse: unwrapAssessment<AssessmentSession[]>,
      providesTags: [tags.exam],
    }),
    createAssessmentSession: builder.mutation<AssessmentSession, AssessmentSessionInput>({
      query: (body) => ({ url: `${ASSESSMENTS_URL}/sessions`, method: 'POST', body }),
      transformResponse: unwrapAssessment<AssessmentSession>,
      invalidatesTags: sessionTags,
    }),
    updateAssessmentSession: builder.mutation<
      AssessmentSession,
      { id: string; body: AssessmentSessionInput }
    >({
      query: ({ id, body }) => ({ url: `${ASSESSMENTS_URL}/sessions/${id}`, method: 'PUT', body }),
      transformResponse: unwrapAssessment<AssessmentSession>,
      invalidatesTags: sessionTags,
    }),
    cancelAssessmentSession: builder.mutation<
      AssessmentSession,
      { id: string; concurrencyStamp: string }
    >({
      query: ({ id, ...body }) => ({
        url: `${ASSESSMENTS_URL}/sessions/${id}/cancel`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrapAssessment<AssessmentSession>,
      invalidatesTags: sessionTags,
    }),
  }),
});

export const {
  useGetAssessmentScopesQuery,
  useGetAssessmentSessionsQuery,
  useCreateAssessmentSessionMutation,
  useUpdateAssessmentSessionMutation,
  useCancelAssessmentSessionMutation,
} = admissionAssessmentSessionsApi;
