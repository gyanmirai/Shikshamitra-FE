import { api } from 'src/redux/service';
import { financeModuleType, financePolicyType, studentAdmissionType } from 'src/redux/tagTypes';

export interface AssignmentServicePeriod {
  feeHeadId: string;
  source:
    'AcademicYear' | 'BoardAcademicYear' | 'Registration' | 'TransportService' | 'ManualOverride';
  sourceReferenceId?: string;
  startDate?: string;
  endDate?: string;
  reason?: string;
}

export interface AssignmentHead {
  feeHeadId: string;
  feeHeadName: string;
  isOptional: boolean;
  isOneTime: boolean;
  usesSingleServiceMonth?: boolean;
  included: boolean;
  configuredAmount: number | null;
  isVariable?: boolean;
  zeroAmountReason?: string;
  effectiveAmount: number | null;
  amountBasis: string;
  supportsMonthlyRate?: boolean;
  obligation: number;
  optionalServiceEndDate?: string;
  originalOptionalServiceEndDate?: string | null;
  canReviewOptionalServiceCancellation?: boolean;
  optionalServicePeriods?: OptionalServicePeriod[];
  paymentTermName?: string;
  paymentTermVersionNumber?: number;
  supportsTransportSource?: boolean;
  paymentTermId?: string;
  paymentTermVersionId?: string;
  servicePeriod?: AssignmentServicePeriod;
  verification: string;
}

export interface AssignmentLine {
  dueFeeId?: string;
  feeHeadId: string;
  feeHeadName: string;
  installmentLabel: string;
  sequence: number;
  coverageStartDate?: string | null;
  coverageEndDate?: string | null;
  coverageDays?: number | null;
  eligibleDays?: number | null;
  chargedDays?: number | null;
  optionalServicePeriodId?: string | null;
  dueDate: string;
  demandDate?: string;
  allocationPercentage: number;
  scheduledAmount: number;
  proratedAmount: number;
  reductionAmount?: number;
  ruleType?: string;
  factor?: number | null;
  roundingMode?: string | null;
  paidAmount: number;
  outstandingAmount: number;
  optionalServiceCancellationAmount?: number;
  explanation?: string;
}

export interface AssignmentPreview {
  registrationJoiningDate?: string | null;
  chargeStartDate?: string;
  chargeEndDate?: string;
  assignmentSource?: 'Admission' | 'Finance';
  applicationId?: string | null;
  policyOverrideReason?: string;
  originalPolicies?: AssignmentPolicy[];
  calculationVersion?: string;
  studentId: string;
  academicYearId: string;
  structureId: string;
  structureName: string;
  revisionNumber: number;
  currency: string;
  scheduledTotal: number;
  proratedTotal: number;
  reductionTotal: number;
  overrideReason?: string;
  previewToken: string;
  previewExpiresAt?: string | null;
  heads: AssignmentHead[];
  lines: AssignmentLine[];
  warnings: string[];
  policies: AssignmentPolicy[];
}

export const assignmentPolicyFamilies = [
  'concession',
  'refund',
  'collection',
  'proration',
] as const;
// Concession and legacy proration remain in read/write contracts for existing assignments.
// The assignment drawer offers only the policy families schools can choose here.
export const selectableAssignmentPolicyFamilies = ['refund', 'collection'] as const;
export type AssignmentPolicyFamily = (typeof assignmentPolicyFamilies)[number];
export interface AssignmentPolicy {
  family: AssignmentPolicyFamily;
  policyId: string;
  versionId: string;
  name: string;
  version: number;
  source?: string;
  description?: string;
  headTreatment: Record<string, string>;
}
export interface AssignmentPolicySelection {
  family: AssignmentPolicyFamily;
  versionId: string | null;
}
export interface OptionalServiceStopRequest {
  studentId: string;
  academicYearId: string;
  feeHeadId: string;
  lastServiceDate: string;
  reason: string;
  requestId: string;
}

export interface OptionalServiceStopResult {
  installmentCount: number;
  cancelledAmount: number;
  outstandingReduction?: number;
  prepaidCredit?: number;
  previewToken?: string;
}

export interface OptionalServicePeriod {
  id: string;
  startDate: string;
  endDate: string;
  cancellationEffectiveDate?: string | null;
  monthlyRate: number;
  prorationPolicyName: string;
  prorationPolicyVersion: number;
  assignedAmount: number;
}

interface OptionalServiceRestartScope {
  studentId: string;
  academicYearId: string;
  feeHeadId: string;
}

export interface OptionalServiceRestartOption {
  versionId: string;
  name: string;
  version: number;
}

export interface OptionalServiceRestartContext {
  earliestStartDate: string;
  latestEndDate: string;
  monthlyRate?: number | null;
  defaultProrationPolicyVersionId?: string | null;
  defaultPaymentTermVersionId?: string | null;
  prorationPolicies: OptionalServiceRestartOption[];
  paymentTerms: OptionalServiceRestartOption[];
  prepaidCredit: number;
}

export interface OptionalServiceRestartRequest extends OptionalServiceRestartScope {
  startDate: string;
  endDate: string;
  monthlyRate: number;
  prorationPolicyVersionId: string;
  paymentTermVersionId: string;
  requestId: string;
}

export interface OptionalServiceRestartResult {
  startDate: string;
  endDate: string;
  monthlyRate: number;
  scheduledTotal: number;
  prorationReduction: number;
  assignedTotal: number;
  prepaidCredit: number;
  lines: AssignmentLine[];
  existingInstallments?: {
    dueFeeId: string;
    installmentLabel: string;
    coverageStartDate: string;
    coverageEndDate: string;
    billedAmount: number;
    outstandingAmount: number;
  }[];
  previewToken?: string;
}

export interface AssignmentDetails {
  studentFeeStructureId?: string;
  canEditStructure?: boolean;
  structureEditBlocker?: string;
  assignment: AssignmentPreview;
  warnings: string[];
  concurrencyStamp: string;
}

export interface AssignmentHistoryChange {
  field: string;
  before: string | number | null;
  after: string | number | null;
  format?: 'date' | 'money' | null;
  feeHead?: string | null;
  detail?: string | null;
  installment?: string | null;
}

export interface AssignmentHistoryPage {
  totalCount: number;
  currency: string;
  hasIncompleteEvidence: boolean;
  items: {
    id: string;
    action: string;
    occurredAt: string;
    actor?: string | null;
    reason?: string | null;
    changes: AssignmentHistoryChange[];
  }[];
}

export interface AssignmentRequest {
  editAssignmentId?: string;
  assignmentConcurrencyStamp?: string;
  editReason?: string;
  policies?: AssignmentPolicySelection[];
  policyOverrideReason?: string;
  studentId: string;
  academicYearId: string;
  standardFeeStructureId: string;
  selectedOptionalFeeHeadIds: string[];
  servicePeriods: AssignmentServicePeriod[];
  chargePeriodSource?: 'BoardAcademicYear';
  chargeStartDate?: string;
  chargeEndDate?: string;
  feeHeadDetails: { feeHeadId: string; amount: number | null }[];
  variableFeeHeads?: {
    feeHeadId: string;
    amount: number | null;
    zeroAmountReason?: string;
    isMonthlyRate?: boolean;
  }[];
  overrideReason?: string;
  previewToken?: string;
}

export interface AssignmentCandidate {
  policies?: AssignmentPolicy[];
  id: string;
  name: string;
  revisionNumber: number;
  academicYearId: string;
  standardId: string;
  boardStartDate?: string;
  boardEndDate?: string;
  total: number;
  heads: AssignmentHead[];
}

export interface AssignmentStudent {
  canEditStructure?: boolean;
  structureEditBlocker?: string;
  assignmentId?: string;
  assignmentConcurrencyStamp?: string;
  structureId?: string;
  structureRevision?: number;
  assignmentState?: AssignmentContext['status'];
  assignmentSource?: 'Admission' | 'Finance';
  studentId: string;
  enrollmentId: string;
  standardId?: string;
  divisionId?: string;
  studentName: string;
  grNumber?: string;
  rollNumber?: number | null;
  standardDivision?: string;
  boardName?: string;
  mediumName?: string;
  stageName?: string;
  className?: string;
  divisionName?: string;
  isActive: boolean;
  isFeeStructureAssigned: boolean;
}

export interface AssignmentContext {
  canEditStructure?: boolean;
  structureEditBlocker?: string;
  assignmentConcurrencyStamp?: string;
  assignedAssignment?: AssignmentPreview | null;
  studentId: string;
  academicYearId: string;
  status: 'Unassigned' | 'Selected' | 'Prepared' | 'Assigned' | 'NeedsAttention';
  source: 'Admission' | 'Finance';
  assignmentId?: string | null;
  applicationId?: string | null;
  financeFeeAccountId?: string | null;
  structureId?: string | null;
  structureRevision?: number | null;
  joiningDate?: string | null;
  chargeStartDate?: string | null;
  chargeEndDate?: string | null;
  prorationPolicy?: AssignmentPolicy | null;
  admissionFeeHeadIds: string[];
  selectedOptionalFeeHeadIds: string[];
  variableFeeHeads: NonNullable<AssignmentRequest['variableFeeHeads']>;
  preparedAssignment?: AssignmentPreview | null;
  blocker?: string | null;
  errorCode?: string | null;
}

export interface AssignmentBulkPreview {
  results: {
    studentId: string;
    preview?: AssignmentPreview;
    errorCode?: string;
    errorMessage?: string;
  }[];
}

export interface AssignmentCommit {
  assignmentId: string;
  outcome: 'Assigned' | 'AlreadyAssigned';
  assignment: AssignmentPreview;
}

export interface AssignmentBulkResult {
  successCount: number;
  alreadyAssignedCount: number;
  skippedCount: number;
  failedCount: number;
  results: {
    studentId: string;
    outcome: string;
    errorCode?: string;
    errorMessage?: string;
    result?: AssignmentCommit;
  }[];
}

export function assignmentErrorCode(error: unknown): string {
  const data = (
    error as { data?: { error?: { code?: string }; code?: string; errorCode?: string } }
  )?.data;
  return data?.error?.code ?? data?.errorCode ?? data?.code ?? '';
}

export function assignmentError(error: unknown): string {
  const code = assignmentErrorCode(error);
  if (code.endsWith('OptionalServiceAlreadyStopped'))
    return 'This optional service has already been stopped. Reopen the assignment to see its saved status.';
  if (code.endsWith('NoFutureOptionalInstallments'))
    return 'No future unpaid installments can be cancelled for this fee and date.';
  if (code.endsWith('StructureEditBlocked'))
    return 'A payment or another financial change prevents replacing this assignment.';
  if (code.endsWith('MixedOriginalStructures'))
    return 'Select unpaid students with the same original fee structure and revision.';
  if (code.endsWith('VariableAmountRequired'))
    return 'Enter an amount for every included variable fee head.';
  if (code.endsWith('StalePreview'))
    return 'The preview expired or changed. Preview again before assigning.';
  if (code.endsWith('AlreadyAssigned'))
    return 'A different assignment already exists for this academic year. View its details.';
  if (code.endsWith('EnrollmentRequired'))
    return 'A matching accessible enrollment is required for this academic year.';
  if (code.endsWith('InactiveEnrollment'))
    return 'The student must be enrolled and active before assigning fees.';
  if (code.endsWith('StructureMismatch'))
    return "Select a published fee structure matching this student's class and academic year.";
  if (code.endsWith('InvalidInput'))
    return 'Review fee-head selections, amounts, service dates and required override reasons.';
  if (code.endsWith('OneTimeServiceMonth'))
    return 'Select a single calendar month for a one-time fee.';
  if (code.endsWith('SourceUnavailable'))
    return 'The admission or service facts could not be verified. Review the saved preparation and dates.';
  if (code.endsWith('JoiningDateRequired'))
    return 'Confirm the actual joining date in Admission before preparing these fees.';
  if (code.endsWith('JoiningDateInvalid'))
    return 'Review the admission joining date for the selected academic year.';
  if (code.endsWith('ConfigurationInvalid'))
    return 'Check published payment terms and policy versions for every included fee head.';
  return 'The request could not be completed. Check your access and configuration, then retry.';
}

const tags = [
  studentAdmissionType.studentAdmission,
  financeModuleType.feeCollection,
  financeModuleType.feeDetails,
];
const assignmentMutationTags = [...tags, financeModuleType.feeHead, financeModuleType.feeCategory];
const assignmentStudentTag = ({
  studentId,
  academicYearId,
}: {
  studentId: string;
  academicYearId: string;
}) => ({
  type: financeModuleType.studentFeeAssignment,
  id: `${academicYearId}:student:${studentId}`,
});
const assignmentYearTag = (academicYearId: string) => ({
  type: financeModuleType.studentFeeAssignment,
  id: `${academicYearId}:students`,
});
const assignmentChangedTags = (items: { studentId: string; academicYearId: string }[]) => [
  ...assignmentMutationTags,
  ...items.map(assignmentStudentTag),
  ...Array.from(new Set(items.map((x) => x.academicYearId))).map(assignmentYearTag),
];
export const studentFeeAssignmentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    assignmentContexts: builder.query<
      AssignmentContext[],
      { academicYearId: string; studentIds: string[]; includeEditDetails?: boolean }
    >({
      query: (body) => ({ url: '/student-fee-structure/contexts', method: 'POST', body }),
      providesTags: (_r, _e, { academicYearId, studentIds }) => [
        ...studentIds.map((studentId) => assignmentStudentTag({ studentId, academicYearId })),
        { type: financePolicyType.prorationPolicy, id: `year:${academicYearId}` },
        financeModuleType.feeStructure,
      ],
    }),
    assignmentPolicyOptions: builder.query<
      AssignmentPolicy[],
      { studentId: string; academicYearId: string }
    >({
      query: (params) => ({ url: '/student-fee-structure/policy-options', params }),
      providesTags: (_result, _error, { academicYearId }) => [
        financeModuleType.feeStructure,
        ...[
          financePolicyType.collectionPolicy,
          financePolicyType.concessionPolicy,
          financePolicyType.refundPolicy,
          financePolicyType.prorationPolicy,
        ].map((type) => ({ type, id: `year:${academicYearId}` })),
      ],
    }),
    assignmentUpdatePolicies: builder.mutation<
      AssignmentDetails,
      {
        studentId: string;
        academicYearId: string;
        concurrencyStamp: string;
        reason: string;
        policies: AssignmentPolicySelection[];
      }
    >({
      query: ({ studentId, ...body }) => ({
        url: `/student-fee-structure/student/${studentId}/policies`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, _error, arg) => (result ? assignmentChangedTags([arg]) : []),
    }),
    assignmentOptionalServiceStopPreview: builder.mutation<
      OptionalServiceStopResult,
      OptionalServiceStopRequest
    >({
      query: ({ studentId, ...body }) => ({
        url: `/student-fee-structure/student/${studentId}/optional-service-stop/preview`,
        method: 'POST',
        body,
      }),
    }),
    assignmentOptionalServiceStop: builder.mutation<
      OptionalServiceStopResult,
      OptionalServiceStopRequest & { previewToken: string }
    >({
      query: ({ studentId, ...body }) => ({
        url: `/student-fee-structure/student/${studentId}/optional-service-stop`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, _error, arg) => (result ? assignmentChangedTags([arg]) : []),
    }),
    assignmentOptionalServiceRestartContext: builder.query<
      OptionalServiceRestartContext,
      OptionalServiceRestartScope
    >({
      query: ({ studentId, ...params }) => ({
        url: `/student-fee-structure/student/${studentId}/optional-service-restart/context`,
        params,
      }),
      providesTags: (_result, _error, arg) => [assignmentStudentTag(arg)],
      keepUnusedDataFor: 0,
    }),
    assignmentOptionalServiceRestartPreview: builder.mutation<
      OptionalServiceRestartResult,
      OptionalServiceRestartRequest
    >({
      query: ({ studentId, ...body }) => ({
        url: `/student-fee-structure/student/${studentId}/optional-service-restart/preview`,
        method: 'POST',
        body,
      }),
    }),
    assignmentOptionalServiceRestart: builder.mutation<
      OptionalServiceRestartResult,
      OptionalServiceRestartRequest & { previewToken: string }
    >({
      query: ({ studentId, ...body }) => ({
        url: `/student-fee-structure/student/${studentId}/optional-service-restart`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, _error, arg) =>
        result
          ? [
              assignmentStudentTag(arg),
              assignmentYearTag(arg.academicYearId),
              financeModuleType.feeCollection,
              financeModuleType.feeDetails,
            ]
          : [],
    }),
    assignmentStudents: builder.query<
      { items: AssignmentStudent[]; totalCount: number },
      {
        academicYearId: string;
        standardId?: string;
        feeHeadId?: string;
        divisionId?: string;
        boardId?: string;
        educationMediumId?: string;
        search?: string;
        filters?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        skipCount: number;
        maxResultCount: number;
      }
    >({
      query: (params) => ({ url: '/student-fee-structure/students', params }),
      providesTags: (_r, _e, { academicYearId }) => [assignmentYearTag(academicYearId)],
    }),
    assignmentCandidates: builder.query<
      AssignmentCandidate[],
      { studentId: string; academicYearId: string }
    >({
      query: (params) => ({ url: '/student-fee-structure/candidates', params }),
      providesTags: [financeModuleType.feeStructure],
    }),
    assignmentTransportSources: builder.query<
      { id: string; label: string; startDate: string; endDate: string }[],
      { studentId: string; academicYearId: string }
    >({
      query: (params) => ({ url: '/student-fee-structure/transport-sources', params }),
    }),
    assignmentDetails: builder.query<
      AssignmentDetails,
      { studentId: string; academicYearId: string }
    >({
      query: ({ studentId, academicYearId }) => ({
        url: `/student-fee-structure/student/${studentId}`,
        params: { academicYearId },
      }),
      providesTags: (_r, _e, arg) => [assignmentStudentTag(arg)],
    }),
    assignmentHistory: builder.query<
      AssignmentHistoryPage,
      { studentId: string; academicYearId: string; skipCount: number; maxResultCount: number }
    >({
      query: ({ studentId, ...params }) => ({
        url: `/student-fee-structure/student/${studentId}/history`,
        params,
      }),
      providesTags: (_r, _e, arg) => [assignmentStudentTag(arg)],
    }),
    assignmentPreview: builder.mutation<AssignmentPreview, AssignmentRequest>({
      query: (body) => ({ url: '/student-fee-structure/preview', method: 'POST', body }),
    }),
    assignmentBulkPreview: builder.mutation<AssignmentBulkPreview, { items: AssignmentRequest[] }>({
      query: (body) => ({ url: '/student-fee-structure/preview-bulk', method: 'POST', body }),
    }),
    assignmentCommit: builder.mutation<AssignmentCommit, AssignmentRequest>({
      query: (body) => ({ url: '/student-fee-structure/assign', method: 'POST', body }),
      invalidatesTags: (result, _error, arg) => (result ? assignmentChangedTags([arg]) : []),
    }),
    assignmentBulkCommit: builder.mutation<AssignmentBulkResult, { items: AssignmentRequest[] }>({
      query: (body) => ({ url: '/student-fee-structure/assign-bulk', method: 'POST', body }),
      invalidatesTags: (result, _error, { items }) => {
        const succeeded = new Set(
          result?.results.filter((r) => r.result).map((r) => r.studentId) ?? []
        );
        return succeeded.size
          ? assignmentChangedTags(items.filter((item) => succeeded.has(item.studentId)))
          : [];
      },
    }),
  }),
});

export const {
  useAssignmentContextsQuery,
  useAssignmentPolicyOptionsQuery,
  useAssignmentUpdatePoliciesMutation,
  useAssignmentStudentsQuery,
  useAssignmentCandidatesQuery,
  useAssignmentDetailsQuery,
  useAssignmentHistoryQuery,
  useAssignmentPreviewMutation,
  useAssignmentBulkPreviewMutation,
  useAssignmentCommitMutation,
  useAssignmentBulkCommitMutation,
  useAssignmentTransportSourcesQuery,
  useAssignmentOptionalServiceStopPreviewMutation,
  useAssignmentOptionalServiceStopMutation,
  useAssignmentOptionalServiceRestartContextQuery,
  useAssignmentOptionalServiceRestartPreviewMutation,
  useAssignmentOptionalServiceRestartMutation,
} = studentFeeAssignmentApi;
