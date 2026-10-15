import { api } from 'src/redux/service';
import { studentAdmissionsCrmType as tags } from 'src/redux/tagTypes';

import { ASSESSMENTS_URL, unwrapAssessment } from './admission-assessment-types';

import type {
  AssessmentSession,
  AssessmentSessionList,
  AssessmentSessionStaff,
  AssessmentInterviewSlot,
  AssessmentBookingPreview,
  AssessmentSelectedBooking,
  AssessmentSessionListQuery,
  AssessmentSessionResources,
  AssessmentSharedSessionInput,
  AssessmentSessionConfirmation,
} from './admission-assessment-types';

const assessmentTags = [tags.exam, tags.admissionApplication, tags.admissionApplicant];
export const admissionAssessmentPlanningApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAssessmentSessionWorkbench: builder.query<AssessmentSessionList, AssessmentSessionListQuery>(
      {
        query: (params) => ({ url: `${ASSESSMENTS_URL}/sessions/workbench`, params }),
        transformResponse: unwrapAssessment<AssessmentSessionList>,
        providesTags: [tags.exam],
      }
    ),
    getAssessmentSessionById: builder.query<AssessmentSession, string>({
      query: (id) => `${ASSESSMENTS_URL}/sessions/${id}`,
      transformResponse: unwrapAssessment<AssessmentSession>,
      providesTags: [tags.exam],
    }),
    getAssessmentSessionResources: builder.query<AssessmentSessionResources, void>({
      query: () => `${ASSESSMENTS_URL}/session-resources`,
      transformResponse: unwrapAssessment<AssessmentSessionResources>,
      providesTags: [tags.exam],
    }),
    getAssessmentSessionSlots: builder.query<AssessmentInterviewSlot[], string>({
      query: (id) => `${ASSESSMENTS_URL}/sessions/${id}/slots`,
      transformResponse: unwrapAssessment<AssessmentInterviewSlot[]>,
      providesTags: [tags.exam],
    }),
    getAssessmentInterviewers: builder.query<AssessmentSessionStaff[], string>({
      query: (search) => ({ url: `${ASSESSMENTS_URL}/interviewers`, params: { search } }),
      transformResponse: unwrapAssessment<AssessmentSessionStaff[]>,
    }),
    previewAssessmentSession: builder.mutation<
      AssessmentBookingPreview,
      {
        session: AssessmentSharedSessionInput;
        sessionId?: string;
        sessionConcurrencyStamp?: string;
        skipCount: number;
        maxResultCount: number;
        search?: string;
      }
    >({
      query: (body) => ({ url: `${ASSESSMENTS_URL}/sessions/preview`, method: 'POST', body }),
      transformResponse: unwrapAssessment<AssessmentBookingPreview>,
    }),
    confirmAssessmentSession: builder.mutation<
      AssessmentSessionConfirmation,
      {
        session: AssessmentSharedSessionInput;
        sessionId?: string;
        sessionConcurrencyStamp?: string;
        idempotencyKey: string;
        previewFingerprint: string;
        bookings: AssessmentSelectedBooking[];
      }
    >({
      query: (body) => ({ url: `${ASSESSMENTS_URL}/sessions/confirm`, method: 'POST', body }),
      transformResponse: unwrapAssessment<AssessmentSessionConfirmation>,
      invalidatesTags: assessmentTags,
    }),
    updateSharedAssessmentSession: builder.mutation<
      AssessmentSession,
      { id: string; body: AssessmentSharedSessionInput }
    >({
      query: ({ id, body }) => ({ url: `${ASSESSMENTS_URL}/sessions/${id}`, method: 'PUT', body }),
      transformResponse: unwrapAssessment<AssessmentSession>,
      invalidatesTags: assessmentTags,
    }),
    cancelSharedAssessmentSession: builder.mutation<
      AssessmentSession,
      { id: string; concurrencyStamp: string; cancelPendingBookings: boolean; notes: string }
    >({
      query: ({ id, ...body }) => ({
        url: `${ASSESSMENTS_URL}/sessions/${id}/cancel`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrapAssessment<AssessmentSession>,
      invalidatesTags: assessmentTags,
    }),
  }),
});

export const {
  useGetAssessmentSessionWorkbenchQuery,
  useGetAssessmentSessionByIdQuery,
  useGetAssessmentSessionResourcesQuery,
  useGetAssessmentSessionSlotsQuery,
  useLazyGetAssessmentInterviewersQuery,
  usePreviewAssessmentSessionMutation,
  useConfirmAssessmentSessionMutation,
  useUpdateSharedAssessmentSessionMutation,
  useCancelSharedAssessmentSessionMutation,
} = admissionAssessmentPlanningApi;
