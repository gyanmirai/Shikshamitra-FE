import { api } from 'src/redux/service';
import {
  studentType,
  studentOnboardingType,
  studentRegistrationType,
  studentAdmissionsCrmType,
} from 'src/redux/tagTypes';

import type { ReviewDecisionCapabilities } from './admission-review-types';

export type AdmissionApplicationStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
export type AdmissionDirectFamilyMatch = {
  familyId: string;
  familyNumber: string;
  primaryGuardianName: string;
  applicants: string[];
};
export type AdmissionApplicationCounsellor = { id: string; userName: string; name: string };
export type AssignAdmissionApplicationCounsellorInput = {
  counsellorId: string;
  concurrencyStamp: string;
  reason?: string;
};
export type StartAdmissionDirectRegistrationInput = {
  requestId: string;
  admissionOfferingId: string;
  counsellorId?: string | null;
  existingFamilyId?: string | null;
  createSeparateFamily: boolean;
  separateFamilyReason?: string | null;
  applicantFirstName: string;
  applicantMiddleName?: string | null;
  applicantLastName?: string | null;
  applicantDateOfBirth?: string | null;
  applicantGender?: string | null;
  guardianFirstName: string;
  guardianLastName?: string | null;
  guardianMobile: string;
  guardianEmail?: string | null;
  guardianRelationship: 0 | 1 | 2 | 3;
};
export type AdmissionApplication = {
  reviewDecision?: ReviewDecisionCapabilities | null;
  id: string;
  concurrencyStamp?: string | null;
  applicationNumber: string;
  applicantId: string;
  applicantName: string;
  inquiryId?: string | null;
  admissionCycleId: string;
  admissionOfferingId: string;
  assignedCounsellorId?: string | null;
  assignedCounsellorName?: string | null;
  status: AdmissionApplicationStatus;
  offeringCode?: string | null;
  currentStageName?: string | null;
  decisionReason?: string | null;
  decisionBy?: string | null;
  decisionAt?: string | null;
  offerExpiresAt?: string | null;
  offerAcceptedAt?: string | null;
  studentId?: string | null;
  finalizedAt?: string | null;
  enrolledStudentId?: string | null;
  studentEnrollmentId?: string | null;
  onboardingCaseId?: string | null;
  currentStageInstanceId?: string | null;
  lastSavedAt?: string | null;
  submittedAt?: string | null;
};
export type AdmissionApplicationListInput = {
  academicYearId?: string;
  boardId?: string;
  mediumId?: string;
  standardId?: string;
  status?: AdmissionApplicationStatus;
  search?: string;
  skipCount?: number;
  maxResultCount?: number;
  admissionCycleId?: string;
  admissionOfferingId?: string;
  assignedCounsellorId?: string;
  currentStageInstanceId?: string;
  currentStageSearch?: string;
};
export type AdmissionApplicationStage = {
  formStageEnabled?: boolean;
  documentCollectionAvailable?: boolean;
  paymentStageEnabled?: boolean;
  offerStageEnabled?: boolean;
  seatStageEnabled?: boolean;
  reviewEnabled?: boolean;
  assessmentEnabled?: boolean;
  documentVerificationEnabled?: boolean;
  eligibilityEnabled?: boolean;
  id: string;
  definitionStageId: string;
  code: string;
  name: string;
  stageType: number;
  displayOrder: number;
  status: number;
  allowManualSkip: boolean;
  enteredAt?: string | null;
  completedAt?: string | null;
  completedBy?: string | null;
  completionReason?: string | null;
};
export type AdmissionWorkflowTransitionHistory = {
  id: string;
  fromStageInstanceId: string;
  toStageInstanceId?: string | null;
  transitionDefinitionId?: string | null;
  action: 0 | 1 | 2;
  reason?: string | null;
  conditionEvaluationSnapshotJson?: string | null;
  occurredAt: string;
};
export type AdmissionWorkflowRuntimeTransition = {
  id: string;
  toStageDefinitionId: string;
  toStageInstanceId: string;
  toStageName: string;
  priority: number;
  isDefault: boolean;
  conditionRuleJson?: string | null;
};
export type AdmissionApplicationWorkflow = {
  workflowDefinitionId: string;
  status: 0 | 1 | 2 | 3 | 4;
  startedAt: string;
  completedAt?: string | null;
  currentStageInstanceId?: string | null;
  nextRequiredAction?: string | null;
  stages: AdmissionApplicationStage[];
  availableTransitions: AdmissionWorkflowRuntimeTransition[];
  history: AdmissionWorkflowTransitionHistory[];
};
export type AdmissionFormField = {
  id: string;
  sectionId: string;
  code: string;
  label: string;
  fieldType: number;
  bindingType: number;
  required: boolean;
  readOnly: boolean;
  displayOrder: number;
  placeholder?: string | null;
  helpText?: string | null;
  optionsJson?: string | null;
  validationJson?: string | null;
  visibilityRuleJson?: string | null;
  requiredRuleJson?: string | null;
  translations?: Record<
    string,
    {
      label?: string | null;
      placeholder?: string | null;
      helpText?: string | null;
      validationMessage?: string | null;
      choices?: Record<string, string>;
    }
  >;
};
export type AdmissionFormSection = {
  id: string;
  code: string;
  name: string;
  displayOrder: number;
  stepId?: string | null;
  stepCode?: string | null;
  stepName?: string | null;
  stepDisplayOrder?: number | null;
  stepVisibilityRuleJson?: string | null;
  visibilityRuleJson?: string | null;
  isRepeatable?: boolean;
  minEntries?: number;
  maxEntries?: number;
  entryLabel?: string | null;
  translations?: Record<string, { label?: string | null; helpText?: string | null }>;
  fields: AdmissionFormField[];
};
export type AdmissionApplicationForm = {
  formInstanceId: string;
  formDefinitionId: string;
  formVersion: number;
  status: 0 | 1 | 2;
  submittedAt?: string | null;
  academicYearId: string;
  definition: {
    name: string;
    layoutType: number;
    fieldsPerRow: 1 | 2 | 3 | 4;
    defaultLanguage?: string;
    supportedLanguages?: string[];
    sections: AdmissionFormSection[];
  };
  values: { fieldCode: string; valueJson?: string | null }[];
};
export type AdmissionFormChangeHistory = {
  id: string;
  changeType: string;
  changedFieldsJson?: string | null;
  changedBy?: string | null;
  occurredAt: string;
};
export type AdmissionApplicationDecisionInput = {
  reason?: string | null;
  offerExpiresAt?: string | null;
  counsellorId?: string | null;
  concurrencyStamp?: string | null;
};
export type AdmissionApplicationDecisionHistory = {
  id: string;
  status: AdmissionApplicationStatus;
  reason?: string | null;
  actorId?: string | null;
  occurredAt: string;
};
export type AdmissionEnrollmentResult = {
  application: AdmissionApplication;
  studentId: string;
  studentEnrollmentId: string;
  academicYearId: string;
  standardId: string;
  divisionId?: string | null;
};
export type AdmissionEnrollmentDivisionOption = {
  id: string;
  name: string;
  strength: number;
  occupiedSeats: number;
  availableSeats: number;
  isAvailable: boolean;
};
export type AdmissionEnrollmentOptions = {
  standardId: string;
  divisions: AdmissionEnrollmentDivisionOption[];
};
export type AdmissionFinalizationReadinessItem = {
  key: string;
  label: string;
  passed: boolean;
  detail: string;
};
export type AdmissionStudentMatch = {
  studentId: string;
  studentName: string;
  dateOfBirth?: string | null;
  status: number;
  grNumber?: string | null;
  academicYearId?: string | null;
  canApplyProfileFieldsDirectly?: boolean;
  canReviewProfileFields?: boolean;
};
export type AdmissionFinalizationPreview = {
  applicationId: string;
  isReady: boolean;
  linkedStudentId?: string | null;
  items: AdmissionFinalizationReadinessItem[];
  possibleMatches: AdmissionStudentMatch[];
  canApplyProfileFieldsDirectly?: boolean;
  canReviewProfileFields?: boolean;
  capturedStudentFields?: { key: string; label: string; value: string }[];
  profileReviewDescription?: string;
};
export type FinalizeAdmissionInput = {
  concurrencyStamp: string;
  idempotencyKey: string;
  existingStudentId?: string | null;
  confirmCreateNew: boolean;
  confirmGuardianContactVerified: boolean;
  applyStudentProfileFields?: boolean;
};
export type AdmissionFinalizationResult = {
  application: AdmissionApplication;
  studentId: string;
  onboardingCaseId: string;
  reusedExistingStudent: boolean;
};
type Result<T> = { data?: T };
const unwrap = <T>(response: Result<T> | T): T =>
  response && typeof response === 'object' && 'data' in response && response.data !== undefined
    ? response.data
    : (response as T);
export const admissionApplicationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionApplications: builder.query<
      { totalCount: number; items: AdmissionApplication[] },
      AdmissionApplicationListInput
    >({
      query: (params) => ({ url: '/student/enrollment/admissions/applications', params }),
      transformResponse: (
        response:
          | Result<{ totalCount: number; items: AdmissionApplication[] }>
          | { totalCount: number; items: AdmissionApplication[] }
      ) => unwrap(response),
      providesTags: [studentAdmissionsCrmType.admissionApplication],
    }),
    getAdmissionApplication: builder.query<AdmissionApplication, string>({
      query: (id) => `/student/enrollment/admissions/applications/${id}`,
      transformResponse: (response: Result<AdmissionApplication> | AdmissionApplication) =>
        unwrap(response),
      providesTags: [studentAdmissionsCrmType.admissionApplication],
    }),
    getAdmissionApplicationCounsellors: builder.query<
      AdmissionApplicationCounsellor[],
      { offeringId?: string; filter?: string }
    >({
      query: ({ offeringId, filter }) => ({
        url: '/student/enrollment/admissions/applications/counsellors',
        params: { offeringId, filter },
      }),
      transformResponse: (
        response: Result<AdmissionApplicationCounsellor[]> | AdmissionApplicationCounsellor[]
      ) => unwrap(response),
      providesTags: [studentAdmissionsCrmType.admissionApplication],
    }),
    assignAdmissionApplicationCounsellor: builder.mutation<
      AdmissionApplication,
      { id: string; input: AssignAdmissionApplicationCounsellorInput }
    >({
      query: ({ id, input }) => ({
        url: `/student/enrollment/admissions/applications/${id}/assign-counsellor`,
        method: 'POST',
        body: input,
      }),
      transformResponse: (response: Result<AdmissionApplication> | AdmissionApplication) =>
        unwrap(response),
      invalidatesTags: [studentAdmissionsCrmType.admissionApplication],
    }),
    startAdmissionApplication: builder.mutation<
      AdmissionApplication,
      { applicantId: string; offeringId: string; inquiryId?: string }
    >({
      query: ({ applicantId, offeringId, inquiryId }) => ({
        url: `/student/enrollment/admissions/applicants/${applicantId}/applications/start`,
        method: 'POST',
        params: { offeringId, inquiryId },
      }),
      transformResponse: (response: Result<AdmissionApplication> | AdmissionApplication) =>
        unwrap(response),
      invalidatesTags: [
        studentAdmissionsCrmType.admissionApplication,
        studentAdmissionsCrmType.admissionApplicant,
        studentAdmissionsCrmType.admissionInquiry,
      ],
    }),
    findAdmissionDirectFamilies: builder.query<
      AdmissionDirectFamilyMatch[],
      { offeringId: string; guardianMobile: string }
    >({
      query: (params) => ({
        url: '/student/enrollment/admissions/applications/direct-registration/family-matches',
        params,
      }),
      transformResponse: (
        response: Result<AdmissionDirectFamilyMatch[]> | AdmissionDirectFamilyMatch[]
      ) => unwrap(response),
    }),
    startAdmissionDirectRegistration: builder.mutation<
      AdmissionApplication,
      StartAdmissionDirectRegistrationInput
    >({
      query: (body) => ({
        url: '/student/enrollment/admissions/applications/direct-registration',
        method: 'POST',
        body,
      }),
      transformResponse: (response: Result<AdmissionApplication> | AdmissionApplication) =>
        unwrap(response),
      invalidatesTags: [
        studentAdmissionsCrmType.admissionApplication,
        studentAdmissionsCrmType.admissionApplicant,
      ],
    }),
    getAdmissionApplicationWorkflow: builder.query<AdmissionApplicationWorkflow, string>({
      query: (id) => `/student/enrollment/admissions/applications/${id}/workflow`,
      transformResponse: (
        response: Result<AdmissionApplicationWorkflow> | AdmissionApplicationWorkflow
      ) => unwrap(response),
      providesTags: [studentAdmissionsCrmType.admissionApplication],
    }),
    getAdmissionApplicationForm: builder.query<AdmissionApplicationForm, string>({
      query: (id) => `/student/enrollment/admissions/applications/${id}/form`,
      transformResponse: (response: Result<AdmissionApplicationForm> | AdmissionApplicationForm) =>
        unwrap(response),
      providesTags: [studentAdmissionsCrmType.admissionApplication],
    }),
    updateAdmissionApplicationFormValues: builder.mutation<
      AdmissionApplicationForm,
      {
        id: string;
        concurrencyStamp?: string | null;
        values: { fieldCode: string; valueJson?: string | null }[];
      }
    >({
      query: ({ id, concurrencyStamp, values }) => ({
        url: `/student/enrollment/admissions/applications/${id}/form-values`,
        method: 'PATCH',
        body: { concurrencyStamp, values },
      }),
      transformResponse: (response: Result<AdmissionApplicationForm> | AdmissionApplicationForm) =>
        unwrap(response),
      invalidatesTags: [studentAdmissionsCrmType.admissionApplication],
    }),
    submitAdmissionApplication: builder.mutation<
      {
        application: AdmissionApplication;
        validationErrors: string[];
        fieldErrors?: Record<string, string>;
      },
      string
    >({
      query: (id) => ({
        url: `/student/enrollment/admissions/applications/${id}/submit`,
        method: 'POST',
      }),
      transformResponse: (
        response:
          | Result<{ application: AdmissionApplication; validationErrors: string[] }>
          | { application: AdmissionApplication; validationErrors: string[] }
      ) => unwrap(response),
      invalidatesTags: [studentAdmissionsCrmType.admissionApplication],
    }),
    reopenAdmissionApplicationForm: builder.mutation<AdmissionApplicationForm, string>({
      query: (id) => ({
        url: `/student/enrollment/admissions/applications/${id}/form/reopen`,
        method: 'POST',
      }),
      transformResponse: (response: Result<AdmissionApplicationForm> | AdmissionApplicationForm) =>
        unwrap(response),
      invalidatesTags: [studentAdmissionsCrmType.admissionApplication],
    }),
    getAdmissionApplicationFormHistory: builder.query<AdmissionFormChangeHistory[], string>({
      query: (id) => `/student/enrollment/admissions/applications/${id}/form/history`,
      transformResponse: (
        response: Result<AdmissionFormChangeHistory[]> | AdmissionFormChangeHistory[]
      ) => unwrap(response),
      providesTags: [studentAdmissionsCrmType.admissionApplication],
    }),
    getAdmissionApplicationDecisionHistory: builder.query<
      AdmissionApplicationDecisionHistory[],
      string
    >({
      query: (id) => `/student/enrollment/admissions/applications/${id}/decision-history`,
      transformResponse: (
        response:
          Result<AdmissionApplicationDecisionHistory[]> | AdmissionApplicationDecisionHistory[]
      ) => unwrap(response),
      providesTags: [studentAdmissionsCrmType.admissionApplication],
    }),
    approveAdmissionApplication: builder.mutation<
      AdmissionApplication,
      { id: string; input: AdmissionApplicationDecisionInput }
    >({
      query: ({ id, input }) => ({
        url: `/student/enrollment/admissions/applications/${id}/decision/approve`,
        method: 'POST',
        body: input,
      }),
      transformResponse: (response: Result<AdmissionApplication> | AdmissionApplication) =>
        unwrap(response),
      invalidatesTags: [studentAdmissionsCrmType.admissionApplication],
    }),
    rejectAdmissionApplication: builder.mutation<
      AdmissionApplication,
      { id: string; input: AdmissionApplicationDecisionInput }
    >({
      query: ({ id, input }) => ({
        url: `/student/enrollment/admissions/applications/${id}/decision/reject`,
        method: 'POST',
        body: input,
      }),
      transformResponse: (response: Result<AdmissionApplication> | AdmissionApplication) =>
        unwrap(response),
      invalidatesTags: [studentAdmissionsCrmType.admissionApplication],
    }),
    waitlistAdmissionApplication: builder.mutation<
      AdmissionApplication,
      { id: string; input: AdmissionApplicationDecisionInput }
    >({
      query: ({ id, input }) => ({
        url: `/student/enrollment/admissions/applications/${id}/decision/waitlist`,
        method: 'POST',
        body: input,
      }),
      transformResponse: (response: Result<AdmissionApplication> | AdmissionApplication) =>
        unwrap(response),
      invalidatesTags: [studentAdmissionsCrmType.admissionApplication],
    }),
    getAdmissionFinalizationPreview: builder.query<AdmissionFinalizationPreview, string>({
      query: (id) => `/student/enrollment/admissions/applications/${id}/finalization-preview`,
      transformResponse: (
        response: Result<AdmissionFinalizationPreview> | AdmissionFinalizationPreview
      ) => unwrap(response),
      providesTags: [studentAdmissionsCrmType.admissionApplication],
    }),
    finalizeAdmissionApplication: builder.mutation<
      AdmissionFinalizationResult,
      { id: string; input: FinalizeAdmissionInput }
    >({
      query: ({ id, input }) => ({
        url: `/student/enrollment/admissions/applications/${id}/finalize`,
        method: 'POST',
        body: input,
      }),
      transformResponse: (
        response: Result<AdmissionFinalizationResult> | AdmissionFinalizationResult
      ) => unwrap(response),
      invalidatesTags: (result, _error, { input }) => [
        studentAdmissionsCrmType.admissionApplication,
        studentAdmissionsCrmType.admissionApplicant,
        studentAdmissionsCrmType.admissionOffering,
        { type: studentOnboardingType.onboardingCaseList, id: 'LIST' },
        { type: studentOnboardingType.onboardingAnalytics, id: 'SUMMARY' },
        ...(result
          ? [
              studentRegistrationType.studentRegistration,
              { type: studentType.student, id: 'RECORDS-DIRECTORY' },
              { type: studentType.student, id: 'LIST' },
              ...(input.applyStudentProfileFields
                ? [{ type: studentType.student, id: 'RECORDS-CHANGES' }]
                : []),
            ]
          : []),
      ],
    }),
    advanceAdmissionApplicationWorkflow: builder.mutation<
      AdmissionApplicationWorkflow,
      {
        id: string;
        expectedCurrentStageInstanceId: string;
        transitionDefinitionId?: string;
        idempotencyKey: string;
        concurrencyStamp?: string | null;
        reason?: string;
        skipCurrentStage?: boolean;
        adminOverride?: boolean;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/student/enrollment/admissions/applications/${id}/workflow/advance`,
        method: 'POST',
        body,
      }),
      transformResponse: (
        response: Result<AdmissionApplicationWorkflow> | AdmissionApplicationWorkflow
      ) => unwrap(response),
      invalidatesTags: [studentAdmissionsCrmType.admissionApplication],
    }),
  }),
});
export const {
  useGetAdmissionApplicationsQuery,
  useGetAdmissionApplicationQuery,
  useLazyGetAdmissionApplicationQuery,
  useGetAdmissionApplicationCounsellorsQuery,
  useAssignAdmissionApplicationCounsellorMutation,
  useStartAdmissionApplicationMutation,
  useLazyFindAdmissionDirectFamiliesQuery,
  useStartAdmissionDirectRegistrationMutation,
  useGetAdmissionApplicationWorkflowQuery,
  useGetAdmissionApplicationFormQuery,
  useUpdateAdmissionApplicationFormValuesMutation,
  useSubmitAdmissionApplicationMutation,
  useReopenAdmissionApplicationFormMutation,
  useGetAdmissionApplicationFormHistoryQuery,
  useGetAdmissionApplicationDecisionHistoryQuery,
  useApproveAdmissionApplicationMutation,
  useRejectAdmissionApplicationMutation,
  useWaitlistAdmissionApplicationMutation,
  useGetAdmissionFinalizationPreviewQuery,
  useFinalizeAdmissionApplicationMutation,
  useAdvanceAdmissionApplicationWorkflowMutation,
} = admissionApplicationsApi;
