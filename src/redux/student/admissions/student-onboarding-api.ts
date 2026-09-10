import { api } from 'src/redux/service';
import { studentAdmissionsCrmType } from 'src/redux/tagTypes';

export type StudentOnboardingStatus = 0 | 1 | 2 | 3 | 4 | 5;
export type StudentOnboardingStepStatus = 0 | 1 | 2 | 3 | 4 | 5;

export type StudentOnboardingStep = {
  id: string;
  key: string;
  label: string;
  displayOrder: number;
  required: boolean;
  status: StudentOnboardingStepStatus;
  detail?: string | null;
  completedByUserId?: string | null;
  completedAt?: string | null;
  waiverReason?: string | null;
};

export type StudentOnboardingEvent = {
  id: string;
  eventType: string;
  description: string;
  metadataJson?: string | null;
  actorUserId?: string | null;
  occurredAt: string;
};

export type StudentOnboardingCase = {
  id: string;
  concurrencyStamp: string;
  applicationId: string;
  applicationNumber: string;
  applicantId: string;
  studentId: string;
  studentName: string;
  offeringId: string;
  offeringCode: string;
  academicYearId: string;
  academicYearName: string;
  intendedBoardId: string;
  intendedMediumId: string;
  intendedStageId: string;
  intendedStandardId: string;
  intendedStandardName: string;
  status: StudentOnboardingStatus;
  assignedToUserId?: string | null;
  assignedToUserName?: string | null;
  dueAt: string;
  isHistoricalBackfill: boolean;
  divisionId?: string | null;
  divisionName?: string | null;
  seatReservationId?: string | null;
  grNumber?: string | null;
  rollNumber?: number | null;
  studentEnrollmentId?: string | null;
  startedAt?: string | null;
  readyAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  lastError?: string | null;
  primaryBlocker?: string | null;
  progressPercent: number;
  isOverdue: boolean;
  creationTime: string;
  steps: StudentOnboardingStep[];
  events: StudentOnboardingEvent[];
};

export type StudentOnboardingPolicy = {
  id: string;
  concurrencyStamp: string;
  academicYearId: string;
  offeringId?: string | null;
  standardId?: string | null;
  name: string;
  requireDocuments: boolean;
  requireFamilyDetails: boolean;
  requireCommunicationDetails: boolean;
  requireMedicalDetails: boolean;
  requireFeeClearance: boolean;
  requireStudentAccount: boolean;
  requireGuardianAccount: boolean;
  requireServiceConsent: boolean;
  seatReservationMinutes: number;
  slaHours: number;
  isActive: boolean;
};

export type StudentIdentifierSeries = {
  id: string;
  concurrencyStamp: string;
  academicYearId: string;
  standardId?: string | null;
  identifierType: number;
  code: string;
  name: string;
  prefix: string;
  suffix: string;
  padding: number;
  nextSequence: number;
  maximumSequence?: number | null;
  effectiveFrom: string;
  effectiveUntil?: string | null;
  isActive: boolean;
  nextPreview: string;
};

export type StudentOnboardingServiceHandoff = {
  id: string;
  onboardingCaseId: string;
  serviceKey: string;
  required: boolean;
  status: number;
  attemptCount: number;
  lastAttemptAt?: string | null;
  acknowledgedAt?: string | null;
  lastError?: string | null;
};

export type StudentOnboardingPlacementOption = {
  id: string;
  name: string;
  capacity: number;
  activeEnrollments: number;
  liveReservations: number;
  availableSeats: number;
  isFull: boolean;
};

export type StudentOnboardingFilterOptions = {
  academicYears: Array<{ id: string; name: string }>;
  standards: Array<{ id: string; name: string }>;
};

export type StudentOnboardingAnalytics = {
  activeCases: number;
  pending: number;
  inProgress: number;
  readyForActivation: number;
  needsAttention: number;
  overdue: number;
  completed: number;
  cancelled: number;
};

export type HistoricalAdmissionReconciliation = {
  totalHistoricalApplications: number;
  alreadyLinked: number;
  readyToBackfill: number;
  backfilled: number;
  invalid: number;
  issues: Array<{ applicationId: string; applicationNumber: string; reason: string }>;
};

type Result<T> = { data?: T };
const unwrap = <T>(response: Result<T> | T): T =>
  response && typeof response === 'object' && 'data' in response && response.data !== undefined
    ? response.data
    : (response as T);

const onboardingTags = [studentAdmissionsCrmType.studentOnboarding];

export const studentOnboardingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStudentOnboardingCases: builder.query<
      { totalCount: number; items: StudentOnboardingCase[] },
      {
        search?: string;
        status?: number;
        academicYearId?: string;
        standardId?: string;
        assignedToUserId?: string;
        overdueOnly?: boolean;
        unassignedOnly?: boolean;
        skipCount?: number;
        maxResultCount?: number;
      }
    >({
      query: (params) => ({ url: '/student/onboarding', params }),
      transformResponse: (
        response:
          | Result<{ totalCount: number; items: StudentOnboardingCase[] }>
          | { totalCount: number; items: StudentOnboardingCase[] }
      ) => unwrap(response),
      providesTags: onboardingTags,
    }),
    getStudentOnboardingFilterOptions: builder.query<StudentOnboardingFilterOptions, void>({
      query: () => '/student/onboarding/filter-options',
      transformResponse: (
        response: Result<StudentOnboardingFilterOptions> | StudentOnboardingFilterOptions
      ) => unwrap(response),
      providesTags: onboardingTags,
    }),
    getStudentOnboardingAnalytics: builder.query<StudentOnboardingAnalytics, void>({
      query: () => '/student/onboarding/analytics',
      transformResponse: (
        response: Result<StudentOnboardingAnalytics> | StudentOnboardingAnalytics
      ) => unwrap(response),
      providesTags: onboardingTags,
    }),
    assignStudentOnboardingOwner: builder.mutation<
      StudentOnboardingCase,
      { id: string; concurrencyStamp: string; userId?: string | null }
    >({
      query: ({ id, ...body }) => ({
        url: `/student/onboarding/${id}/owner`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: Result<StudentOnboardingCase> | StudentOnboardingCase) =>
        unwrap(response),
      invalidatesTags: onboardingTags,
    }),
    refreshStudentOnboardingReadiness: builder.mutation<
      StudentOnboardingCase,
      { id: string; concurrencyStamp: string }
    >({
      query: ({ id, concurrencyStamp }) => ({
        url: `/student/onboarding/${id}/readiness/refresh`,
        method: 'POST',
        params: { concurrencyStamp },
      }),
      transformResponse: (response: Result<StudentOnboardingCase> | StudentOnboardingCase) =>
        unwrap(response),
      invalidatesTags: onboardingTags,
    }),
    getStudentOnboardingCase: builder.query<StudentOnboardingCase, string>({
      query: (id) => `/student/onboarding/${id}`,
      transformResponse: (response: Result<StudentOnboardingCase> | StudentOnboardingCase) =>
        unwrap(response),
      providesTags: onboardingTags,
    }),
    getStudentOnboardingPlacementOptions: builder.query<StudentOnboardingPlacementOption[], string>(
      {
        query: (id) => `/student/onboarding/${id}/placement-options`,
        transformResponse: (
          response: Result<StudentOnboardingPlacementOption[]> | StudentOnboardingPlacementOption[]
        ) => unwrap(response),
        providesTags: onboardingTags,
      }
    ),
    getAvailableStudentIdentifierSeries: builder.query<StudentIdentifierSeries[], string>({
      query: (id) => `/student/onboarding/${id}/identifier-series`,
      transformResponse: (
        response: Result<StudentIdentifierSeries[]> | StudentIdentifierSeries[]
      ) => unwrap(response),
      providesTags: onboardingTags,
    }),
    updateStudentOnboardingStep: builder.mutation<
      StudentOnboardingCase,
      {
        id: string;
        stepKey: string;
        concurrencyStamp: string;
        status: StudentOnboardingStepStatus;
        detail?: string;
        waiverReason?: string;
      }
    >({
      query: ({ id, stepKey, ...body }) => ({
        url: `/student/onboarding/${id}/steps/${stepKey}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: Result<StudentOnboardingCase> | StudentOnboardingCase) =>
        unwrap(response),
      invalidatesTags: onboardingTags,
    }),
    setStudentOnboardingPlacement: builder.mutation<
      StudentOnboardingCase,
      { id: string; concurrencyStamp: string; divisionId: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/student/onboarding/${id}/placement`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: Result<StudentOnboardingCase> | StudentOnboardingCase) =>
        unwrap(response),
      invalidatesTags: onboardingTags,
    }),
    allocateStudentOnboardingIdentifier: builder.mutation<
      StudentOnboardingCase,
      {
        id: string;
        concurrencyStamp: string;
        numberSeriesId: string;
        rollNumber: number;
        manualValue?: string;
        overrideReason?: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/student/onboarding/${id}/identifiers`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: Result<StudentOnboardingCase> | StudentOnboardingCase) =>
        unwrap(response),
      invalidatesTags: onboardingTags,
    }),
    previewStudentOnboardingActivation: builder.query<StudentOnboardingCase, string>({
      query: (id) => `/student/onboarding/${id}/activation-preview`,
      transformResponse: (response: Result<StudentOnboardingCase> | StudentOnboardingCase) =>
        unwrap(response),
      providesTags: onboardingTags,
    }),
    activateStudentOnboarding: builder.mutation<
      StudentOnboardingCase,
      { id: string; concurrencyStamp: string; idempotencyKey: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/student/onboarding/${id}/activate`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: Result<StudentOnboardingCase> | StudentOnboardingCase) =>
        unwrap(response),
      invalidatesTags: onboardingTags,
    }),
    cancelStudentOnboarding: builder.mutation<
      StudentOnboardingCase,
      { id: string; concurrencyStamp: string; reason: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/student/onboarding/${id}/cancel`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: Result<StudentOnboardingCase> | StudentOnboardingCase) =>
        unwrap(response),
      invalidatesTags: onboardingTags,
    }),
    getStudentOnboardingPolicies: builder.query<StudentOnboardingPolicy[], string>({
      query: (academicYearId) => ({
        url: '/student/onboarding/settings/policies',
        params: { academicYearId },
      }),
      transformResponse: (
        response: Result<StudentOnboardingPolicy[]> | StudentOnboardingPolicy[]
      ) => unwrap(response),
      providesTags: onboardingTags,
    }),
    createStudentOnboardingPolicy: builder.mutation<
      StudentOnboardingPolicy,
      Omit<StudentOnboardingPolicy, 'id' | 'concurrencyStamp'>
    >({
      query: (body) => ({ url: '/student/onboarding/settings/policies', method: 'POST', body }),
      transformResponse: (response: Result<StudentOnboardingPolicy> | StudentOnboardingPolicy) =>
        unwrap(response),
      invalidatesTags: onboardingTags,
    }),
    updateStudentOnboardingPolicy: builder.mutation<
      StudentOnboardingPolicy,
      StudentOnboardingPolicy
    >({
      query: ({ id, ...body }) => ({
        url: `/student/onboarding/settings/policies/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: Result<StudentOnboardingPolicy> | StudentOnboardingPolicy) =>
        unwrap(response),
      invalidatesTags: onboardingTags,
    }),
    getStudentIdentifierSeries: builder.query<StudentIdentifierSeries[], string>({
      query: (academicYearId) => ({
        url: '/student/onboarding/settings/identifier-series',
        params: { academicYearId },
      }),
      transformResponse: (
        response: Result<StudentIdentifierSeries[]> | StudentIdentifierSeries[]
      ) => unwrap(response),
      providesTags: onboardingTags,
    }),
    createStudentIdentifierSeries: builder.mutation<
      StudentIdentifierSeries,
      {
        academicYearId: string;
        standardId?: string;
        identifierType: number;
        code: string;
        name: string;
        prefix: string;
        suffix: string;
        padding: number;
        startingSequence: number;
        maximumSequence?: number;
        effectiveFrom: string;
        effectiveUntil?: string;
      }
    >({
      query: (body) => ({
        url: '/student/onboarding/settings/identifier-series',
        method: 'POST',
        body,
      }),
      transformResponse: (response: Result<StudentIdentifierSeries> | StudentIdentifierSeries) =>
        unwrap(response),
      invalidatesTags: onboardingTags,
    }),
    deactivateStudentIdentifierSeries: builder.mutation<
      StudentIdentifierSeries,
      { id: string; concurrencyStamp: string }
    >({
      query: ({ id, concurrencyStamp }) => ({
        url: `/student/onboarding/settings/identifier-series/${id}/deactivate`,
        method: 'POST',
        params: { concurrencyStamp },
      }),
      transformResponse: (response: Result<StudentIdentifierSeries> | StudentIdentifierSeries) =>
        unwrap(response),
      invalidatesTags: onboardingTags,
    }),
    getHistoricalAdmissionReconciliation: builder.query<HistoricalAdmissionReconciliation, void>({
      query: () => '/student/onboarding/settings/historical-reconciliation',
      transformResponse: (
        response: Result<HistoricalAdmissionReconciliation> | HistoricalAdmissionReconciliation
      ) => unwrap(response),
      providesTags: onboardingTags,
    }),
    backfillHistoricalAdmissions: builder.mutation<HistoricalAdmissionReconciliation, void>({
      query: () => ({
        url: '/student/onboarding/settings/historical-reconciliation/backfill',
        method: 'POST',
      }),
      transformResponse: (
        response: Result<HistoricalAdmissionReconciliation> | HistoricalAdmissionReconciliation
      ) => unwrap(response),
      invalidatesTags: onboardingTags,
    }),
    getStudentOnboardingHandoffs: builder.query<StudentOnboardingServiceHandoff[], string>({
      query: (id) => `/student/onboarding/${id}/service-handoffs`,
      transformResponse: (
        response: Result<StudentOnboardingServiceHandoff[]> | StudentOnboardingServiceHandoff[]
      ) => unwrap(response),
      providesTags: onboardingTags,
    }),
    retryStudentOnboardingHandoff: builder.mutation<
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
      invalidatesTags: onboardingTags,
    }),
  }),
});

export const {
  useGetStudentOnboardingCasesQuery,
  useGetStudentOnboardingFilterOptionsQuery,
  useGetStudentOnboardingAnalyticsQuery,
  useGetStudentOnboardingCaseQuery,
  useGetStudentOnboardingPlacementOptionsQuery,
  useGetAvailableStudentIdentifierSeriesQuery,
  useAssignStudentOnboardingOwnerMutation,
  useRefreshStudentOnboardingReadinessMutation,
  useUpdateStudentOnboardingStepMutation,
  useSetStudentOnboardingPlacementMutation,
  useAllocateStudentOnboardingIdentifierMutation,
  usePreviewStudentOnboardingActivationQuery,
  useActivateStudentOnboardingMutation,
  useCancelStudentOnboardingMutation,
  useGetStudentOnboardingPoliciesQuery,
  useCreateStudentOnboardingPolicyMutation,
  useUpdateStudentOnboardingPolicyMutation,
  useGetStudentIdentifierSeriesQuery,
  useCreateStudentIdentifierSeriesMutation,
  useDeactivateStudentIdentifierSeriesMutation,
  useGetHistoricalAdmissionReconciliationQuery,
  useBackfillHistoricalAdmissionsMutation,
  useGetStudentOnboardingHandoffsQuery,
  useRetryStudentOnboardingHandoffMutation,
} = studentOnboardingApi;
