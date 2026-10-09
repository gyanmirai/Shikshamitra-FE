import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';
import type { ApplicationDocumentVerification } from 'src/redux/student/admissions/admission-document-types';
import type {
  AdmissionFeeSelection,
  AdmissionFeeStructureCandidate,
} from 'src/redux/student/admissions/admission-fee-selection-types';

import { api } from 'src/redux/service';
import { studentType, studentOnboardingType } from 'src/redux/tagTypes';
import { studentAcademicFilterParams } from 'src/utils/student-academic-filter-query';

import type {
  StudentOnboardingCase,
  StudentCredentialEmail,
  StudentIdentifierSeries,
  StudentOnboardingPolicy,
  StudentOnboardingCasePage,
  StudentOnboardingAnalytics,
  StudentOnboardingDocuments,
  StudentOnboardingListInput,
  StudentOnboardingStepStatus,
  SaveStudentOnboardingSettings,
  UpsertStudentOnboardingPolicy,
  CreateStudentIdentifierSeries,
  StudentOnboardingFilterOptions,
  StudentOnboardingSettingsRecord,
  StudentOnboardingServiceHandoff,
  StudentOnboardingPlacementOption,
  HistoricalAdmissionReconciliation,
} from './student-onboarding-types';

type Result<T> = { data?: T };

export type StudentPortalAccount = {
  studentId: string;
  studentName: string;
  userId: string;
  accountType: 'student' | 'guardian';
  relationship: string;
  email: string;
  emailConfirmed: boolean;
  isActive: boolean;
};

export type StudentOnboardingCampus = { id: string; code: string; name: string };

export type OnboardingAvailableOffering = AdmissionOfferingListItem & {
  academicYearId: string;
  workflowDefinitionId?: string | null;
};

export type StudentOnboardingRollPreview = {
  schoolAssignmentMode: 'manual' | 'automatic' | 'both';
  rollAssignmentMode: 'manual' | 'automatic';
  proposedRollNumber: number;
  concurrencyStamp: string;
};

const unwrap = <T>(response: Result<T> | T): T =>
  response && typeof response === 'object' && 'data' in response && response.data !== undefined
    ? response.data
    : (response as T);

const caseTags = (id: string) => [
  { type: studentOnboardingType.onboardingServiceHandoffs, id },
  { type: studentOnboardingType.onboardingCaseDetail, id },
  { type: studentOnboardingType.onboardingCaseList, id: 'LIST' },
  { type: studentOnboardingType.onboardingAnalytics, id: 'SUMMARY' },
];

export const studentOnboardingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAvailableOnboardingOfferings: builder.query<OnboardingAvailableOffering[], string | void>({
      query: (academicYearId) => ({
        url: '/student/onboarding/settings/offerings',
        params: { academicYearId },
      }),
      transformResponse: (
        response: Result<OnboardingAvailableOffering[]> | OnboardingAvailableOffering[]
      ) => unwrap(response),
      providesTags: [{ type: studentOnboardingType.onboardingSettings, id: 'OFFERINGS' }],
    }),
    reviewStudentOnboardingRequirements: builder.mutation<
      StudentOnboardingCase,
      { id: string; concurrencyStamp: string }
    >({
      query: ({ id, concurrencyStamp }) => ({
        url: `/student/onboarding/${id}/requirements/review`,
        method: 'POST',
        params: { concurrencyStamp },
      }),
      transformResponse: (response: Result<StudentOnboardingCase> | StudentOnboardingCase) =>
        unwrap(response),
      invalidatesTags: (_result, _error, { id }) => caseTags(id),
    }),
    getStudentOnboardingWorkflowDocuments: builder.query<ApplicationDocumentVerification[], string>(
      {
        query: (id) => `/student/onboarding/${id}/workflow-documents`,
        transformResponse: (
          response: Result<ApplicationDocumentVerification[]> | ApplicationDocumentVerification[]
        ) => unwrap(response),
        providesTags: (_result, _error, id) => [
          { type: studentOnboardingType.onboardingCaseDetail, id },
        ],
      }
    ),
    uploadStudentOnboardingWorkflowDocument: builder.mutation<
      ApplicationDocumentVerification,
      {
        id: string;
        stageId: string;
        code: string;
        concurrencyStamp: string;
        file: File;
        notes?: string;
      }
    >({
      query: ({ id, stageId, code, concurrencyStamp, file, notes }) => {
        const body = new FormData();
        body.append('file', file);
        body.append('concurrencyStamp', concurrencyStamp);
        if (notes) body.append('notes', notes);
        return {
          url: `/student/onboarding/${id}/workflow-documents/${stageId}/${encodeURIComponent(code)}/upload`,
          method: 'POST',
          body,
        };
      },
      transformResponse: (
        response: Result<ApplicationDocumentVerification> | ApplicationDocumentVerification
      ) => unwrap(response),
      invalidatesTags: (_result, _error, { id }) => caseTags(id),
    }),
    recordStudentOnboardingWorkflowOriginal: builder.mutation<
      ApplicationDocumentVerification,
      { id: string; stageId: string; code: string; concurrencyStamp: string; notes: string }
    >({
      query: ({ id, stageId, code, ...body }) => ({
        url: `/student/onboarding/${id}/workflow-documents/${stageId}/${encodeURIComponent(code)}/original`,
        method: 'POST',
        body,
      }),
      transformResponse: (
        response: Result<ApplicationDocumentVerification> | ApplicationDocumentVerification
      ) => unwrap(response),
      invalidatesTags: (_result, _error, { id }) => caseTags(id),
    }),
    reviewStudentOnboardingWorkflowDocument: builder.mutation<
      ApplicationDocumentVerification,
      {
        id: string;
        evidenceId: string;
        concurrencyStamp: string;
        decision: 'accepted' | 'rejected';
        reason?: string;
      }
    >({
      query: ({ id, evidenceId, ...body }) => ({
        url: `/student/onboarding/${id}/workflow-documents/evidence/${evidenceId}/review`,
        method: 'POST',
        body,
      }),
      transformResponse: (
        response: Result<ApplicationDocumentVerification> | ApplicationDocumentVerification
      ) => unwrap(response),
      invalidatesTags: (_result, _error, { id }) => caseTags(id),
    }),
    assignStudentOnboardingGr: builder.mutation<
      StudentOnboardingCase,
      {
        id: string;
        concurrencyStamp?: string | null;
        numberSeriesId: string;
        manualValue?: string;
        reason?: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/student/onboarding/${id}/gr-number`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: Result<StudentOnboardingCase> | StudentOnboardingCase) =>
        unwrap(response),
      invalidatesTags: (_result, _error, { id }) => [
        ...caseTags(id),
        { type: studentOnboardingType.onboardingIdentifierSeries, id },
      ],
    }),
    assignStudentOnboardingRoll: builder.mutation<
      StudentOnboardingCase,
      {
        id: string;
        concurrencyStamp?: string | null;
        rollNumber: number;
        rollAssignmentMode?: 'manual' | 'automatic';
        reason?: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/student/onboarding/${id}/roll-number`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: Result<StudentOnboardingCase> | StudentOnboardingCase) =>
        unwrap(response),
      invalidatesTags: (_result, _error, { id }) => caseTags(id),
    }),
    setStudentOnboardingIdentifierLock: builder.mutation<
      void,
      {
        academicYearId: string;
        divisionId: string;
        identifierType: 'gr' | 'roll';
        isLocked: boolean;
        reason?: string;
      }
    >({
      query: (body) => ({ url: '/student/onboarding/identifier-locks', method: 'POST', body }),
      invalidatesTags: [
        studentOnboardingType.onboardingCaseDetail,
        studentOnboardingType.onboardingCaseList,
      ],
    }),
    getStudentOnboardingFeeStructure: builder.query<AdmissionFeeSelection, string>({
      query: (id) => `/student/onboarding/${id}/fee-structure`,
      transformResponse: (response: Result<AdmissionFeeSelection> | AdmissionFeeSelection) =>
        unwrap(response),
      providesTags: (_result, _error, id) => [
        { type: studentOnboardingType.onboardingCaseDetail, id },
      ],
    }),
    getStudentOnboardingFeeCandidates: builder.query<AdmissionFeeStructureCandidate[], string>({
      query: (id) => `/student/onboarding/${id}/fee-structure/candidates`,
      transformResponse: (
        response: Result<AdmissionFeeStructureCandidate[]> | AdmissionFeeStructureCandidate[]
      ) => unwrap(response),
    }),
    confirmStudentOnboardingFeeStructure: builder.mutation<
      AdmissionFeeSelection,
      { id: string; concurrencyStamp: string; structureId: string; optionalHeadIds: string[] }
    >({
      query: ({ id, ...body }) => ({
        url: `/student/onboarding/${id}/fee-structure`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: Result<AdmissionFeeSelection> | AdmissionFeeSelection) =>
        unwrap(response),
      invalidatesTags: (_result, _error, { id }) => caseTags(id),
    }),
    getStudentCredentialEmails: builder.query<StudentCredentialEmail[], string>({
      query: (id) => `/student/onboarding/${id}/credential-emails`,
      transformResponse: (response: Result<StudentCredentialEmail[]> | StudentCredentialEmail[]) =>
        unwrap(response),
      providesTags: (_result, _error, id) => [
        { type: studentOnboardingType.onboardingCaseDetail, id },
      ],
    }),
    sendStudentCredentialEmail: builder.mutation<
      StudentCredentialEmail,
      { id: string; accountType: 'student' | 'guardian'; concurrencyStamp?: string | null }
    >({
      query: ({ id, ...body }) => ({
        url: `/student/onboarding/${id}/credential-emails`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: Result<StudentCredentialEmail> | StudentCredentialEmail) =>
        unwrap(response),
      invalidatesTags: (_result, _error, { id }) => caseTags(id),
    }),
    overrideStudentOnboardingDocuments: builder.mutation<
      StudentOnboardingDocuments,
      {
        caseId: string;
        documentTypeIds: string[];
        overrideAll: boolean;
        reason: string;
        concurrencyStamp?: string | null;
      }
    >({
      query: ({ caseId, ...body }) => ({
        url: `/student/onboarding/${caseId}/documents/override`,
        method: 'POST',
        body,
      }),
      transformResponse: (
        response: Result<StudentOnboardingDocuments> | StudentOnboardingDocuments
      ) => unwrap(response),
      invalidatesTags: (_result, _error, { caseId }) => [
        ...caseTags(caseId),
        { type: studentOnboardingType.onboardingDocuments, id: caseId },
      ],
    }),
    getStudentPortalAccounts: builder.query<StudentPortalAccount[], string>({
      query: (id) => `/student/onboarding/${id}/portal-accounts`,
      transformResponse: (response: Result<StudentPortalAccount[]> | StudentPortalAccount[]) =>
        unwrap(response),
      providesTags: (_result, _error, id) => [
        { type: studentOnboardingType.onboardingCaseDetail, id },
      ],
    }),
    provisionStudentPortalAccount: builder.mutation<
      StudentPortalAccount,
      {
        id: string;
        accountType: 'student' | 'guardian';
        relationship: string;
        email: string;
        relationshipVerified: boolean;
        linkExistingGuardian: boolean;
        concurrencyStamp?: string | null;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/student/onboarding/${id}/portal-accounts`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: Result<StudentPortalAccount> | StudentPortalAccount) =>
        unwrap(response),
      invalidatesTags: (_result, _error, { id }) => caseTags(id),
    }),
    getStudentOnboardingCases: builder.query<
      StudentOnboardingCasePage,
      StudentOnboardingListInput | void
    >({
      query: (params) => ({
        url: '/student/onboarding',
        params: studentAcademicFilterParams(params ?? {}),
      }),
      transformResponse: (
        response: Result<StudentOnboardingCasePage> | StudentOnboardingCasePage
      ) => unwrap(response),
      providesTags: (result) => [
        { type: studentOnboardingType.onboardingCaseList, id: 'LIST' },
        ...(result?.items.map(({ id }) => ({
          type: studentOnboardingType.onboardingCaseDetail,
          id,
        })) ?? []),
      ],
    }),
    getStudentOnboardingFilterOptions: builder.query<StudentOnboardingFilterOptions, string>({
      query: (academicYearId) => ({
        url: '/student/onboarding/filter-options',
        params: { academicYearId },
      }),
      transformResponse: (
        response: Result<StudentOnboardingFilterOptions> | StudentOnboardingFilterOptions
      ) => unwrap(response),
      providesTags: [{ type: studentOnboardingType.onboardingFilterOptions, id: 'LIST' }],
    }),
    getAvailableOnboardingCampuses: builder.query<StudentOnboardingCampus[], void>({
      query: () => '/student/onboarding/settings/campuses',
      transformResponse: (
        response: Result<StudentOnboardingCampus[]> | StudentOnboardingCampus[]
      ) => unwrap(response),
      providesTags: [{ type: studentOnboardingType.onboardingFilterOptions, id: 'CAMPUSES' }],
    }),
    getStudentOnboardingAnalytics: builder.query<StudentOnboardingAnalytics, void>({
      query: () => '/student/onboarding/analytics',
      transformResponse: (
        response: Result<StudentOnboardingAnalytics> | StudentOnboardingAnalytics
      ) => unwrap(response),
      providesTags: [{ type: studentOnboardingType.onboardingAnalytics, id: 'SUMMARY' }],
    }),
    getStudentOnboardingCase: builder.query<StudentOnboardingCase, string>({
      query: (id) => `/student/onboarding/${id}`,
      transformResponse: (response: Result<StudentOnboardingCase> | StudentOnboardingCase) =>
        unwrap(response),
      providesTags: (_result, _error, id) => [
        { type: studentOnboardingType.onboardingCaseDetail, id },
      ],
    }),
    getStudentOnboardingPlacementOptions: builder.query<StudentOnboardingPlacementOption[], string>(
      {
        query: (id) => `/student/onboarding/${id}/placement-options`,
        transformResponse: (
          response: Result<StudentOnboardingPlacementOption[]> | StudentOnboardingPlacementOption[]
        ) => unwrap(response),
        providesTags: (_result, _error, id) => [
          { type: studentOnboardingType.onboardingPlacementOptions, id },
        ],
      }
    ),
    getAvailableStudentIdentifierSeries: builder.query<StudentIdentifierSeries[], string>({
      query: (id) => `/student/onboarding/${id}/identifier-series`,
      transformResponse: (
        response: Result<StudentIdentifierSeries[]> | StudentIdentifierSeries[]
      ) => unwrap(response),
      providesTags: (_result, _error, id) => [
        { type: studentOnboardingType.onboardingIdentifierSeries, id: 'AVAILABLE' },
        { type: studentOnboardingType.onboardingIdentifierSeries, id },
      ],
    }),
    refreshStudentOnboardingReadiness: builder.mutation<
      StudentOnboardingCase,
      { id: string; concurrencyStamp?: string | null }
    >({
      query: ({ id, concurrencyStamp }) => ({
        url: `/student/onboarding/${id}/readiness/refresh`,
        method: 'POST',
        params: { concurrencyStamp },
      }),
      transformResponse: (response: Result<StudentOnboardingCase> | StudentOnboardingCase) =>
        unwrap(response),
      invalidatesTags: (_result, _error, { id }) => caseTags(id),
    }),
    assignStudentOnboardingOwner: builder.mutation<
      StudentOnboardingCase,
      { id: string; concurrencyStamp?: string | null; userId?: string | null }
    >({
      query: ({ id, ...body }) => ({
        url: `/student/onboarding/${id}/owner`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: Result<StudentOnboardingCase> | StudentOnboardingCase) =>
        unwrap(response),
      invalidatesTags: (_result, _error, { id }) => caseTags(id),
    }),
    setStudentOnboardingRoute: builder.mutation<
      StudentOnboardingCase,
      { id: string; admissionRoute: string; concurrencyStamp?: string | null }
    >({
      query: ({ id, ...body }) => ({
        url: `/student/onboarding/${id}/admission-route`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: Result<StudentOnboardingCase> | StudentOnboardingCase) =>
        unwrap(response),
      invalidatesTags: (_result, _error, { id }) => caseTags(id),
    }),
    updateStudentOnboardingStep: builder.mutation<
      StudentOnboardingCase,
      {
        id: string;
        stepKey: string;
        concurrencyStamp?: string | null;
        status: StudentOnboardingStepStatus;
        detail?: string | null;
        waiverReason?: string | null;
      }
    >({
      query: ({ id, stepKey, ...body }) => ({
        url: `/student/onboarding/${id}/steps/${encodeURIComponent(stepKey)}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: Result<StudentOnboardingCase> | StudentOnboardingCase) =>
        unwrap(response),
      invalidatesTags: (_result, _error, { id }) => caseTags(id),
    }),
    setStudentOnboardingPlacement: builder.mutation<
      StudentOnboardingCase,
      { id: string; concurrencyStamp?: string | null; divisionId: string; reason?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/student/onboarding/${id}/placement`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: Result<StudentOnboardingCase> | StudentOnboardingCase) =>
        unwrap(response),
      invalidatesTags: (_result, _error, { id }) => [
        ...caseTags(id),
        { type: studentOnboardingType.onboardingPlacementOptions, id },
      ],
    }),
    previewStudentOnboardingRoll: builder.mutation<
      StudentOnboardingRollPreview,
      {
        id: string;
        rollNumber?: number;
        rollAssignmentMode?: 'manual' | 'automatic';
        reason?: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/student/onboarding/${id}/roll-preview`,
        method: 'POST',
        body,
      }),
      transformResponse: (
        response: Result<StudentOnboardingRollPreview> | StudentOnboardingRollPreview
      ) => unwrap(response),
    }),
    allocateStudentOnboardingIdentifier: builder.mutation<
      StudentOnboardingCase,
      {
        id: string;
        concurrencyStamp?: string | null;
        numberSeriesId: string;
        rollNumber: number;
        rollAssignmentMode?: 'manual' | 'automatic';
        manualValue?: string | null;
        manualSequence?: number | null;
        overrideReason?: string | null;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/student/onboarding/${id}/identifiers`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: Result<StudentOnboardingCase> | StudentOnboardingCase) =>
        unwrap(response),
      invalidatesTags: (_result, _error, { id }) => [
        ...caseTags(id),
        { type: studentOnboardingType.onboardingIdentifierSeries, id },
      ],
    }),
    previewStudentOnboardingActivation: builder.query<StudentOnboardingCase, string>({
      query: (id) => `/student/onboarding/${id}/activation-preview`,
      transformResponse: (response: Result<StudentOnboardingCase> | StudentOnboardingCase) =>
        unwrap(response),
      providesTags: (_result, _error, id) => [
        { type: studentOnboardingType.onboardingCaseDetail, id },
      ],
    }),
    activateStudentOnboarding: builder.mutation<
      StudentOnboardingCase,
      { id: string; concurrencyStamp?: string | null; idempotencyKey: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/student/onboarding/${id}/activate`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: Result<StudentOnboardingCase> | StudentOnboardingCase) =>
        unwrap(response),
      invalidatesTags: (_result, _error, { id }) => [
        ...caseTags(id),
        { type: studentType.student, id: 'RECORDS-DIRECTORY' },
        { type: studentOnboardingType.onboardingServiceHandoffs, id },
      ],
    }),
    cancelStudentOnboarding: builder.mutation<
      StudentOnboardingCase,
      { id: string; concurrencyStamp?: string | null; reason: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/student/onboarding/${id}/cancel`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: Result<StudentOnboardingCase> | StudentOnboardingCase) =>
        unwrap(response),
      invalidatesTags: (_result, _error, { id }) => caseTags(id),
    }),
    getStudentOnboardingServiceHandoffs: builder.query<StudentOnboardingServiceHandoff[], string>({
      query: (id) => `/student/onboarding/${id}/service-handoffs`,
      transformResponse: (
        response: Result<StudentOnboardingServiceHandoff[]> | StudentOnboardingServiceHandoff[]
      ) => unwrap(response),
      providesTags: (_result, _error, id) => [
        { type: studentOnboardingType.onboardingServiceHandoffs, id },
      ],
    }),
    retryStudentOnboardingServiceHandoff: builder.mutation<
      StudentOnboardingServiceHandoff,
      { id: string; handoffId: string }
    >({
      query: ({ id, handoffId }) => ({
        url: `/student/onboarding/${id}/service-handoffs/${handoffId}/retry`,
        method: 'POST',
      }),
      transformResponse: (
        response: Result<StudentOnboardingServiceHandoff> | StudentOnboardingServiceHandoff
      ) => unwrap(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: studentOnboardingType.onboardingServiceHandoffs, id },
        { type: studentOnboardingType.onboardingCaseDetail, id },
      ],
    }),
    confirmStudentOnboardingServiceConsent: builder.mutation<
      StudentOnboardingCase,
      { id: string; concurrencyStamp: string; evidenceReference: string }
    >({
      query: ({ id, concurrencyStamp, evidenceReference }) => ({
        url: `/student/onboarding/${id}/service-consent/confirm`,
        method: 'POST',
        body: { concurrencyStamp, evidenceReference },
      }),
      transformResponse: (response: Result<StudentOnboardingCase> | StudentOnboardingCase) =>
        unwrap(response),
      invalidatesTags: (_result, _error, { id }) => caseTags(id),
    }),
    getStudentOnboardingPolicies: builder.query<StudentOnboardingPolicy[], string>({
      query: (academicYearId) => ({
        url: '/student/onboarding/settings/policies',
        params: { academicYearId },
      }),
      transformResponse: (
        response: Result<StudentOnboardingPolicy[]> | StudentOnboardingPolicy[]
      ) => unwrap(response),
      providesTags: (_result, _error, academicYearId) => [
        { type: studentOnboardingType.onboardingPolicies, id: academicYearId },
      ],
    }),
    createStudentOnboardingPolicy: builder.mutation<
      StudentOnboardingPolicy,
      UpsertStudentOnboardingPolicy
    >({
      query: (body) => ({
        url: '/student/onboarding/settings/policies',
        method: 'POST',
        body,
      }),
      transformResponse: (response: Result<StudentOnboardingPolicy> | StudentOnboardingPolicy) =>
        unwrap(response),
      invalidatesTags: (_result, _error, { academicYearId }) => [
        { type: studentOnboardingType.onboardingPolicies, id: academicYearId },
      ],
    }),
    updateStudentOnboardingPolicy: builder.mutation<
      StudentOnboardingPolicy,
      { id: string; policy: UpsertStudentOnboardingPolicy }
    >({
      query: ({ id, policy }) => ({
        url: `/student/onboarding/settings/policies/${id}`,
        method: 'PUT',
        body: policy,
      }),
      transformResponse: (response: Result<StudentOnboardingPolicy> | StudentOnboardingPolicy) =>
        unwrap(response),
      invalidatesTags: (_result, _error, { policy }) => [
        { type: studentOnboardingType.onboardingPolicies, id: policy.academicYearId },
      ],
    }),
    getStudentOnboardingSettings: builder.query<
      StudentOnboardingSettingsRecord[],
      { academicYearId?: string } | void
    >({
      query: (params) => ({
        url: '/student/onboarding/settings/configurations',
        params: params ?? undefined,
      }),
      transformResponse: (
        response: Result<StudentOnboardingSettingsRecord[]> | StudentOnboardingSettingsRecord[]
      ) => unwrap(response),
      providesTags: [{ type: studentOnboardingType.onboardingSettings, id: 'SCOPES' }],
    }),
    saveStudentOnboardingSettings: builder.mutation<
      StudentOnboardingSettingsRecord,
      SaveStudentOnboardingSettings
    >({
      query: (body) => ({
        url: '/student/onboarding/settings/configurations',
        method: 'PUT',
        body,
      }),
      transformResponse: (
        response: Result<StudentOnboardingSettingsRecord> | StudentOnboardingSettingsRecord
      ) => unwrap(response),
      invalidatesTags: [{ type: studentOnboardingType.onboardingSettings, id: 'SCOPES' }],
    }),
    deleteStudentOnboardingSettings: builder.mutation<
      void,
      { id: string; concurrencyStamp: string }
    >({
      query: ({ id, concurrencyStamp }) => ({
        url: `/student/onboarding/settings/configurations/${id}`,
        method: 'DELETE',
        params: { concurrencyStamp },
      }),
      invalidatesTags: [{ type: studentOnboardingType.onboardingSettings, id: 'SCOPES' }],
    }),
    getStudentIdentifierSeries: builder.query<StudentIdentifierSeries[], string>({
      query: (academicYearId) => ({
        url: '/student/onboarding/settings/identifier-series',
        params: { academicYearId },
      }),
      transformResponse: (
        response: Result<StudentIdentifierSeries[]> | StudentIdentifierSeries[]
      ) => unwrap(response),
      providesTags: (_result, _error, academicYearId) => [
        { type: studentOnboardingType.onboardingIdentifierSeries, id: academicYearId },
      ],
    }),
    createStudentIdentifierSeries: builder.mutation<
      StudentIdentifierSeries,
      CreateStudentIdentifierSeries
    >({
      query: (body) => ({
        url: '/student/onboarding/settings/identifier-series',
        method: 'POST',
        body,
      }),
      transformResponse: (response: Result<StudentIdentifierSeries> | StudentIdentifierSeries) =>
        unwrap(response),
      invalidatesTags: (_result, _error, { academicYearId }) => [
        { type: studentOnboardingType.onboardingIdentifierSeries, id: 'AVAILABLE' },
        { type: studentOnboardingType.onboardingIdentifierSeries, id: academicYearId },
      ],
    }),
    deactivateStudentIdentifierSeries: builder.mutation<
      StudentIdentifierSeries,
      { id: string; academicYearId: string; concurrencyStamp?: string | null }
    >({
      query: ({ id, concurrencyStamp }) => ({
        url: `/student/onboarding/settings/identifier-series/${id}/deactivate`,
        method: 'POST',
        params: { concurrencyStamp },
      }),
      transformResponse: (response: Result<StudentIdentifierSeries> | StudentIdentifierSeries) =>
        unwrap(response),
      invalidatesTags: (_result, _error, { academicYearId }) => [
        { type: studentOnboardingType.onboardingIdentifierSeries, id: 'AVAILABLE' },
        { type: studentOnboardingType.onboardingIdentifierSeries, id: academicYearId },
      ],
    }),
    getHistoricalAdmissionReconciliation: builder.query<HistoricalAdmissionReconciliation, void>({
      query: () => '/student/onboarding/settings/historical-reconciliation',
      transformResponse: (
        response: Result<HistoricalAdmissionReconciliation> | HistoricalAdmissionReconciliation
      ) => unwrap(response),
      providesTags: [{ type: studentOnboardingType.onboardingReconciliation, id: 'SUMMARY' }],
    }),
    backfillHistoricalAdmissions: builder.mutation<HistoricalAdmissionReconciliation, void>({
      query: () => ({
        url: '/student/onboarding/settings/historical-reconciliation/backfill',
        method: 'POST',
      }),
      transformResponse: (
        response: Result<HistoricalAdmissionReconciliation> | HistoricalAdmissionReconciliation
      ) => unwrap(response),
      invalidatesTags: [
        { type: studentOnboardingType.onboardingReconciliation, id: 'SUMMARY' },
        { type: studentOnboardingType.onboardingCaseList, id: 'LIST' },
        { type: studentOnboardingType.onboardingAnalytics, id: 'SUMMARY' },
      ],
    }),
    getStudentOnboardingDocuments: builder.query<StudentOnboardingDocuments, string>({
      query: (caseId) => `/student/onboarding/${caseId}/documents`,
      transformResponse: (
        response: Result<StudentOnboardingDocuments> | StudentOnboardingDocuments
      ) => unwrap(response),
      providesTags: (_result, _error, caseId) => [
        { type: studentOnboardingType.onboardingDocuments, id: caseId },
      ],
    }),
    uploadStudentOnboardingDocument: builder.mutation<
      StudentOnboardingDocuments,
      { caseId: string; documentTypeId: string; concurrencyStamp: string; file: File }
    >({
      query: ({ caseId, documentTypeId, concurrencyStamp, file }) => {
        const body = new FormData();

        body.append('file', file);
        body.append('documentTypeId', documentTypeId);
        body.append('concurrencyStamp', concurrencyStamp);

        return {
          url: `/student/onboarding/${caseId}/documents`,
          method: 'POST',
          body,
        };
      },
      transformResponse: (
        response: Result<StudentOnboardingDocuments> | StudentOnboardingDocuments
      ) => unwrap(response),
      invalidatesTags: (_result, _error, { caseId }) => [
        { type: studentOnboardingType.onboardingDocuments, id: caseId },
        ...caseTags(caseId),
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAvailableOnboardingOfferingsQuery,
  useReviewStudentOnboardingRequirementsMutation,
  useGetStudentOnboardingWorkflowDocumentsQuery,
  useUploadStudentOnboardingWorkflowDocumentMutation,
  useRecordStudentOnboardingWorkflowOriginalMutation,
  useReviewStudentOnboardingWorkflowDocumentMutation,
  useAssignStudentOnboardingGrMutation,
  useAssignStudentOnboardingRollMutation,
  useSetStudentOnboardingIdentifierLockMutation,
  useGetStudentOnboardingFeeStructureQuery,
  useGetStudentOnboardingFeeCandidatesQuery,
  useConfirmStudentOnboardingFeeStructureMutation,
  useGetStudentCredentialEmailsQuery,
  useSendStudentCredentialEmailMutation,
  useOverrideStudentOnboardingDocumentsMutation,
  useGetStudentPortalAccountsQuery,
  useProvisionStudentPortalAccountMutation,
  useGetStudentOnboardingCasesQuery,
  useGetStudentOnboardingFilterOptionsQuery,
  useGetAvailableOnboardingCampusesQuery,
  useGetStudentOnboardingAnalyticsQuery,
  useGetStudentOnboardingCaseQuery,
  useGetStudentOnboardingPlacementOptionsQuery,
  useGetAvailableStudentIdentifierSeriesQuery,
  useRefreshStudentOnboardingReadinessMutation,
  useAssignStudentOnboardingOwnerMutation,
  useSetStudentOnboardingRouteMutation,
  useUpdateStudentOnboardingStepMutation,
  useSetStudentOnboardingPlacementMutation,
  useAllocateStudentOnboardingIdentifierMutation,
  usePreviewStudentOnboardingRollMutation,
  usePreviewStudentOnboardingActivationQuery,
  useActivateStudentOnboardingMutation,
  useCancelStudentOnboardingMutation,
  useGetStudentOnboardingServiceHandoffsQuery,
  useRetryStudentOnboardingServiceHandoffMutation,
  useConfirmStudentOnboardingServiceConsentMutation,
  useGetStudentOnboardingPoliciesQuery,
  useCreateStudentOnboardingPolicyMutation,
  useUpdateStudentOnboardingPolicyMutation,
  useGetStudentOnboardingSettingsQuery,
  useSaveStudentOnboardingSettingsMutation,
  useDeleteStudentOnboardingSettingsMutation,
  useGetStudentIdentifierSeriesQuery,
  useCreateStudentIdentifierSeriesMutation,
  useDeactivateStudentIdentifierSeriesMutation,
  useGetHistoricalAdmissionReconciliationQuery,
  useBackfillHistoricalAdmissionsMutation,
  useGetStudentOnboardingDocumentsQuery,
  useUploadStudentOnboardingDocumentMutation,
} = studentOnboardingApi;
