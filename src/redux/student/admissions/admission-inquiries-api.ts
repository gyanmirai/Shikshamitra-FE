import { api } from 'src/redux/service';
import { studentType, studentAdmissionsCrmType } from 'src/redux/tagTypes';
import { studentAcademicFilterParams } from 'src/utils/student-academic-filter-query';

import type { AdmissionForm } from './admission-forms-api';
import type { AdmissionInquiryPolicy } from './admission-inquiry-policy';
import type {
  AdmissionOffering,
  AdmissionOfferingListItem,
  AdmissionOfferingAvailability,
} from './admission-offerings-api';
import type {
  AdmissionFamilyParent,
  AdmissionParentContact,
  AdmissionFamilyContacts,
  AdmissionParentRelationship,
} from './admission-parent-family-types';

const dashboardTag = { type: studentType.student, id: 'MODULE-DASHBOARD-admissions' } as const;
const inquiryMutationTags = (_result: unknown, error: unknown) =>
  error ? [] : [studentAdmissionsCrmType.admissionInquiry, dashboardTag];

export type AdmissionInquiryCaptureContext = {
  academicYearStartDate?: string | null;
  minimumAgeYears?: number | null;
  offering: AdmissionOffering;
  form: AdmissionForm | null;
  policy: AdmissionInquiryPolicy | null;
  availability: AdmissionOfferingAvailability;
};
export type AdmissionInquiryCaptureCatalogue = {
  periods: { id: string; name: string }[];
  academicOptions: {
    boardId: string;
    boardName: string;
    mediumId: string;
    mediumName: string;
    standardId: string;
    standardName: string;
  }[];
  offerings: AdmissionOfferingListItem[];
};

export type AdmissionInquiryCaptureCatalogueQuery = {
  academicYearId?: string;
  // Separate class checks in the RTK cache without expanding the server contract.
  admissionCycleId?: string;
  boardId?: string;
  mediumId?: string;
  standardId?: string;
  availabilityCheckId?: string;
};

export type AdmissionInquiryStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type AdmissionInquirySource = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type AdmissionInquiryWorkQueue = 1 | 2 | 3 | 4;
export type AdmissionInquiry = {
  parentRelationship?: AdmissionParentRelationship | null;
  mainSchoolContact?: {
    fullName: string;
    relationship: 'father' | 'mother' | 'guardian';
    relationshipLabel?: string | null;
    mobile?: string | null;
    email?: string | null;
  } | null;
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
  formResponseDefinitionId?: string | null;
  formDefinitionId?: string | null;
  formDefinitionVersion?: number | null;
  formDefinition?: AdmissionForm | null;
  formValues?: { fieldCode: string; valueJson?: string | null }[];
  guardianName?: string | null;
  applicantFirstName?: string | null;
  applicantLastName?: string | null;
  applicantDateOfBirth?: string | null;
  guardianFirstName?: string | null;
  guardianLastName?: string | null;
  boardId?: string | null;
  mediumId?: string | null;
  standardId?: string | null;
  standardName?: string | null;
  applicationId?: string | null;
  isTransferred?: boolean;
  isDuplicate?: boolean;
  legacyStatus?: AdmissionInquiryStatus;
  formAnswers?: { fieldCode: string; label: string; value: string }[];
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
  divisionId?: string;
  dashboardFollowUpsDue?: boolean;
  academicYearId?: string;
  boardId?: string;
  mediumId?: string;
  standardId?: string;
  standardIds?: string[];
  admissionCycleId?: string;
  admissionOfferingId?: string;
  inquiryNumber?: string;
  inquiryNumberFilterType?: string;
  applicantName?: string;
  applicantNameFilterType?: string;
  phone?: string;
  phoneFilterType?: string;
  standardName?: string;
  standardNameFilterType?: string;
  email?: string;
  emailFilterType?: string;
  status?: AdmissionInquiryStatus;
  pipelineGroup?: 'active' | 'handoff';
  source?: AdmissionInquirySource;
  assignedCounsellorId?: string;
  isAssigned?: boolean;
  excludePostApplication?: boolean;
  isTransferred?: boolean;
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
  reason?: string;
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
  familyContacts?: AdmissionFamilyContacts;
  admissionCycleId: string;
  admissionOfferingId: string | null;
  boardId: string;
  mediumId: string;
  standardId: string;
  existingFamilyId?: string | null;
  existingParentApplicantId?: string | null;
  parentRelationship?: AdmissionParentRelationship;
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
  existingInquiryAdmissionCycleId?: string | null;
  applicantName: string;
  guardianPhone?: string | null;
  guardianEmail?: string | null;
  dateOfBirth?: string | null;
  canLinkFamily?: boolean;
  parents?: AdmissionFamilyParent[];
  matchByEmail?: boolean;
  matchByMobile?: boolean;
};
export type UpdateAdmissionInquiry = {
  applicantName: string;
  phone: string;
  email?: string | null;
  preferredLanguageCode: string;
  source: AdmissionInquirySource;
  sourceDetail?: string | null;
  concurrencyStamp: string;
  admissionOfferingId?: string;
  boardId?: string;
  mediumId?: string;
  standardId?: string;
  formValues?: { fieldCode: string; valueJson?: string | null }[];
  status?: 0 | 2 | 6;
  statusReason?: string;
};
export type AdmissionInquiryTimelineItem = {
  id: string;
  activityType: string;
  description: string;
  occurredAt: string;
  creatorId?: string | null;
  actorName?: string | null;
  metadataJson?: string | null;
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
    getAdmissionInquiryCaptureContext: builder.query<AdmissionInquiryCaptureContext, string>({
      query: (offeringId) =>
        `/student/enrollment/admissions/inquiries/capture-context/${offeringId}`,
      transformResponse: (
        response: Result<AdmissionInquiryCaptureContext> | AdmissionInquiryCaptureContext
      ) => unwrap(response),
      providesTags: [
        studentAdmissionsCrmType.admissionInquiry,
        studentAdmissionsCrmType.admissionOffering,
        studentAdmissionsCrmType.admissionForm,
      ],
    }),
    getAdmissionInquiryCaptureCatalogue: builder.query<
      AdmissionInquiryCaptureCatalogue,
      AdmissionInquiryCaptureCatalogueQuery
    >({
      query: ({ academicYearId }) => ({
        url: '/student/enrollment/admissions/inquiries/capture-catalogue',
        params: { academicYearId },
      }),
      transformResponse: (
        response: Result<AdmissionInquiryCaptureCatalogue> | AdmissionInquiryCaptureCatalogue
      ) => unwrap(response),
      providesTags: [
        studentAdmissionsCrmType.admissionInquiry,
        studentAdmissionsCrmType.admissionOffering,
        studentAdmissionsCrmType.admissionCycle,
      ],
    }),
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
      query: (params) => ({
        url: '/student/enrollment/admissions/inquiries',
        params: studentAcademicFilterParams(params),
      }),
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
      invalidatesTags: inquiryMutationTags,
    }),
    createAdmissionInquiry: builder.mutation<AdmissionInquiry, CreateAdmissionInquiry>({
      query: (body) => ({ url: '/student/enrollment/admissions/inquiries', method: 'POST', body }),
      transformResponse: (response: Result<AdmissionInquiry> | AdmissionInquiry) =>
        unwrap(response),
      invalidatesTags: (_result, error) =>
        error
          ? []
          : [
              dashboardTag,
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
      invalidatesTags: inquiryMutationTags,
    }),
    confirmAdmissionInquiryOffering: builder.mutation<
      AdmissionInquiry,
      { id: string; offeringId: string; concurrencyStamp: string }
    >({
      query: ({ id, offeringId, concurrencyStamp }) => ({
        url: `/student/enrollment/admissions/inquiries/${id}/confirm-offering`,
        method: 'POST',
        body: { offeringId, concurrencyStamp },
      }),
      transformResponse: (response: Result<AdmissionInquiry> | AdmissionInquiry) =>
        unwrap(response),
      invalidatesTags: inquiryMutationTags,
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
        params: studentAcademicFilterParams(params),
        responseHandler: (response) => response.blob(),
      }),
    }),
    checkAdmissionInquiryDuplicates: builder.mutation<
      DuplicateMatch[],
      {
        admissionCycleId: string;
        guardianPhone: string;
        guardianEmail?: string;
        parentContacts?: AdmissionParentContact[];
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
      invalidatesTags: inquiryMutationTags,
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
      invalidatesTags: inquiryMutationTags,
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
      invalidatesTags: inquiryMutationTags,
    }),
  }),
});
export const {
  useGetAdmissionInquiryCaptureContextQuery,
  useGetAdmissionInquiryCaptureCatalogueQuery,
  useLazyGetAdmissionInquiryCaptureCatalogueQuery,
  useGetAdmissionInquiryQuery,
  useGetAdmissionInquiriesQuery,
  useLazyExportAdmissionInquiriesQuery,
  useMarkAdmissionInquiryContactedMutation,
  useCreateAdmissionInquiryMutation,
  useUpdateAdmissionInquiryMutation,
  useConfirmAdmissionInquiryOfferingMutation,
  useGetAdmissionInquiryTimelineQuery,
  useCheckAdmissionInquiryDuplicatesMutation,
  useGetAdmissionInquiryAssignableCounsellorsQuery,
  useAssignAdmissionInquiryCounsellorMutation,
  useBulkAssignAdmissionInquiryCounsellorMutation,
  useCreateAdmissionInquiryCommunicationMutation,
} = admissionInquiriesApi;
