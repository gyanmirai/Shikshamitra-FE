import { employeeType } from 'src/redux/tagTypes';

import { employeeApi } from '../hr/employeeApi';

export type PayrollApprovalSettings = {
  mode: 'Legacy' | 'Active' | 'Paused' | 'SectionReview';
  version: number;
  approverId: string | null;
  allowSelfFinalization: boolean;
  sectionRoutes?: PayrollSectionRoute[];
};

type PayrollSectionOption = { id: string; name: string };

export type PayrollSectionRoute = { stageId: string; roleId: string };

type PayrollSectionOptions = {
  stages: PayrollSectionOption[];
  roles: PayrollSectionOption[];
};

export type PayrollMonth = { month: string; academicYearId: string };
export type PayrollBatchAction = 'finalize' | 'withdraw' | 'return' | 'return-stale' | 'review';
export type PayrollBatch = {
  id: string;
  state: 'Pending' | 'Finalized' | 'Returned' | 'Withdrawn' | 'Reviewed';
  version: number;
  staffCount: number;
  netPay: number;
  submitterId: string;
  approverId: string;
  isStale: boolean;
  selfFinalization: boolean;
  reasonCode: string | null;
  stageId?: string;
  stageName?: string;
  reviewerRoleId?: string;
  reviewerRoleName?: string;
  resolvedByName?: string | null;
  resolvedAt?: string | null;
  resolutionReason?: string | null;
  allowedActions: PayrollBatchAction[];
};

type PayrollBatchRow = {
  employeeId: string;
  employeeName: string;
  employeeIdentifier: string;
  payableDays: number;
  totalEarnings: number;
  totalDeduction: number;
  netPay: number;
};

type SettingCommand = { expectedVersion: number; reason: string };

type SubmitPayrollRequest = PayrollMonth & {
  previewRunId: string;
  expectedSettingsVersion: number;
  commandKey: string;
  employeeIds: string[];
};

const approvalTags = [employeeType.runPayroll];

export const payrollApprovalApi = employeeApi.injectEndpoints({
  endpoints: (builder) => ({
    payrollApprovalSettings: builder.query<PayrollApprovalSettings, void>({
      query: () => '/payroll/run/approval-settings',
      providesTags: approvalTags,
    }),
    payrollApprovers: builder.query<{ id: string; name: string }[], string>({
      query: (search) => ({ url: '/payroll/run/approval-settings/approvers', params: { search } }),
    }),
    payrollSectionOptions: builder.query<PayrollSectionOptions, void>({
      query: () => '/payroll/run/approval-settings/section-options',
      providesTags: approvalTags,
    }),
    payrollSectionReviewers: builder.query<PayrollSectionOption[], PayrollSectionRoute>({
      query: (params) => ({ url: '/payroll/run/approval-settings/section-reviewers', params }),
      providesTags: approvalTags,
    }),
    configurePayrollSections: builder.mutation<
      PayrollApprovalSettings,
      SettingCommand & { sectionRoutes: PayrollSectionRoute[] }
    >({
      query: (body) => ({ url: '/payroll/run/approval-settings/sections', method: 'PUT', body }),
      invalidatesTags: (_result, error) => (error ? [] : approvalTags),
    }),
    configurePayrollApproval: builder.mutation<
      PayrollApprovalSettings,
      SettingCommand & { approverId: string; allowSelfFinalization: boolean }
    >({
      query: (body) => ({ url: '/payroll/run/approval-settings', method: 'PUT', body }),
      invalidatesTags: (_result, error) => (error ? [] : approvalTags),
    }),
    changePayrollApprovalMode: builder.mutation<
      PayrollApprovalSettings,
      SettingCommand & { action: 'activate' | 'pause' | 'resume' }
    >({
      query: ({ action, ...body }) => ({
        url: `/payroll/run/approval-settings/${action}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, error) => (error ? [] : approvalTags),
    }),
    payrollSubmissions: builder.query<PayrollBatch[], PayrollMonth>({
      query: (params) => ({ url: '/payroll/run/submissions', params }),
      providesTags: approvalTags,
    }),
    payrollSubmission: builder.query<
      { submission: PayrollBatch; items: PayrollBatchRow[] },
      string
    >({
      query: (id) => `/payroll/run/submissions/${id}`,
      providesTags: approvalTags,
    }),
    submitPayroll: builder.mutation<
      PayrollBatch,
      SubmitPayrollRequest & { selfFinalize: boolean; previousSubmissionId?: string }
    >({
      query: (body) => ({ url: '/payroll/run/submissions', method: 'POST', body }),
      invalidatesTags: (_result, error) => (error ? [] : approvalTags),
    }),
    submitPayrollSectionReviews: builder.mutation<PayrollBatch[], SubmitPayrollRequest>({
      query: (body) => ({ url: '/payroll/run/section-reviews', method: 'POST', body }),
      invalidatesTags: (_result, error) => (error ? [] : approvalTags),
    }),
    resolvePayrollSubmission: builder.mutation<
      PayrollBatch,
      {
        id: string;
        action: PayrollBatchAction;
        expectedVersion: number;
        commandKey: string;
        reason?: string;
      }
    >({
      query: ({ id, action, ...body }) => ({
        url: `/payroll/run/submissions/${id}/${action}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, error) => (error ? [] : approvalTags),
    }),
  }),
});

export const {
  usePayrollApprovalSettingsQuery,
  usePayrollApproversQuery,
  usePayrollSectionOptionsQuery,
  usePayrollSectionReviewersQuery,
  useConfigurePayrollSectionsMutation,
  useConfigurePayrollApprovalMutation,
  useChangePayrollApprovalModeMutation,
  usePayrollSubmissionsQuery,
  usePayrollSubmissionQuery,
  useSubmitPayrollMutation,
  useSubmitPayrollSectionReviewsMutation,
  useResolvePayrollSubmissionMutation,
} = payrollApprovalApi;
