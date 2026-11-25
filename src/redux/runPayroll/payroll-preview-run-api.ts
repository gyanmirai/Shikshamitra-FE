import { employeeType } from 'src/redux/tagTypes';

import { employeeApi } from '../hr/employeeApi';

export type PayrollPreviewStatus = {
  lastCompletedRunId?: string | null;
  id: string;
  month: string;
  academicYearId: string | null;
  status: 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'SUPERSEDED' | 'FAILED';
  employeeCount: number;
  completedEmployees: number;
  isCurrent: boolean;
  createdAtUtc: string;
  startedAtUtc: string | null;
  completedAtUtc: string | null;
  errorCode: string | null;
  errorMessage: string | null;
};

export type PayrollReadiness = {
  netPayTotal: number;
  month: string;
  canPreview: boolean;
  canLock: boolean;
  employeeCount: number;
  snapshotCount: number;
  reviewedCount: number;
  lockedCount: number;
  attendanceFoundCount: number;
  missingAttendanceCount: number;
  missingSalaryStructureCount: number;
  policyConfigurationIssueCount: number;
  blockingIssues: string[];
  recommendedActions: string[];
};

export type PayrollPreviewPage = {
  previewRunId: string | null;
  isCurrent: boolean;
  isGenerated: boolean;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  items: Record<string, unknown>[];
  readiness: PayrollReadiness;
};

export type PayrollRegisterCriteria = {
  sort?: string;
  descending?: boolean;
  reviewState?: string;
  issueClass?: string;
  issueCode?: string;
};

export type PayrollRegisterRow = {
  employeeId: string;
  employeeName: string;
  employeeIdentifier: string;
  payableDays: number | null;
  netPay: number | null;
  isLocked: boolean;
};

type PayrollRegisterArgs = PayrollRegisterCriteria & {
  month: string;
  academicYearId: string;
  page: number;
  pageSize: number;
  search: string;
};

export const payrollPreviewRunApi = employeeApi.injectEndpoints({
  endpoints: (builder) => ({
    payrollPreviewLookup: builder.query<
      { currentRun: PayrollPreviewStatus | null },
      { month: string; academicYearId: string }
    >({
      query: (params) => ({ url: '/payroll/run/previews/current', params }),
      providesTags: [employeeType.runPayroll],
    }),
    startPayrollPreview: builder.mutation<PayrollPreviewStatus, { month: string; academicYearId: string; refresh: boolean; commandKey?: string }>({
      query: (body) => ({ url: '/payroll/run/previews', method: 'POST', body }),
      invalidatesTags: (_result, error) => (error ? [] : [employeeType.runPayroll]),
    }),
    payrollPreviewStatus: builder.query<PayrollPreviewStatus, string>({
      query: (id) => `/payroll/run/previews/${id}`,
      providesTags: [employeeType.runPayroll],
    }),
    payrollPreviewEmployees: builder.query<PayrollPreviewPage, { id: string; page: number; pageSize: number; search: string }>({
      query: ({ id, ...params }) => ({ url: `/payroll/run/previews/${id}/employees`, params }),
      providesTags: [employeeType.runPayroll],
    }),
    payrollRegister: builder.query<PayrollPreviewPage, PayrollRegisterArgs>({
      query: (params) => ({ url: '/payroll/run/register', params }),
      providesTags: [employeeType.runPayroll],
    }),
    payrollRegisterRows: builder.query<{ registerRows?: PayrollRegisterRow[] }, PayrollRegisterArgs>({
      query: (params) => ({
        url: '/payroll/run/register',
        params: { ...params, rowsOnly: true },
        timeout: 6000,
      }),
      keepUnusedDataFor: 0,
    }),
  }),
});

export const {
  usePayrollPreviewLookupQuery,
  useStartPayrollPreviewMutation,
  usePayrollPreviewStatusQuery,
  usePayrollPreviewEmployeesQuery,
  usePayrollRegisterQuery,
  usePayrollRegisterRowsQuery,
} = payrollPreviewRunApi;

export const usePayrollRegisterQueryState = payrollPreviewRunApi.endpoints.payrollRegister.useQueryState;
