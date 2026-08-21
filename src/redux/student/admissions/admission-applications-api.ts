import { api } from 'src/redux/service';
import { studentAdmissionsCrmType } from 'src/redux/tagTypes';

export type AdmissionApplicationStatus = 0 | 1 | 2 | 3;
export type AdmissionApplication = {
  id: string;
  concurrencyStamp?: string | null;
  applicationNumber: string;
  applicantId: string;
  applicantName: string;
  admissionCycleId: string;
  admissionOfferingId: string;
  status: AdmissionApplicationStatus;
  currentStageInstanceId?: string | null;
  lastSavedAt?: string | null;
  submittedAt?: string | null;
};
export type AdmissionApplicationListInput = {
  status?: AdmissionApplicationStatus;
  search?: string;
  skipCount?: number;
  maxResultCount?: number;
  admissionCycleId?: string;
  admissionOfferingId?: string;
  currentStageInstanceId?: string;
  currentStageSearch?: string;
};
export type AdmissionApplicationStage = {
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
  placeholder?: string | null;
  helpText?: string | null;
  optionsJson?: string | null;
  validationJson?: string | null;
  visibilityRuleJson?: string | null;
  requiredRuleJson?: string | null;
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
  fields: AdmissionFormField[];
};
export type AdmissionApplicationForm = {
  formInstanceId: string;
  formDefinitionId: string;
  formVersion: number;
  status: 0 | 1 | 2;
  submittedAt?: string | null;
  academicYearId: string;
  definition: { name: string; layoutType: number; fieldsPerRow: 1 | 2 | 3 | 4; sections: AdmissionFormSection[] };
  values: { fieldCode: string; valueJson?: string | null }[];
};
export type AdmissionFormChangeHistory = {
  id: string;
  changeType: string;
  changedFieldsJson?: string | null;
  changedBy?: string | null;
  occurredAt: string;
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
  useStartAdmissionApplicationMutation,
  useGetAdmissionApplicationWorkflowQuery,
  useGetAdmissionApplicationFormQuery,
  useUpdateAdmissionApplicationFormValuesMutation,
  useSubmitAdmissionApplicationMutation,
  useReopenAdmissionApplicationFormMutation,
  useGetAdmissionApplicationFormHistoryQuery,
  useAdvanceAdmissionApplicationWorkflowMutation,
} = admissionApplicationsApi;
