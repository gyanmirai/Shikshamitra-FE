import { api } from 'src/redux/service';
import { studentAdmissionsCrmType } from 'src/redux/tagTypes';

export type AdmissionWorkflowStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type AdmissionWorkflowStageType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type AdmissionWorkflowStage = {
  id: string;
  workflowDefinitionId?: string;
  code: string;
  name: string;
  description?: string;
  stageType: AdmissionWorkflowStageType;
  displayOrder: number;
  isRequired: boolean;
  allowManualSkip: boolean;
  isEntryStage: boolean;
  isTerminalStage: boolean;
  configurationJson?: string;
};
export type AdmissionWorkflowTransition = {
  id: string;
  workflowDefinitionId?: string;
  fromStageId: string;
  toStageId: string;
  priority: number;
  conditionRuleJson?: string;
  isDefault: boolean;
};
export type AdmissionWorkflow = {
  id: string;
  name: string;
  code: string;
  description?: string;
  version: number;
  status: AdmissionWorkflowStatus;
  parentVersionId?: string | null;
  publishedAt?: string | null;
  publishedBy?: string | null;
  ownerUserId?: string | null;
  validatedAt?: string | null;
  validatedBy?: string | null;
  submittedAt?: string | null;
  submittedBy?: string | null;
  assignedApproverId?: string | null;
  approvedAt?: string | null;
  approvedBy?: string | null;
  scheduledPublishAt?: string | null;
  changeReason?: string | null;
  rollbackSourceVersionId?: string | null;
  offeringCount: number;
  campusCount?: number;
  applicationCount: number;
  concurrencyStamp: string;
  creationTime: string;
  lastModificationTime?: string | null;
  stages: AdmissionWorkflowStage[];
  transitions: AdmissionWorkflowTransition[];
};
export type CreateUpdateAdmissionWorkflow = {
  name: string;
  code: string;
  description?: string;
  concurrencyStamp?: string;
  stages: AdmissionWorkflowStage[];
  transitions: AdmissionWorkflowTransition[];
};
export type AdmissionWorkflowValidationIssue = {
  code: string;
  message: string;
  severity: 0 | 1;
  stageId?: string | null;
  transitionId?: string | null;
};
export type AdmissionWorkflowValidationResult = {
  isValid: boolean;
  issues: AdmissionWorkflowValidationIssue[];
  errors: string[];
  warnings: string[];
};
export type AdmissionWorkflowUsage = {
  workflowDefinitionId: string;
  offeringCount: number;
  campusCount?: number;
  applicationCount: number;
  canDelete: boolean;
  runtimeAnalytics?: {
    startedCount: number;
    activeCount: number;
    completedCount: number;
    completionRatePercent: number;
    averageCompletionHours?: number | null;
    stages: {
      definitionStageId: string;
      code: string;
      name: string;
      stageType: AdmissionWorkflowStageType;
      displayOrder: number;
      enteredCount: number;
      activeCount: number;
      completedCount: number;
      skippedCount: number;
      completionRatePercent: number;
      averageDurationHours?: number | null;
      oldestActiveEnteredAt?: string | null;
    }[];
  };
  offerings: {
    id: string;
    admissionCycleId: string;
    campusId?: string | null;
    admissionCycleName: string;
    code: string;
    isActive: boolean;
  }[];
};
export type AdmissionWorkflowStageTypeMetadata = {
  type: AdmissionWorkflowStageType;
  displayName: string;
  description: string;
  icon: string;
  defaultColor: string;
  supportedConfiguration: string[];
  runtimeHandler: string;
  nextRequiredAction: string;
  canBeEntryStage: boolean;
  canBeTerminalStage: boolean;
  supportsFormAttachment: boolean;
  supportsConditions: boolean;
  isRuntimeReady: boolean;
  isSelectable?: boolean;
  isDeprecated?: boolean;
  replacementGuidance?: string | null;
};
export type AdmissionWorkflowGovernanceSettings = {
  makerCheckerEnabled: boolean;
  inAppNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
};
export type AdmissionWorkflowApprover = { id: string; userName: string; name: string };
export type AdmissionWorkflowGovernanceHistory = {
  id: string;
  action: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  fromStatus?: AdmissionWorkflowStatus | null;
  toStatus: AdmissionWorkflowStatus;
  actorUserId?: string | null;
  actorName?: string | null;
  assignedApproverId?: string | null;
  assignedApproverName?: string | null;
  reason?: string | null;
  effectiveAt?: string | null;
  occurredAt: string;
};
export type AdmissionWorkflowNotification = {
  id: string;
  workflowDefinitionId: string;
  type: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string | null;
  creationTime: string;
};
const stageTypeNames: Record<string, AdmissionWorkflowStageType> = {
  inquiry: 0,
  form: 1,
  assessment: 2,
  eligibility: 3,
  payment: 4,
  documentverification: 5,
  review: 6,
  approval: 7,
  offer: 8,
  seat: 9,
  enrollment: 10,
  custom: 11,
  appointment: 12,
};

export const normalizeAdmissionWorkflowStageType = (value: unknown): AdmissionWorkflowStageType => {
  if (typeof value === 'number' && value >= 0 && value <= 12)
    return value as AdmissionWorkflowStageType;
  const normalized = String(value ?? '')
    .replace(/[ _-]/g, '')
    .toLowerCase();
  if (normalized in stageTypeNames) return stageTypeNames[normalized];
  const numeric = Number(normalized);
  return Number.isInteger(numeric) && numeric >= 0 && numeric <= 12
    ? (numeric as AdmissionWorkflowStageType)
    : 11;
};

const normalizeWorkflow = (workflow: AdmissionWorkflow): AdmissionWorkflow => ({
  ...workflow,
  stages: workflow.stages.map((stage) => ({
    ...stage,
    stageType: normalizeAdmissionWorkflowStageType(stage.stageType),
  })),
});

const normalizeWorkflowList = (result: { totalCount: number; items: AdmissionWorkflow[] }) => ({
  ...result,
  items: result.items.map(normalizeWorkflow),
});

const normalizeStageTypes = (items: AdmissionWorkflowStageTypeMetadata[]) =>
  items.map((item) => {
    const type = normalizeAdmissionWorkflowStageType(item.type);
    return {
      ...item,
      type,
      displayName: type === 7 ? 'Admission decision' : item.displayName,
      description:
        type === 7
          ? 'Record an authorized approve, waitlist, or reject decision.'
          : item.description,
      isSelectable: item.isSelectable ?? ![9, 10, 11, 12].includes(type),
      isDeprecated: item.isDeprecated ?? [9, 10, 11].includes(type),
    };
  });
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
export const admissionWorkflowsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionWorkflow: builder.query<AdmissionWorkflow, string>({
      query: (id) => ({ url: `/student/enrollment/admissions/workflows/${id}` }),
      transformResponse: (r: Result<AdmissionWorkflow> | AdmissionWorkflow) =>
        normalizeWorkflow(unwrap(r)),
      providesTags: (_result, _error, id) => [
        { type: studentAdmissionsCrmType.admissionWorkflow, id },
      ],
    }),
    getAdmissionWorkflows: builder.query<
      { totalCount: number; items: AdmissionWorkflow[] },
      {
        search?: string;
        status?: AdmissionWorkflowStatus;
        version?: number;
        isUsed?: boolean;
        createdFrom?: string;
        createdTo?: string;
        skipCount?: number;
        maxResultCount?: number;
      }
    >({
      query: (params) => ({ url: '/student/enrollment/admissions/workflows', params }),
      transformResponse: (
        r:
          | Result<{ totalCount: number; items: AdmissionWorkflow[] }>
          | { totalCount: number; items: AdmissionWorkflow[] }
      ) => normalizeWorkflowList(unwrap(r)),
      providesTags: (result) => [
        { type: studentAdmissionsCrmType.admissionWorkflow, id: 'LIST' },
        ...(result?.items.map((workflow) => ({
          type: studentAdmissionsCrmType.admissionWorkflow,
          id: workflow.id,
        })) ?? []),
      ],
    }),
    createAdmissionWorkflow: builder.mutation<AdmissionWorkflow, CreateUpdateAdmissionWorkflow>({
      query: (body) => ({ url: '/student/enrollment/admissions/workflows', method: 'POST', body }),
      transformResponse: (r: Result<AdmissionWorkflow> | AdmissionWorkflow) =>
        normalizeWorkflow(unwrap(r)),
      invalidatesTags: [{ type: studentAdmissionsCrmType.admissionWorkflow, id: 'LIST' }],
    }),
    updateAdmissionWorkflow: builder.mutation<
      AdmissionWorkflow,
      { id: string; body: CreateUpdateAdmissionWorkflow }
    >({
      query: ({ id, body }) => ({
        url: `/student/enrollment/admissions/workflows/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (r: Result<AdmissionWorkflow> | AdmissionWorkflow) =>
        normalizeWorkflow(unwrap(r)),
      invalidatesTags: (_result, _error, { id }) => [
        { type: studentAdmissionsCrmType.admissionWorkflow, id },
        { type: studentAdmissionsCrmType.admissionWorkflow, id: 'LIST' },
        { type: studentAdmissionsCrmType.admissionWorkflow, id: `VERSIONS-${id}` },
      ],
    }),
    deleteAdmissionWorkflow: builder.mutation<void, { id: string; concurrencyStamp: string }>({
      query: ({ id, concurrencyStamp }) => ({
        url: `/student/enrollment/admissions/workflows/${id}`,
        method: 'DELETE',
        params: { concurrencyStamp },
      }),
      invalidatesTags: [{ type: studentAdmissionsCrmType.admissionWorkflow, id: 'LIST' }],
    }),
    cloneAdmissionWorkflow: builder.mutation<
      AdmissionWorkflow,
      { id: string; body: { name: string; code: string; description?: string } }
    >({
      query: ({ id, body }) => ({
        url: `/student/enrollment/admissions/workflows/${id}/clone`,
        method: 'POST',
        body,
      }),
      transformResponse: (r: Result<AdmissionWorkflow> | AdmissionWorkflow) =>
        normalizeWorkflow(unwrap(r)),
      invalidatesTags: [{ type: studentAdmissionsCrmType.admissionWorkflow, id: 'LIST' }],
    }),
    createAdmissionWorkflowVersion: builder.mutation<AdmissionWorkflow, string>({
      query: (id) => ({
        url: `/student/enrollment/admissions/workflows/${id}/new-version`,
        method: 'POST',
      }),
      transformResponse: (r: Result<AdmissionWorkflow> | AdmissionWorkflow) =>
        normalizeWorkflow(unwrap(r)),
      invalidatesTags: (_result, _error, id) => [
        { type: studentAdmissionsCrmType.admissionWorkflow, id: 'LIST' },
        { type: studentAdmissionsCrmType.admissionWorkflow, id },
        { type: studentAdmissionsCrmType.admissionWorkflow, id: `VERSIONS-${id}` },
      ],
    }),
    validateAdmissionWorkflow: builder.mutation<AdmissionWorkflowValidationResult, string>({
      query: (id) => ({
        url: `/student/enrollment/admissions/workflows/${id}/validate`,
        method: 'POST',
      }),
      transformResponse: (
        r: Result<AdmissionWorkflowValidationResult> | AdmissionWorkflowValidationResult
      ) => unwrap(r),
      invalidatesTags: (_result, _error, id) => [
        { type: studentAdmissionsCrmType.admissionWorkflow, id },
        { type: studentAdmissionsCrmType.admissionWorkflow, id: 'LIST' },
      ],
    }),
    publishAdmissionWorkflowWithGovernance: builder.mutation<
      AdmissionWorkflow,
      { id: string; changeReason: string; effectiveAt?: string; concurrencyStamp?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/student/enrollment/admissions/workflows/${id}/governance/publish`,
        method: 'POST',
        body,
      }),
      transformResponse: (r: Result<AdmissionWorkflow> | AdmissionWorkflow) =>
        normalizeWorkflow(unwrap(r)),
      invalidatesTags: (_result, _error, { id }) => [
        { type: studentAdmissionsCrmType.admissionWorkflow, id },
        { type: studentAdmissionsCrmType.admissionWorkflow, id: 'LIST' },
        { type: studentAdmissionsCrmType.admissionWorkflow, id: `VERSIONS-${id}` },
      ],
    }),
    submitAdmissionWorkflowForApproval: builder.mutation<
      AdmissionWorkflow,
      { id: string; approverUserId: string; changeReason: string; concurrencyStamp?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/student/enrollment/admissions/workflows/${id}/submit-for-approval`,
        method: 'POST',
        body,
      }),
      transformResponse: (r: Result<AdmissionWorkflow> | AdmissionWorkflow) =>
        normalizeWorkflow(unwrap(r)),
      invalidatesTags: (_result, _error, { id }) => [
        { type: studentAdmissionsCrmType.admissionWorkflow, id },
        { type: studentAdmissionsCrmType.admissionWorkflow, id: 'LIST' },
      ],
    }),
    approveAdmissionWorkflow: builder.mutation<
      AdmissionWorkflow,
      { id: string; reason?: string; concurrencyStamp?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/student/enrollment/admissions/workflows/${id}/approve`,
        method: 'POST',
        body,
      }),
      transformResponse: (r: Result<AdmissionWorkflow> | AdmissionWorkflow) =>
        normalizeWorkflow(unwrap(r)),
      invalidatesTags: (_result, _error, { id }) => [
        { type: studentAdmissionsCrmType.admissionWorkflow, id },
        { type: studentAdmissionsCrmType.admissionWorkflow, id: 'LIST' },
      ],
    }),
    rejectAdmissionWorkflow: builder.mutation<
      AdmissionWorkflow,
      { id: string; reason: string; concurrencyStamp?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/student/enrollment/admissions/workflows/${id}/reject`,
        method: 'POST',
        body,
      }),
      transformResponse: (r: Result<AdmissionWorkflow> | AdmissionWorkflow) =>
        normalizeWorkflow(unwrap(r)),
      invalidatesTags: (_result, _error, { id }) => [
        { type: studentAdmissionsCrmType.admissionWorkflow, id },
        { type: studentAdmissionsCrmType.admissionWorkflow, id: 'LIST' },
      ],
    }),
    createAdmissionWorkflowRollbackDraft: builder.mutation<
      AdmissionWorkflow,
      { id: string; changeReason: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/student/enrollment/admissions/workflows/${id}/rollback-draft`,
        method: 'POST',
        body,
      }),
      transformResponse: (r: Result<AdmissionWorkflow> | AdmissionWorkflow) =>
        normalizeWorkflow(unwrap(r)),
      invalidatesTags: (_result, _error, { id }) => [
        { type: studentAdmissionsCrmType.admissionWorkflow, id: 'LIST' },
        { type: studentAdmissionsCrmType.admissionWorkflow, id: `VERSIONS-${id}` },
      ],
    }),
    getAdmissionWorkflowGovernanceSettings: builder.query<
      AdmissionWorkflowGovernanceSettings,
      void
    >({
      query: () => ({ url: '/student/enrollment/admissions/workflows/governance/settings' }),
      transformResponse: (
        r: Result<AdmissionWorkflowGovernanceSettings> | AdmissionWorkflowGovernanceSettings
      ) => unwrap(r),
      providesTags: [
        { type: studentAdmissionsCrmType.admissionWorkflow, id: 'GOVERNANCE-SETTINGS' },
      ],
    }),
    updateAdmissionWorkflowGovernanceSettings: builder.mutation<
      AdmissionWorkflowGovernanceSettings,
      AdmissionWorkflowGovernanceSettings
    >({
      query: (body) => ({
        url: '/student/enrollment/admissions/workflows/governance/settings',
        method: 'PUT',
        body,
      }),
      transformResponse: (
        r: Result<AdmissionWorkflowGovernanceSettings> | AdmissionWorkflowGovernanceSettings
      ) => unwrap(r),
      invalidatesTags: [
        { type: studentAdmissionsCrmType.admissionWorkflow, id: 'GOVERNANCE-SETTINGS' },
      ],
    }),
    getAdmissionWorkflowApprovers: builder.query<AdmissionWorkflowApprover[], string | void>({
      query: (filter) => ({
        url: '/student/enrollment/admissions/workflows/governance/approvers',
        params: filter ? { filter } : undefined,
      }),
      transformResponse: (r: Result<AdmissionWorkflowApprover[]> | AdmissionWorkflowApprover[]) =>
        unwrap(r),
    }),
    getAdmissionWorkflowGovernanceHistory: builder.query<
      AdmissionWorkflowGovernanceHistory[],
      string
    >({
      query: (id) => ({ url: `/student/enrollment/admissions/workflows/${id}/governance/history` }),
      transformResponse: (
        r: Result<AdmissionWorkflowGovernanceHistory[]> | AdmissionWorkflowGovernanceHistory[]
      ) => unwrap(r),
      providesTags: (_result, _error, id) => [
        { type: studentAdmissionsCrmType.admissionWorkflow, id: `GOVERNANCE-${id}` },
      ],
    }),
    getAdmissionWorkflowNotifications: builder.query<
      AdmissionWorkflowNotification[],
      boolean | void
    >({
      query: (unreadOnly) => ({
        url: '/student/enrollment/admissions/workflows/governance/notifications',
        params: unreadOnly ? { unreadOnly: true } : undefined,
      }),
      transformResponse: (
        r: Result<AdmissionWorkflowNotification[]> | AdmissionWorkflowNotification[]
      ) => unwrap(r),
    }),
    markAdmissionWorkflowNotificationRead: builder.mutation<void, string>({
      query: (notificationId) => ({
        url: `/student/enrollment/admissions/workflows/governance/notifications/${notificationId}/read`,
        method: 'POST',
      }),
    }),
    publishAdmissionWorkflow: builder.mutation<
      AdmissionWorkflow,
      { id: string; concurrencyStamp?: string }
    >({
      query: ({ id, concurrencyStamp }) => ({
        url: `/student/enrollment/admissions/workflows/${id}/publish`,
        method: 'POST',
        params: concurrencyStamp ? { concurrencyStamp } : undefined,
      }),
      transformResponse: (r: Result<AdmissionWorkflow> | AdmissionWorkflow) =>
        normalizeWorkflow(unwrap(r)),
      invalidatesTags: (_result, _error, { id }) => [
        { type: studentAdmissionsCrmType.admissionWorkflow, id },
        { type: studentAdmissionsCrmType.admissionWorkflow, id: 'LIST' },
        { type: studentAdmissionsCrmType.admissionWorkflow, id: `VERSIONS-${id}` },
      ],
    }),
    archiveAdmissionWorkflow: builder.mutation<
      AdmissionWorkflow,
      { id: string; concurrencyStamp: string }
    >({
      query: ({ id, concurrencyStamp }) => ({
        url: `/student/enrollment/admissions/workflows/${id}/archive`,
        method: 'POST',
        params: { concurrencyStamp },
      }),
      transformResponse: (r: Result<AdmissionWorkflow> | AdmissionWorkflow) =>
        normalizeWorkflow(unwrap(r)),
      invalidatesTags: (_result, _error, input) => [
        { type: studentAdmissionsCrmType.admissionWorkflow, id: input.id },
        { type: studentAdmissionsCrmType.admissionWorkflow, id: 'LIST' },
        { type: studentAdmissionsCrmType.admissionWorkflow, id: `VERSIONS-${input.id}` },
      ],
    }),
    getAdmissionWorkflowVersions: builder.query<AdmissionWorkflow[], string>({
      query: (id) => ({ url: `/student/enrollment/admissions/workflows/${id}/versions` }),
      transformResponse: (r: Result<AdmissionWorkflow[]> | AdmissionWorkflow[]) =>
        unwrap(r).map(normalizeWorkflow),
      providesTags: (_result, _error, id) => [
        { type: studentAdmissionsCrmType.admissionWorkflow, id: `VERSIONS-${id}` },
      ],
    }),
    getAdmissionWorkflowUsage: builder.query<AdmissionWorkflowUsage, string>({
      query: (id) => ({ url: `/student/enrollment/admissions/workflows/${id}/usage` }),
      transformResponse: (r: Result<AdmissionWorkflowUsage> | AdmissionWorkflowUsage) => unwrap(r),
    }),
    getAdmissionWorkflowStageTypes: builder.query<AdmissionWorkflowStageTypeMetadata[], void>({
      query: () => ({ url: '/student/enrollment/admissions/workflows/stage-types' }),
      transformResponse: (
        r: Result<AdmissionWorkflowStageTypeMetadata[]> | AdmissionWorkflowStageTypeMetadata[]
      ) => normalizeStageTypes(unwrap(r)),
    }),
  }),
});
export const {
  useGetAdmissionWorkflowsQuery,
  useLazyGetAdmissionWorkflowsQuery,
  useGetAdmissionWorkflowQuery,
  useLazyGetAdmissionWorkflowQuery,
  useCreateAdmissionWorkflowMutation,
  useUpdateAdmissionWorkflowMutation,
  useDeleteAdmissionWorkflowMutation,
  useCloneAdmissionWorkflowMutation,
  useCreateAdmissionWorkflowVersionMutation,
  useValidateAdmissionWorkflowMutation,
  usePublishAdmissionWorkflowMutation,
  usePublishAdmissionWorkflowWithGovernanceMutation,
  useSubmitAdmissionWorkflowForApprovalMutation,
  useApproveAdmissionWorkflowMutation,
  useRejectAdmissionWorkflowMutation,
  useCreateAdmissionWorkflowRollbackDraftMutation,
  useGetAdmissionWorkflowGovernanceSettingsQuery,
  useUpdateAdmissionWorkflowGovernanceSettingsMutation,
  useGetAdmissionWorkflowApproversQuery,
  useGetAdmissionWorkflowGovernanceHistoryQuery,
  useGetAdmissionWorkflowNotificationsQuery,
  useMarkAdmissionWorkflowNotificationReadMutation,
  useArchiveAdmissionWorkflowMutation,
  useGetAdmissionWorkflowVersionsQuery,
  useGetAdmissionWorkflowUsageQuery,
  useGetAdmissionWorkflowStageTypesQuery,
} = admissionWorkflowsApi;
