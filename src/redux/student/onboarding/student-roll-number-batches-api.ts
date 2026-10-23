import { api } from 'src/redux/service';
import { studentType, studentOnboardingType } from 'src/redux/tagTypes';

export type RollNumberScope = { academicYearId: string; standardId: string; divisionId: string };
export type RollBatchOperation = 'assign-missing' | 'renumber';
export type RollNumberBatch = RollNumberScope & {
  caseIds?: string[] | null;
  approvalRequired?: boolean;
  approvalStages?: string[][];
  policyVersionId?: string | null;
  scopeLabel: string;
  id: string;
  creationTime: string;
  concurrencyStamp: string;
  operation: RollBatchOperation;
  status: 'Preview' | 'PendingApproval' | 'Approved' | 'Applied' | 'Rejected';
  reason: string;
  reasonRequired: boolean;
  idempotencyKey?: string | null;
  grouping: 'mixed' | 'boys-first' | 'girls-first';
  sortBy: 'studentName' | 'grNumber' | 'admissionDate' | 'admissionNumber';
  nameFormat: 'first-name-first' | 'surname-first';
  sortDirection: 'ascending' | 'descending';
  totalCount: number;
  blockedCount: number;
  canSubmit: boolean;
  canDecide: boolean;
  canApply: boolean;
  appliedAt?: string | null;
  items: {
    studentId: string;
    studentName: string;
    currentRollNumber?: number | null;
    proposedRollNumber?: number | null;
    issue?: string | null;
  }[];
};
export type RollBatchContext = {
  scopeLabel: string;
  unassignedCount: number;
  canAssignMissing: boolean;
  canRenumber: boolean;
  blockedReason?: string | null;
  batches: RollNumberBatch[];
};
type Envelope<T> = T | { data?: T };
const unwrap = <T>(response: Envelope<T>): T =>
  response && typeof response === 'object' && 'data' in response && response.data !== undefined
    ? response.data
    : (response as T);
const base = '/students/roll-number-batches';
const refresh = [
  studentOnboardingType.rollNumberBatch,
  studentOnboardingType.onboardingCaseList,
  studentOnboardingType.onboardingCaseDetail,
  studentOnboardingType.onboardingAnalytics,
  { type: studentType.student, id: 'RECORDS-DIRECTORY' },
  { type: studentType.student, id: 'RECORDS-CHANGES' },
  { type: studentType.student, id: 'LIST' },
];
export const studentRollNumberBatchesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRollNumberBatchContext: builder.query<RollBatchContext, RollNumberScope>({
      query: (params) => ({ url: `${base}/context`, params }),
      transformResponse: (response: Envelope<RollBatchContext>) => unwrap(response),
      providesTags: [
        studentOnboardingType.rollNumberBatch,
        studentOnboardingType.onboardingCaseList,
        studentOnboardingType.onboardingSettings,
      ],
    }),
    previewRollNumberBatch: builder.mutation<
      RollNumberBatch,
      RollNumberScope & { operation: RollBatchOperation; caseIds?: string[] }
    >({
      query: (body) => ({ url: `${base}/preview`, method: 'POST', body }),
      transformResponse: (response: Envelope<RollNumberBatch>) => unwrap(response),
    }),
    getRollNumberBatch: builder.query<
      RollNumberBatch,
      { id: string; skipCount: number; maxResultCount: number }
    >({
      query: ({ id, ...params }) => ({ url: `${base}/${id}`, params }),
      transformResponse: (response: Envelope<RollNumberBatch>) => unwrap(response),
      providesTags: (_result, _error, { id }) => [
        { type: studentOnboardingType.rollNumberBatch, id },
      ],
    }),
    submitRollNumberBatch: builder.mutation<
      RollNumberBatch,
      { id: string; concurrencyStamp: string; idempotencyKey: string; reason: string }
    >({
      query: ({ id, ...body }) => ({ url: `${base}/${id}/submit`, method: 'POST', body }),
      transformResponse: (response: Envelope<RollNumberBatch>) => unwrap(response),
      invalidatesTags: (result, error) =>
        error
          ? []
          : result?.status === 'Applied'
            ? refresh
            : [studentOnboardingType.rollNumberBatch],
    }),
    decideRollNumberBatch: builder.mutation<
      RollNumberBatch,
      { id: string; concurrencyStamp: string; approve: boolean; reason: string }
    >({
      query: ({ id, ...body }) => ({ url: `${base}/${id}/decision`, method: 'POST', body }),
      transformResponse: (response: Envelope<RollNumberBatch>) => unwrap(response),
      invalidatesTags: (_result, error) => (error ? [] : [studentOnboardingType.rollNumberBatch]),
    }),
    applyRollNumberBatch: builder.mutation<
      RollNumberBatch,
      { id: string; concurrencyStamp: string; idempotencyKey: string; reason: string }
    >({
      query: ({ id, ...body }) => ({ url: `${base}/${id}/apply`, method: 'POST', body }),
      transformResponse: (response: Envelope<RollNumberBatch>) => unwrap(response),
      invalidatesTags: (_result, error) => (error ? [] : refresh),
    }),
  }),
});
export const {
  useGetRollNumberBatchContextQuery,
  usePreviewRollNumberBatchMutation,
  useLazyGetRollNumberBatchQuery,
  useSubmitRollNumberBatchMutation,
  useDecideRollNumberBatchMutation,
  useApplyRollNumberBatchMutation,
} = studentRollNumberBatchesApi;
