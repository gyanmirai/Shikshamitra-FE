import { api } from 'src/redux/service';
import { studentAdmissionsCrmType } from 'src/redux/tagTypes';

import type { AdmissionInquiryManagement } from './admission-inquiry-management-api';

export type AdmissionApplicationFollowUps = AdmissionInquiryManagement & {
  canManageFollowUps: boolean;
};
export type ScheduleApplicationFollowUpInput = {
  applicationId: string;
  concurrencyStamp: string;
  scheduledAt: string;
  purpose: string;
  assignedCounsellorId?: string | null;
};
export type FinishApplicationFollowUpInput = {
  applicationId: string;
  followUpId: string;
  concurrencyStamp: string;
  followUpConcurrencyStamp: string;
  note: string;
};

const url = (id: string) => `/student/enrollment/admissions/applications/${id}/follow-ups`;
const unwrap = (
  response: AdmissionApplicationFollowUps | { data: AdmissionApplicationFollowUps }
) => ('data' in response ? response.data : response);
const tags = [
  studentAdmissionsCrmType.admissionApplication,
  studentAdmissionsCrmType.admissionInquiry,
];

export const admissionApplicationFollowUpsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionApplicationFollowUps: builder.query<AdmissionApplicationFollowUps, string>({
      query: url,
      transformResponse: unwrap,
      providesTags: tags,
    }),
    scheduleAdmissionApplicationFollowUp: builder.mutation<
      AdmissionApplicationFollowUps,
      ScheduleApplicationFollowUpInput
    >({
      query: ({ applicationId, ...body }) => ({ url: url(applicationId), method: 'POST', body }),
      transformResponse: unwrap,
      invalidatesTags: tags,
    }),
    completeAdmissionApplicationFollowUp: builder.mutation<
      AdmissionApplicationFollowUps,
      FinishApplicationFollowUpInput
    >({
      query: ({ applicationId, followUpId, ...body }) => ({
        url: `${url(applicationId)}/${followUpId}/complete`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrap,
      invalidatesTags: tags,
    }),
    cancelAdmissionApplicationFollowUp: builder.mutation<
      AdmissionApplicationFollowUps,
      FinishApplicationFollowUpInput
    >({
      query: ({ applicationId, followUpId, ...body }) => ({
        url: `${url(applicationId)}/${followUpId}/cancel`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrap,
      invalidatesTags: tags,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAdmissionApplicationFollowUpsQuery,
  useScheduleAdmissionApplicationFollowUpMutation,
  useCompleteAdmissionApplicationFollowUpMutation,
  useCancelAdmissionApplicationFollowUpMutation,
} = admissionApplicationFollowUpsApi;
