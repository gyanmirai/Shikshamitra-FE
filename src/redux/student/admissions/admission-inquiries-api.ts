import { api } from 'src/redux/service';
import { studentAdmissionsCrmType } from 'src/redux/tagTypes';

export type AdmissionInquiryStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type AdmissionInquirySource = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type AdmissionInquiryWorkQueue = 1 | 2 | 3 | 4;
export type AdmissionInquiry = {
  id: string;
  concurrencyStamp: string;
  inquiryNumber: string;
  admissionCycleId: string;
  admissionOfferingId?: string | null;
  applicantId?: string | null;
  assignedCounsellorId?: string | null;
  assignedCounsellorName?: string | null;
  admissionCycleName: string;
  admissionOfferingCode?: string | null;
  applicantName: string;
  normalizedPhone: string;
  email?: string | null;
  preferredLanguageCode: string;
  source: AdmissionInquirySource;
  sourceDetail?: string | null;
  status: AdmissionInquiryStatus;
  contactedAt?: string | null;
  lastActivityAt?: string | null;
  creationTime: string;
  managed: boolean;
  needsFirstContact: boolean;
  needsQualification: boolean;
  lastContactAt?: string | null;
  firstContactDueAt?: string | null;
  qualificationDueAt?: string | null;
  qualificationOutcome?: 0 | 1 | 2 | 3 | 4 | null;
  nextFollowUpAt?: string | null;
  openFollowUpCount: number;
  isFirstContactOverdue: boolean;
  isQualificationOverdue: boolean;
  hasOverdueFollowUp: boolean;
  isOverdue: boolean;
};
export type AdmissionInquiryListInput = {
  admissionCycleId?: string;
  admissionOfferingId?: string;
  status?: AdmissionInquiryStatus;
  source?: AdmissionInquirySource;
  assignedCounsellorId?: string;
  isAssigned?: boolean;
  workQueue?: AdmissionInquiryWorkQueue;
  search?: string;
  sorting?: string;
  skipCount?: number;
  maxResultCount?: number;
};
export type AdmissionInquiryCounsellor = { id: string; userName: string; name: string };
export type AssignAdmissionInquiryCounsellor = {
  mode: 0 | 1;
  counsellorId?: string | null;
  candidateCounsellorIds: string[];
};
export type AdmissionInquiryCommunicationChannel = 0 | 1 | 2;
export type AdmissionInquiryCommunicationStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type CreateAdmissionInquiryCommunication = {
  title: string;
  subject?: string | null;
  body: string;
  channels: AdmissionInquiryCommunicationChannel[];
  importanceLevel: 0 | 1 | 2;
  requiresAcknowledgement: boolean;
  publishImmediately: boolean;
};
export type AdmissionInquiryCommunicationResult = {
  campaignId: string;
  status: AdmissionInquiryCommunicationStatus;
  deliveryStarted: boolean;
  recipientCount: number;
  eligibleRecipientCount: number;
  blockedRecipientCount: number;
  message: string;
  deliveryErrorCode?: string | null;
};
export type CreateAdmissionInquiry = {
  admissionCycleId: string;
  admissionOfferingId?: string | null;
  existingFamilyId?: string | null;
  createSeparateFamily?: boolean;
  duplicateOverrideReason?: string | null;
  applicantName: string;
  phone: string;
  email?: string | null;
  preferredLanguageCode: string;
  source: AdmissionInquirySource;
  sourceDetail?: string | null;
  guardianFirstName: string;
  guardianLastName?: string | null;
  guardianPhone: string;
  guardianEmail?: string | null;
  applicantFirstName: string;
  applicantLastName?: string | null;
  applicantDateOfBirth?: string | null;
  formValues?: { fieldCode: string; valueJson?: string | null }[];
};
export type DuplicateMatch = {
  applicantId: string;
  familyId: string;
  existingInquiryId?: string | null;
  existingInquiryNumber?: string | null;
  applicantName: string;
  guardianPhone?: string | null;
  guardianEmail?: string | null;
  dateOfBirth?: string | null;
};
export type UpdateAdmissionInquiry = {
  applicantName: string;
  phone: string;
  email?: string | null;
  preferredLanguageCode: string;
  source: AdmissionInquirySource;
  sourceDetail?: string | null;
  concurrencyStamp: string;
};
export type AdmissionInquiryTimelineItem = {
  id: string;
  activityType: string;
  description: string;
  occurredAt: string;
  creatorId?: string | null;
};
export type BulkAdmissionInquiryResult = {
  requestedCount: number;
  updatedCount: number;
  failedInquiryIds: string[];
};
type Result<T> = { data?: T };
const unwrap = <T>(response: Result<T> | T): T => {
  if (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    response.data !== undefined
  )
    return response.data;
  return response as T;
};
export const admissionInquiriesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionInquiry: builder.query<AdmissionInquiry, string>({
      query: (id) => `/student/enrollment/admissions/inquiries/${id}`,
      transformResponse: (response: Result<AdmissionInquiry> | AdmissionInquiry) =>
        unwrap(response),
      providesTags: [studentAdmissionsCrmType.admissionInquiry],
    }),
    getAdmissionInquiries: builder.query<
      { totalCount: number; items: AdmissionInquiry[] },
      AdmissionInquiryListInput
    >({
      query: (params) => ({ url: '/student/enrollment/admissions/inquiries', params }),
      transformResponse: (
        response:
          | Result<{ totalCount: number; items: AdmissionInquiry[] }>
          | { totalCount: number; items: AdmissionInquiry[] }
      ) => unwrap(response),
      providesTags: [studentAdmissionsCrmType.admissionInquiry],
    }),
    markAdmissionInquiryContacted: builder.mutation<AdmissionInquiry, string>({
      query: (id) => ({
        url: `/student/enrollment/admissions/inquiries/${id}/contacted`,
        method: 'POST',
      }),
      transformResponse: (response: Result<AdmissionInquiry> | AdmissionInquiry) =>
        unwrap(response),
      invalidatesTags: [studentAdmissionsCrmType.admissionInquiry],
    }),
    createAdmissionInquiry: builder.mutation<AdmissionInquiry, CreateAdmissionInquiry>({
      query: (body) => ({ url: '/student/enrollment/admissions/inquiries', method: 'POST', body }),
      transformResponse: (response: Result<AdmissionInquiry> | AdmissionInquiry) =>
        unwrap(response),
      invalidatesTags: [
        studentAdmissionsCrmType.admissionInquiry,
        studentAdmissionsCrmType.admissionApplicant,
      ],
    }),
    updateAdmissionInquiry: builder.mutation<
      AdmissionInquiry,
      { id: string; body: UpdateAdmissionInquiry }
    >({
      query: ({ id, body }) => ({
        url: `/student/enrollment/admissions/inquiries/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: Result<AdmissionInquiry> | AdmissionInquiry) =>
        unwrap(response),
      invalidatesTags: [studentAdmissionsCrmType.admissionInquiry],
    }),
    getAdmissionInquiryTimeline: builder.query<AdmissionInquiryTimelineItem[], string>({
      query: (id) => `/student/enrollment/admissions/inquiries/${id}/timeline`,
      transformResponse: (
        response: Result<AdmissionInquiryTimelineItem[]> | AdmissionInquiryTimelineItem[]
      ) => unwrap(response),
      providesTags: [studentAdmissionsCrmType.admissionInquiry],
    }),
    exportAdmissionInquiries: builder.query<Blob, AdmissionInquiryListInput>({
      query: (params) => ({
        url: '/student/enrollment/admissions/inquiries/export',
        params,
        responseHandler: (response) => response.blob(),
      }),
    }),
    checkAdmissionInquiryDuplicates: builder.mutation<
      DuplicateMatch[],
      {
        admissionCycleId: string;
        guardianPhone: string;
        guardianEmail?: string;
        applicantName: string;
        applicantDateOfBirth?: string;
      }
    >({
      query: (body) => ({
        url: '/student/enrollment/admissions/inquiries/duplicate-check',
        method: 'POST',
        body,
      }),
      transformResponse: (response: Result<DuplicateMatch[]> | DuplicateMatch[]) =>
        unwrap(response),
    }),
    getAdmissionInquiryAssignableCounsellors: builder.query<
      AdmissionInquiryCounsellor[],
      { admissionOfferingId?: string; filter?: string } | void
    >({
      query: (params) => ({
        url: '/student/enrollment/admissions/inquiries/counsellors',
        params: params || undefined,
      }),
      transformResponse: (
        response: Result<AdmissionInquiryCounsellor[]> | AdmissionInquiryCounsellor[]
      ) => unwrap(response),
      providesTags: [studentAdmissionsCrmType.admissionInquiry],
    }),
    assignAdmissionInquiryCounsellor: builder.mutation<
      AdmissionInquiry,
      { id: string; body: AssignAdmissionInquiryCounsellor }
    >({
      query: ({ id, body }) => ({
        url: `/student/enrollment/admissions/inquiries/${id}/assign`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: Result<AdmissionInquiry> | AdmissionInquiry) =>
        unwrap(response),
      invalidatesTags: [studentAdmissionsCrmType.admissionInquiry],
    }),
    bulkAssignAdmissionInquiryCounsellor: builder.mutation<
      BulkAdmissionInquiryResult,
      { inquiryIds: string[]; assignment: AssignAdmissionInquiryCounsellor }
    >({
      query: (body) => ({
        url: '/student/enrollment/admissions/inquiries/bulk/assign',
        method: 'POST',
        body,
      }),
      transformResponse: (
        response: Result<BulkAdmissionInquiryResult> | BulkAdmissionInquiryResult
      ) => unwrap(response),
      invalidatesTags: [studentAdmissionsCrmType.admissionInquiry],
    }),
    createAdmissionInquiryCommunication: builder.mutation<
      AdmissionInquiryCommunicationResult,
      { id: string; body: CreateAdmissionInquiryCommunication }
    >({
      query: ({ id, body }) => ({
        url: `/student/enrollment/admissions/inquiries/${id}/communications`,
        method: 'POST',
        body,
      }),
      transformResponse: (
        response: Result<AdmissionInquiryCommunicationResult> | AdmissionInquiryCommunicationResult
      ) => unwrap(response),
      invalidatesTags: [studentAdmissionsCrmType.admissionInquiry],
    }),
  }),
});
export const {
  useGetAdmissionInquiryQuery,
  useGetAdmissionInquiriesQuery,
  useLazyExportAdmissionInquiriesQuery,
  useMarkAdmissionInquiryContactedMutation,
  useCreateAdmissionInquiryMutation,
  useUpdateAdmissionInquiryMutation,
  useGetAdmissionInquiryTimelineQuery,
  useCheckAdmissionInquiryDuplicatesMutation,
  useGetAdmissionInquiryAssignableCounsellorsQuery,
  useAssignAdmissionInquiryCounsellorMutation,
  useBulkAssignAdmissionInquiryCounsellorMutation,
  useCreateAdmissionInquiryCommunicationMutation,
} = admissionInquiriesApi;
