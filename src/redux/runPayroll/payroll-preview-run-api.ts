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
  previewRunId: string;
  isCurrent: boolean;
  isGenerated: boolean;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  items: Record<string, unknown>[];
  readiness: PayrollReadiness;
};

export const payrollPreviewRunApi = employeeApi.injectEndpoints({
  endpoints: (builder) => ({
    startPayrollPreview: builder.mutation<PayrollPreviewStatus, { month: string; academicYearId: string; refresh: boolean }>({
      query: (body) => ({ url: '/payroll/run/previews', method: 'POST', body }),
    }),
    payrollPreviewStatus: builder.query<PayrollPreviewStatus, string>({
      query: (id) => `/payroll/run/previews/${id}`,
      providesTags: [employeeType.runPayroll],
    }),
    payrollPreviewEmployees: builder.query<PayrollPreviewPage, { id: string; page: number; pageSize: number; search: string }>({
      query: ({ id, ...params }) => ({ url: `/payroll/run/previews/${id}/employees`, params }),
      providesTags: [employeeType.runPayroll],
    }),
  }),
});

export const { useStartPayrollPreviewMutation, usePayrollPreviewStatusQuery, usePayrollPreviewEmployeesQuery } = payrollPreviewRunApi;
