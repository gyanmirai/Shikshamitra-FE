import { api } from 'src/redux/service';
import { financeModuleType, financePolicyType, studentAdmissionType } from 'src/redux/tagTypes';

export interface AssignmentServicePeriod {
  feeHeadId: string;
  source: 'AcademicYear' | 'TransportService' | 'ManualOverride';
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
  included: boolean;
  configuredAmount: number | null;
  isVariable?: boolean;
  zeroAmountReason?: string;
  effectiveAmount: number | null;
  amountBasis: string;
  obligation: number;
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
  dueDate: string;
  demandDate?: string;
  allocationPercentage: number;
  scheduledAmount: number;
  proratedAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  explanation?: string;
}

export interface AssignmentPreview {
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
export interface AssignmentDetails {
  assignment: AssignmentPreview;
  warnings: string[];
  concurrencyStamp: string;
}

export interface AssignmentRequest {
  policies?: AssignmentPolicySelection[];
  policyOverrideReason?: string;
  studentId: string;
  academicYearId: string;
  standardFeeStructureId: string;
  selectedOptionalFeeHeadIds: string[];
  servicePeriods: AssignmentServicePeriod[];
  feeHeadDetails: { feeHeadId: string; amount: number }[];
  variableFeeHeads?: { feeHeadId: string; amount: number | null; zeroAmountReason?: string }[];
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
  total: number;
  heads: AssignmentHead[];
}

export interface AssignmentStudent {
  studentId: string;
  enrollmentId: string;
  standardId?: string;
  divisionId?: string;
  studentName: string;
  isActive: boolean;
  isFeeStructureAssigned: boolean;
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

export function assignmentError(error: unknown): string {
  const data = (
    error as { data?: { error?: { code?: string }; code?: string; errorCode?: string } }
  )?.data;
  const code = data?.error?.code ?? data?.errorCode ?? data?.code ?? '';
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
  if (code.endsWith('SourceUnavailable'))
    return 'The service source could not be verified. Review the service period.';
  if (code.endsWith('ConfigurationInvalid'))
    return 'Check published payment terms and policy versions for every included fee head.';
  return 'The request could not be completed. Check your access and configuration, then retry.';
}

const tags = [
  studentAdmissionType.studentAdmission,
  financeModuleType.feeCollection,
  financeModuleType.feeDetails,
];
export const studentFeeAssignmentApi = api.injectEndpoints({
  endpoints: (builder) => ({
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
      invalidatesTags: (result) => (result ? tags : []),
    }),
    assignmentStudents: builder.query<
      { items: AssignmentStudent[]; totalCount: number },
      {
        academicYearId: string;
        standardId?: string;
        divisionId?: string;
        boardId?: string;
        educationMediumId?: string;
        search?: string;
        skipCount: number;
        maxResultCount: number;
      }
    >({
      query: (params) => ({ url: '/student-fee-structure/students', params }),
      providesTags: tags,
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
      providesTags: tags,
    }),
    assignmentPreview: builder.mutation<AssignmentPreview, AssignmentRequest>({
      query: (body) => ({ url: '/student-fee-structure/preview', method: 'POST', body }),
    }),
    assignmentBulkPreview: builder.mutation<AssignmentBulkPreview, { items: AssignmentRequest[] }>({
      query: (body) => ({ url: '/student-fee-structure/preview-bulk', method: 'POST', body }),
    }),
    assignmentCommit: builder.mutation<AssignmentCommit, AssignmentRequest>({
      query: (body) => ({ url: '/student-fee-structure/assign', method: 'POST', body }),
      invalidatesTags: (result) => (result ? tags : []),
    }),
    assignmentBulkCommit: builder.mutation<AssignmentBulkResult, { items: AssignmentRequest[] }>({
      query: (body) => ({ url: '/student-fee-structure/assign-bulk', method: 'POST', body }),
      invalidatesTags: (result) => (result?.results.some((r) => r.result) ? tags : []),
    }),
  }),
});

export const {
  useAssignmentPolicyOptionsQuery,
  useAssignmentUpdatePoliciesMutation,
  useAssignmentStudentsQuery,
  useAssignmentCandidatesQuery,
  useAssignmentDetailsQuery,
  useAssignmentPreviewMutation,
  useAssignmentBulkPreviewMutation,
  useAssignmentCommitMutation,
  useAssignmentBulkCommitMutation,
  useAssignmentTransportSourcesQuery,
} = studentFeeAssignmentApi;
