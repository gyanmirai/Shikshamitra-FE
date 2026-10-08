import { api } from 'src/redux/service';
import { studentAdmissionsCrmType } from 'src/redux/tagTypes';

import type { AdmissionInquiryPolicy } from './admission-inquiry-policy';

export type InquiryOutcome = 0 | 1 | 2 | 3 | 4;
export type InquiryFollowUp = {
  id: string;
  assignedCounsellorId: string | null;
  scheduledAt: string;
  purpose: string;
  status: 0 | 1 | 2;
  completedAt: string | null;
  completedBy: string | null;
  completionNote: string | null;
  concurrencyStamp: string;
};
export type InquiryQualificationAnswer = { code: string; passed: boolean; notes?: string | null };
export type InquiryFollowUpNote = {
  id: string;
  occurredAt: string;
  note: string;
  status: 0 | 2 | 6 | null;
  reminderAt: string | null;
  authorName: string | null;
};
export type RecordInquiryFollowUpNoteInput = {
  inquiryId: string;
  concurrencyStamp: string;
  inquiryConcurrencyStamp: string;
  note: string;
  status: 0 | 2 | 6;
  reminderAt: string | null;
};
export type AdmissionInquiryManagement = {
  inquiryId: string;
  managed: boolean;
  policy: AdmissionInquiryPolicy | null;
  concurrencyStamp: string;
  assignedCounsellorId: string | null;
  firstContactDueAt: string | null;
  qualificationDueAt: string | null;
  lastContactAt: string | null;
  nextReminderAt?: string | null;
  contactCount: number;
  outcome: InquiryOutcome | null;
  outcomeReason: string | null;
  outcomeReasonCode: string | null;
  outcomeAt: string | null;
  outcomeBy: string | null;
  isOverdue: boolean;
  isLocked: boolean;
  canStartApplication: boolean;
  canReassign?: boolean;
  status?: 0 | 2 | 6;
  qualificationEmailStatus?: string | null;
  qualificationEmailMessage?: string | null;
  blockers: string[];
  qualificationAnswers: InquiryQualificationAnswer[];
  followUps: InquiryFollowUp[];
  notes?: InquiryFollowUpNote[];
};
type Stamp = { concurrencyStamp: string };
type FinishFollowUp = Stamp & {
  inquiryId: string;
  followUpId: string;
  followUpConcurrencyStamp: string;
  note: string;
};
type Result<T> = T | { data: T };
const unwrap = <T>(response: Result<T>) =>
  'data' in (response as { data?: T }) ? (response as { data: T }).data : (response as T);
const url = (id: string) => `/student/enrollment/admissions/inquiries/${id}/management`;
const tags = [studentAdmissionsCrmType.admissionInquiry];

export const admissionInquiryManagementApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionInquiryManagement: builder.query<AdmissionInquiryManagement, string>({
      query: url,
      transformResponse: unwrap<AdmissionInquiryManagement>,
      providesTags: tags,
    }),
    recordAdmissionInquiryFollowUpNote: builder.mutation<
      AdmissionInquiryManagement,
      RecordInquiryFollowUpNoteInput
    >({
      query: ({ inquiryId, ...body }) => ({
        url: `${url(inquiryId)}/follow-up-notes`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrap<AdmissionInquiryManagement>,
      invalidatesTags: tags,
    }),
    recordAdmissionInquiryContact: builder.mutation<
      AdmissionInquiryManagement,
      Stamp & {
        inquiryId: string;
        channel: string;
        direction: string;
        outcome: string;
        note: string;
        contactedAt?: string;
      }
    >({
      query: ({ inquiryId, ...body }) => ({
        url: `${url(inquiryId)}/contact`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrap<AdmissionInquiryManagement>,
      invalidatesTags: tags,
    }),
    scheduleAdmissionInquiryFollowUp: builder.mutation<
      AdmissionInquiryManagement,
      Stamp & {
        inquiryId: string;
        scheduledAt: string;
        purpose: string;
        assignedCounsellorId?: string | null;
      }
    >({
      query: ({ inquiryId, ...body }) => ({
        url: `${url(inquiryId)}/follow-ups`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrap<AdmissionInquiryManagement>,
      invalidatesTags: tags,
    }),
    completeAdmissionInquiryFollowUp: builder.mutation<AdmissionInquiryManagement, FinishFollowUp>({
      query: ({ inquiryId, followUpId, ...body }) => ({
        url: `${url(inquiryId)}/follow-ups/${followUpId}/complete`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrap<AdmissionInquiryManagement>,
      invalidatesTags: tags,
    }),
    cancelAdmissionInquiryFollowUp: builder.mutation<AdmissionInquiryManagement, FinishFollowUp>({
      query: ({ inquiryId, followUpId, ...body }) => ({
        url: `${url(inquiryId)}/follow-ups/${followUpId}/cancel`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrap<AdmissionInquiryManagement>,
      invalidatesTags: tags,
    }),
    qualifyAdmissionInquiry: builder.mutation<
      AdmissionInquiryManagement,
      Stamp & {
        inquiryId: string;
        outcome: InquiryOutcome;
        reasonCode?: string | null;
        reason: string;
        duplicateOfId?: string | null;
        answers: InquiryQualificationAnswer[];
      }
    >({
      query: ({ inquiryId, ...body }) => ({
        url: `${url(inquiryId)}/qualification`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrap<AdmissionInquiryManagement>,
      invalidatesTags: tags,
    }),
    reopenAdmissionInquiryQualification: builder.mutation<
      AdmissionInquiryManagement,
      Stamp & { inquiryId: string; reason: string }
    >({
      query: ({ inquiryId, ...body }) => ({
        url: `${url(inquiryId)}/reopen`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrap<AdmissionInquiryManagement>,
      invalidatesTags: tags,
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAdmissionInquiryManagementQuery,
  useRecordAdmissionInquiryFollowUpNoteMutation,
  useRecordAdmissionInquiryContactMutation,
  useScheduleAdmissionInquiryFollowUpMutation,
  useCompleteAdmissionInquiryFollowUpMutation,
  useCancelAdmissionInquiryFollowUpMutation,
  useQualifyAdmissionInquiryMutation,
  useReopenAdmissionInquiryQualificationMutation,
} = admissionInquiryManagementApi;
