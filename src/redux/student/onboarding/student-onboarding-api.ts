import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';
import type { ApplicationDocumentVerification } from 'src/redux/student/admissions/admission-document-types';
import type {
  AdmissionFeeSelection,
  AdmissionFeeStructureCandidate,
} from 'src/redux/student/admissions/admission-fee-selection-types';

import { api } from 'src/redux/service';
import { studentAcademicFilterParams } from 'src/utils/student-academic-filter-query';
import { studentType, organizationType, studentOnboardingType } from 'src/redux/tagTypes';

import type {
  StudentOnboardingCase,
  StudentCredentialEmail,
  SendStudentCredentials,
  StudentIdentifierSeries,
  StudentOnboardingPolicy,
  StudentOnboardingCasePage,
  StudentOnboardingAnalytics,
  StudentOnboardingDocuments,
  StudentOnboardingListInput,
  StudentCredentialsWorkspace,
  StudentOnboardingStepStatus,
  UpdateStudentCredentialsEmail,
  StudentSiblingParentSelection,
  SaveStudentOnboardingSettings,
  UpsertStudentOnboardingPolicy,
  CreateStudentIdentifierSeries,
  StudentGuardianAccessSelection,
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
  divisionId?: string | null;
  schoolAssignmentMode: 'manual' | 'automatic' | 'both';
  rollAssignmentMode: 'manual' | 'automatic';
  proposedRollNumber: number;
  concurrencyStamp: string;
};

const unwrap = <T>(response: Result<T> | T): T =>
  response && typeof response === 'object' && 'data' in response && response.data !== undefined
    ? response.data
    : (response as T);

const caseTags = (id: string, error?: unknown) => [
  { type: studentOnboardingType.onboardingServiceHandoffs, id },
  { type: studentOnboardingType.onboardingCaseDetail, id },
  { type: studentOnboardingType.onboardingCaseList, id: 'LIST' },
  { type: studentOnboardingType.onboardingAnalytics, id: 'SUMMARY' },
  ...(!error ? [{ type: studentType.student, id: 'MODULE-DASHBOARD-admissions' }] : []),
];

export const studentOnboardingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    enableStudentAppAccess: builder.mutation<
      StudentCredentialsWorkspace,
      { id: string; reason: string; concurrencyStamp: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/student/onboarding/${id}/student-app-access/enable`,
        method: 'POST',
        body,
      }),
      transformResponse: (
        response: Result<StudentCredentialsWorkspace> | StudentCredentialsWorkspace
      ) => unwrap(response),
      invalidatesTags: (_result, error, { id }) => (error ? [] : caseTags(id)),
    }),
    enableGuardianCredentialEmail: builder.mutation<
      StudentOnboardingCase,
      { id: string; reason: string; concurrencyStamp: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/student/onboarding/${id}/guardian-credential-email/enable`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: Result<StudentOnboardingCase> | StudentOnboardingCase) =>
        unwrap(response),
      invalidatesTags: (_result, error, { id }) => (error ? [] : caseTags(id)),
    }),
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
      invalidatesTags: (_result, _error, { id }) => caseTags(id, _error),
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
      invalidatesTags: (_result, _error, { id }) => caseTags(id, _error),
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
      invalidatesTags: (_result, _error, { id }) => caseTags(id, _error),
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
      invalidatesTags: (_result, _error, { id }) => caseTags(id, _error),
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
        ...caseTags(id, _error),
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
      invalidatesTags: (_result, _error, { id }) => caseTags(id, _error),
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
      invalidatesTags: (_result, _error, { id }) => caseTags(id, _error),
    }),
    getStudentCredentialEmails: builder.query<StudentCredentialEmail[], string>({
      query: (id) => `/student/onboarding/${id}/credential-emails`,
      transformResponse: (response: Result<StudentCredentialEmail[]> | StudentCredentialEmail[]) =>
        unwrap(response),
      providesTags: (_result, _error, id) => [
        { type: studentOnboardingType.onboardingCaseDetail, id },
      ],
    }),
    getStudentOnboardingCredentials: builder.query<StudentCredentialsWorkspace, string>({
      query: (id) => `/student/onboarding/${id}/credentials`,
      transformResponse: (
        response: Result<StudentCredentialsWorkspace> | StudentCredentialsWorkspace
      ) => unwrap(response),
      providesTags: (_result, _error, id) => [
        { type: studentOnboardingType.onboardingCaseDetail, id },
      ],
    }),
    sendStudentOnboardingCredentials: builder.mutation<
      StudentCredentialsWorkspace,
      SendStudentCredentials
    >({
      query: ({ id, ...body }) => ({
        url: `/student/onboarding/${id}/credentials`,
        method: 'POST',
        body,
      }),
      transformResponse: (
        response: Result<StudentCredentialsWorkspace> | StudentCredentialsWorkspace
      ) => unwrap(response),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            studentOnboardingApi.util.updateQueryData(
              'getStudentOnboardingCredentials',
              id,
              () => data
            )
          );
        } catch {
          // Unknown or failed writes are never retried or presented as successful.
        }
      },
      invalidatesTags: (_result, error, { id }) => (error ? [] : caseTags(id)),
    }),
    updateStudentCredentialsEmail: builder.mutation<
      StudentCredentialsWorkspace,
      UpdateStudentCredentialsEmail
    >({
      query: ({ id, ...body }) => ({
        url: `/student/onboarding/${id}/credentials/email`,
        method: 'PUT',
        body,
      }),
      transformResponse: (
        response: Result<StudentCredentialsWorkspace> | StudentCredentialsWorkspace
      ) => unwrap(response),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            studentOnboardingApi.util.updateQueryData(
              'getStudentOnboardingCredentials',
              id,
              () => data
            )
          );
        } catch {
          // Failed writes retain the current saved profile and the caller's draft.
        }
      },
      invalidatesTags: (_result, error, { id }) => (error ? [] : caseTags(id)),
    }),
    confirmStudentPortalEmail: builder.mutation<
      void,
      {
        tenantId: string;
        userId: string;
        requestId: string;
        token: string;
      }
    >({
      query: (body) => ({
        url: '/student/portal/email/confirm',
        method: 'POST',
        body,
        headers: { __tenant: body.tenantId },
      }),
    }),
    linkStudentOnboardingParent: builder.mutation<
      StudentCredentialsWorkspace,
      {
        id: string;
        concurrencyStamp: string;
        siblingParentSelection?: StudentSiblingParentSelection;
        confirmExistingParentAccess?: boolean;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/student/onboarding/${id}/credentials/link-parent`,
        method: 'POST',
        body,
      }),
      transformResponse: (
        response: Result<StudentCredentialsWorkspace> | StudentCredentialsWorkspace
      ) => unwrap(response),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            studentOnboardingApi.util.updateQueryData(
              'getStudentOnboardingCredentials',
              id,
              () => data
            )
          );
        } catch {
          /* A failed link never changes the saved parent locally. */
        }
      },
      invalidatesTags: (_result, error, { id }) => (error ? [] : caseTags(id)),
    }),
    retryStudentOnboardingParentSetup: builder.mutation<
      StudentCredentialsWorkspace,
      { id: string; concurrencyStamp: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/student/onboarding/${id}/credentials/retry-parent-setup`,
        method: 'POST',
        body,
      }),
      transformResponse: (
        response: Result<StudentCredentialsWorkspace> | StudentCredentialsWorkspace
      ) => unwrap(response),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            studentOnboardingApi.util.updateQueryData(
              'getStudentOnboardingCredentials',
              id,
              () => data
            )
          );
        } catch {
          /* Failed retries never create a successful local state. */
        }
      },
      invalidatesTags: (_result, error, { id }) => (error ? [] : caseTags(id)),
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
      invalidatesTags: (_result, _error, { id }) => caseTags(id, _error),
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
        ...caseTags(caseId, _error),
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
      invalidatesTags: (_result, _error, { id }) => caseTags(id, _error),
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
      providesTags: [
        { type: studentOnboardingType.onboardingFilterOptions, id: 'LIST' },
        organizationType.academicHierarchyOptions,
      ],
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
          organizationType.academicHierarchyOptions,
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
      invalidatesTags: (_result, _error, { id }) => caseTags(id, _error),
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
      invalidatesTags: (_result, _error, { id }) => caseTags(id, _error),
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
      invalidatesTags: (_result, _error, { id }) => caseTags(id, _error),
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
      invalidatesTags: (_result, _error, { id }) => caseTags(id, _error),
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
        ...caseTags(id, _error),
        { type: studentOnboardingType.onboardingPlacementOptions, id },
      ],
    }),
    previewStudentOnboardingRoll: builder.mutation<
      StudentOnboardingRollPreview,
      {
        id: string;
        divisionId?: string;
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
        ...caseTags(id, _error),
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
      {
        id: string;
        concurrencyStamp?: string | null;
        idempotencyKey: string;
        siblingParentSelection?: StudentSiblingParentSelection;
        guardianAccessSelection?: StudentGuardianAccessSelection;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/student/onboarding/${id}/activate`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: Result<StudentOnboardingCase> | StudentOnboardingCase) =>
        unwrap(response),
      invalidatesTags: (_result, _error, { id }) => [
        ...caseTags(id, _error),
        { type: studentType.student, id: 'RECORDS-DIRECTORY' },
        ...(!_error
          ? [
              { type: studentType.student, id: 'MODULE-DASHBOARD-records' },
              { type: studentType.student, id: 'MODULE-DASHBOARD-attendance' },
            ]
          : []),
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
      invalidatesTags: (_result, _error, { id }) => caseTags(id, _error),
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
        ...(!_error ? [{ type: studentType.student, id: 'MODULE-DASHBOARD-admissions' }] : []),
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
      invalidatesTags: (_result, _error, { id }) => caseTags(id, _error),
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
      invalidatesTags: (_result, error) =>
        error
          ? []
          : [
              { type: studentOnboardingType.onboardingSettings, id: 'SCOPES' },
              { type: studentOnboardingType.onboardingCaseList, id: 'LIST' },
              { type: studentOnboardingType.onboardingCaseDetail },
              { type: studentOnboardingType.onboardingAnalytics, id: 'SUMMARY' },
            ],
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
      invalidatesTags: (_result, error) =>
        error
          ? []
          : [
              { type: studentOnboardingType.onboardingSettings, id: 'SCOPES' },
              { type: studentOnboardingType.onboardingCaseList, id: 'LIST' },
              { type: studentOnboardingType.onboardingCaseDetail },
              { type: studentOnboardingType.onboardingAnalytics, id: 'SUMMARY' },
            ],
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
        ...caseTags(caseId, _error),
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useEnableGuardianCredentialEmailMutation,
  useEnableStudentAppAccessMutation,
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
  useGetStudentOnboardingCredentialsQuery,
  useSendStudentOnboardingCredentialsMutation,
  useUpdateStudentCredentialsEmailMutation,
  useConfirmStudentPortalEmailMutation,
  useSendStudentCredentialEmailMutation,
  useOverrideStudentOnboardingDocumentsMutation,
  useGetStudentPortalAccountsQuery,
  useProvisionStudentPortalAccountMutation,
  useGetStudentOnboardingCasesQuery,
  useGetStudentOnboardingFilterOptionsQuery,
  useGetAvailableOnboardingCampusesQuery,
  useGetStudentOnboardingAnalyticsQuery,
  useGetStudentOnboardingCaseQuery,
  useLazyGetStudentOnboardingCaseQuery,
  useGetStudentOnboardingPlacementOptionsQuery,
  useGetAvailableStudentIdentifierSeriesQuery,
  useLazyGetAvailableStudentIdentifierSeriesQuery,
  useRefreshStudentOnboardingReadinessMutation,
  useAssignStudentOnboardingOwnerMutation,
  useSetStudentOnboardingRouteMutation,
  useUpdateStudentOnboardingStepMutation,
  useSetStudentOnboardingPlacementMutation,
  useAllocateStudentOnboardingIdentifierMutation,
  usePreviewStudentOnboardingRollMutation,
  usePreviewStudentOnboardingActivationQuery,
  useLazyPreviewStudentOnboardingActivationQuery,
  useActivateStudentOnboardingMutation,
  useRetryStudentOnboardingParentSetupMutation,
  useLinkStudentOnboardingParentMutation,
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
