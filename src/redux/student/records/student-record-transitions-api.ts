import type { FeeProrationResult } from 'src/redux/finance/fee-proration-result';

import { api } from 'src/redux/service';
import { studentType, organizationType, financeModuleType } from 'src/redux/tagTypes';

import { unwrapRecordsResult } from './student-records-api';

import type { AdmissionForm } from '../admissions/admission-forms-api';
import type { AdmissionEntryMode } from '../admissions/admission-offerings-api';
import type { StudentPortalAccount } from '../onboarding/student-onboarding-api';
import type { AdmissionInquirySource } from '../admissions/admission-inquiries-api';
import type { RecordsPage, RecordsOutcome, RecordsReturnRoute } from './student-records-types';

export type TransitionRow = {
  rollAssignmentMode?: 'manual' | 'automatic';
  studentId: string;
  outcome: RecordsOutcome;
  targetAcademicYearId?: string;
  targetStandardId?: string;
  targetDivisionId?: string;
  rollNumber?: number | null;
  effectiveDate: string;
  reason: string;
  studentConcurrencyStamp?: string;
  enrollmentConcurrencyStamp?: string;
};
export type TransitionIssue = { code: string; message: string };
export type TransitionPreviewRow = {
  approvalRequired?: boolean;
  outstandingItems?: TransitionIssue[];
  proration?: FeeProrationResult | null;
  rollAssignmentMode?: 'manual' | 'automatic';
  proposedRollNumber?: number | null;
  transitionId?: string | null;
  studentId: string;
  studentName?: string;
  outcome: RecordsOutcome;
  ready: boolean;
  issues: TransitionIssue[];
  studentConcurrencyStamp: string;
  enrollmentConcurrencyStamp: string;
  rollNumberScope?: 'class' | 'class-division';
  onboardingRollApprovalRequired?: boolean;
};
export type TransitionPreview = {
  items: TransitionPreviewRow[];
  readyCount: number;
  exceptionCount: number;
  canSubmit: boolean;
  batchExceptionMode: 'ReadyOnly' | 'HoldAll';
  policyVersionId?: string | null;
};
export type StudentTransition = {
  outstandingOverrideRequired?: boolean;
  outstandingItems?: TransitionIssue[];
  id: string;
  batchId: string;
  studentId: string;
  studentName?: string;
  academicYearId: string;
  outcome: RecordsOutcome;
  status: string;
  reason: string;
  effectiveDate: string;
  targetAcademicYearId?: string | null;
  targetStandardId?: string | null;
  targetDivisionId?: string | null;
  rollNumber?: number | null;
  currentApprovalStage: number;
  approvalStageCount: number;
  canApprove: boolean;
  canCancel: boolean;
  canApply: boolean;
  canCorrect: boolean;
  concurrencyStamp: string;
  renewalCaseId?: string | null;
  admissionApplicationId?: string | null;
  admissionInquiryId?: string | null;
  correctionOfId?: string | null;
  lastError?: string | null;
  history: {
    action: string;
    actorId: string;
    stage: number;
    remarks: string;
    occurredAt: string;
  }[];
};
export type StudentRenewal = {
  id: string;
  studentId: string;
  studentName?: string;
  academicYearId: string;
  standardId: string;
  divisionId: string;
  rollNumber?: number | null;
  status: 'PendingChecklist' | 'Provisioning' | 'Completed' | 'Cancelled';
  concurrencyStamp: string;
  guardianReviewRequired: boolean;
  guardianReviewConfirmed: boolean;
  financeRequired: boolean;
  portalReviewRequired: boolean;
  issues: TransitionIssue[];
};
export type RenewalPortalOptions = {
  studentRequired: boolean;
  guardianRequired: boolean;
  canProvision: boolean;
  studentEmail?: string | null;
  guardians: { relationship: 'father' | 'mother' | 'guardian'; name: string; email: string }[];
  accounts: StudentPortalAccount[];
};
export type TransitionQuery = {
  academicYearId?: string;
  studentId?: string;
  status?: string;
  skipCount?: number;
  maxResultCount?: number;
};
export type TransitionOptions = {
  rollAssignmentMode: 'manual' | 'automatic' | 'both';
  academicYears: { id: string; name: string }[];
  standards: { id: string; name: string; parentId?: string }[];
  divisions: { id: string; name: string; parentId?: string }[];
  offerings: {
    id: string;
    name: string;
    entryMode?: AdmissionEntryMode | null;
    inquiryIntake?: ReturnInquiryIntake | null;
  }[];
  resumeApplications: { id: string; name: string }[];
  freshApplicationRequiresRegistration: boolean;
  returnPolicy: { allowedRoutes: RecordsReturnRoute[]; defaultRoute: RecordsReturnRoute };
};
export type ReturnInquiryIntake = {
  form?: AdmissionForm | null;
  allowedSources: AdmissionInquirySource[];
  requireSourceDetailFor: AdmissionInquirySource[];
  requireGuardianEmail: boolean;
  requireApplicantDateOfBirth: boolean;
  boundValues: { fieldCode: string; valueJson?: string | null }[];
  serverBoundFieldCodes: string[];
};
export type ReturnInquiry = {
  source: AdmissionInquirySource;
  sourceDetail?: string;
  preferredLanguageCode: string;
  formValues: { fieldCode: string; valueJson?: string | null }[];
};
export type ReturnRequest = {
  entryPath?: 0 | 1;
  inquiry?: ReturnInquiry;
  rollAssignmentMode?: 'manual' | 'automatic';
  studentConcurrencyStamp?: string;
  enrollmentConcurrencyStamp?: string;
  studentId: string;
  targetAcademicYearId: string;
  targetStandardId?: string;
  targetDivisionId?: string;
  rollNumber?: number | null;
  effectiveDate?: string;
  route?: RecordsReturnRoute;
  idempotencyKey: string;
  reason: string;
  admissionOfferingId?: string;
  resumeApplicationId?: string;
  registration?: Record<string, unknown>;
};
export type StudentRecordReturnResult = {
  studentId: string;
  route: RecordsReturnRoute;
  renewalCaseId?: string | null;
  transitionId?: string | null;
  admissionApplicationId?: string | null;
  admissionInquiryId?: string | null;
  status: string;
};
export type SchoolExitSummary = {
  studentId: string;
  studentName: string | null;
  academicYearId: string;
  studentConcurrencyStamp: string;
  enrollmentConcurrencyStamp: string;
  canSubmit: boolean;
  fees: { status: 'Clear' | 'Pending' | 'Unavailable' | 'Restricted'; detail: string; outstandingAmount: number | null };
  library: { status: 'Clear' | 'Pending'; detail: string; pendingCount: number };
  documents: { status: 'Available' | 'NotApplicable' | 'Restricted'; detail: string; items: { name: string; status: string }[] };
  pendingTransitions: StudentTransition[];
};
const transitionsTag = [{ type: studentType.student, id: 'RECORDS-TRANSITIONS' }];
const renewalsTag = [{ type: studentType.student, id: 'RECORDS-RENEWALS' }];
const withdrawalFinanceTags = [
  financeModuleType.feeCollection,
  financeModuleType.feeDetails,
  financeModuleType.feeAdjustment,
  financeModuleType.feeRefund,
  financeModuleType.financeAudit,
];
export const studentRecordTransitionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSchoolExitSummary: builder.query<SchoolExitSummary, { studentId: string; academicYearId: string; outcome?: RecordsOutcome; effectiveDate?: string }>({
      query: (params) => ({ url: '/students/records/transitions/school-exit-summary', params }),
      transformResponse: (response: SchoolExitSummary | { data?: SchoolExitSummary }) => unwrapRecordsResult(response),
      providesTags: transitionsTag,
    }),
    getStudentRecordTransitionOptions: builder.query<
      TransitionOptions,
      { academicYearId?: string; studentId?: string; admissionOfferingId?: string }
    >({
      query: (params) => ({ url: '/students/records/transitions/options', params }),
      transformResponse: (response: TransitionOptions | { data?: TransitionOptions }) =>
        unwrapRecordsResult(response),
      providesTags: [organizationType.academicHierarchyOptions],
    }),
    getStudentRecordTransitions: builder.query<RecordsPage<StudentTransition>, TransitionQuery>({
      query: (params) => ({ url: '/students/records/transitions', params }),
      transformResponse: (
        response: RecordsPage<StudentTransition> | { data?: RecordsPage<StudentTransition> }
      ) => unwrapRecordsResult(response),
      providesTags: transitionsTag,
    }),
    getStudentRecordTransition: builder.query<StudentTransition, string>({
      query: (id) => `/students/records/transitions/${id}`,
      transformResponse: (response: StudentTransition | { data?: StudentTransition }) =>
        unwrapRecordsResult(response),
      providesTags: transitionsTag,
    }),
    previewStudentRecordTransitions: builder.mutation<
      TransitionPreview,
      { academicYearId: string; items: TransitionRow[] }
    >({
      query: (body) => ({ url: '/students/records/transitions/preview', method: 'POST', body }),
      transformResponse: (response: TransitionPreview | { data?: TransitionPreview }) =>
        unwrapRecordsResult(response),
    }),
    submitStudentRecordTransitions: builder.mutation<
      { batchId: string; items: StudentTransition[]; exceptions: TransitionPreviewRow[] },
      { academicYearId: string; idempotencyKey: string; items: TransitionRow[] }
    >({
      query: (body) => ({ url: '/students/records/transitions/batches', method: 'POST', body }),
      transformResponse: (
        response:
          | { batchId: string; items: StudentTransition[]; exceptions: TransitionPreviewRow[] }
          | {
              data?: {
                batchId: string;
                items: StudentTransition[];
                exceptions: TransitionPreviewRow[];
              };
            }
      ) => unwrapRecordsResult(response),
      invalidatesTags: (result, error) =>
        error
          ? []
          : [
              studentType.student,
              ...(result?.items.some(
                (item) => item.outcome === 'Withdraw' && item.status === 'Applied'
              )
                ? withdrawalFinanceTags
                : []),
            ],
    }),
    decideStudentRecordTransition: builder.mutation<
      StudentTransition,
      {
        id: string;
        command: 'approve' | 'reject' | 'cancel' | 'apply';
        outstandingReason?: string;
        concurrencyStamp: string;
        remarks: string;
      }
    >({
      query: ({ id, command, ...body }) => ({
        url: `/students/records/transitions/${id}/${command}`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: StudentTransition | { data?: StudentTransition }) =>
        unwrapRecordsResult(response),
      invalidatesTags: (result, error) =>
        error
          ? []
          : [
              studentType.student,
              ...(result?.outcome === 'Withdraw' && result.status === 'Applied'
                ? withdrawalFinanceTags
                : []),
            ],
    }),
    correctStudentRecordTransition: builder.mutation<
      TransitionPreviewRow,
      {
        id: string;
        concurrencyStamp: string;
        idempotencyKey: string;
        reason: string;
        previewOnly: boolean;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/students/records/transitions/${id}/correct`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: TransitionPreviewRow | { data?: TransitionPreviewRow }) =>
        unwrapRecordsResult(response),
      invalidatesTags: (_result, error, body) =>
        error || body.previewOnly ? [] : [studentType.student, ...withdrawalFinanceTags],
    }),
    getStudentRecordRenewals: builder.query<RecordsPage<StudentRenewal>, TransitionQuery>({
      query: (params) => ({ url: '/students/records/transitions/renewals', params }),
      transformResponse: (
        response: RecordsPage<StudentRenewal> | { data?: RecordsPage<StudentRenewal> }
      ) => unwrapRecordsResult(response),
      providesTags: renewalsTag,
    }),
    getStudentRecordRenewal: builder.query<StudentRenewal, string>({
      query: (id) => `/students/records/transitions/renewals/${id}`,
      transformResponse: (response: StudentRenewal | { data?: StudentRenewal }) =>
        unwrapRecordsResult(response),
      providesTags: renewalsTag,
    }),
    getStudentRecordRenewalPortalOptions: builder.query<RenewalPortalOptions, string>({
      query: (id) => `/students/records/transitions/renewals/${id}/portal-options`,
      transformResponse: (response: RenewalPortalOptions | { data?: RenewalPortalOptions }) =>
        unwrapRecordsResult(response),
      providesTags: renewalsTag,
    }),
    provisionStudentRecordRenewalPortal: builder.mutation<
      StudentPortalAccount,
      {
        id: string;
        accountType: 'student' | 'guardian';
        relationship: 'self' | 'father' | 'mother' | 'guardian';
        email: string;
        relationshipVerified: boolean;
        linkExistingGuardian: boolean;
        concurrencyStamp: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/students/records/transitions/renewals/${id}/portal-accounts`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: StudentPortalAccount | { data?: StudentPortalAccount }) =>
        unwrapRecordsResult(response),
      invalidatesTags: (_result, error) => (error ? [] : [studentType.student]),
    }),
    updateStudentRecordRenewal: builder.mutation<
      StudentRenewal,
      { id: string; command: 'confirm' | 'activate'; concurrencyStamp: string; remarks: string }
    >({
      query: ({ id, command, ...body }) => ({
        url: `/students/records/transitions/renewals/${id}/${command}`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: StudentRenewal | { data?: StudentRenewal }) =>
        unwrapRecordsResult(response),
      invalidatesTags: (_result, error) => (error ? [] : [studentType.student]),
    }),
    returnStudentRecord: builder.mutation<StudentRecordReturnResult, ReturnRequest>({
      query: (body) => ({ url: '/students/records/transitions/returns', method: 'POST', body }),
      transformResponse: (
        response: StudentRecordReturnResult | { data?: StudentRecordReturnResult }
      ) => unwrapRecordsResult(response),
      invalidatesTags: (_result, error) => (error ? [] : [studentType.student]),
    }),
    previewReturningStudentRecord: builder.mutation<TransitionPreviewRow, ReturnRequest>({
      query: (body) => ({
        url: '/students/records/transitions/returns/preview',
        method: 'POST',
        body,
      }),
      transformResponse: (response: TransitionPreviewRow | { data?: TransitionPreviewRow }) =>
        unwrapRecordsResult(response),
    }),
  }),
});
export const {
  useGetSchoolExitSummaryQuery,
  useGetStudentRecordTransitionOptionsQuery,
  useGetStudentRecordTransitionsQuery,
  useGetStudentRecordTransitionQuery,
  usePreviewStudentRecordTransitionsMutation,
  useSubmitStudentRecordTransitionsMutation,
  useDecideStudentRecordTransitionMutation,
  useCorrectStudentRecordTransitionMutation,
  useGetStudentRecordRenewalsQuery,
  useGetStudentRecordRenewalQuery,
  useGetStudentRecordRenewalPortalOptionsQuery,
  useProvisionStudentRecordRenewalPortalMutation,
  useUpdateStudentRecordRenewalMutation,
  useReturnStudentRecordMutation,
  usePreviewReturningStudentRecordMutation,
} = studentRecordTransitionsApi;
