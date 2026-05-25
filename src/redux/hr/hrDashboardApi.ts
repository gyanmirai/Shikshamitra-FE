import dayjs, { type Dayjs } from 'dayjs';
import { employeeType } from 'src/redux/tagTypes';

import { employeeApi } from './employeeApi';

export type HRDashboardSummary = {
  date: string;
  month: string;
  range: number;
  workforce: {
    totalActiveStaff: number;
    teachingStaff: number;
    nonTeachingStaff: number;
    newJoinersThisMonth: number;
    inactiveStaff: number;
    recentEmployees: HRDashboardEmployeeSnapshot[];
  };
  attendanceToday: {
    present: number;
    absent: number;
    halfDay: number;
    missingAttendance: number;
    lateOrException: number;
    attendanceRate: number;
  };
  attendanceTrend: Array<{
    date: string;
    present: number;
    absent: number;
    leave: number;
  }>;
  leave: {
    pending: number;
    approved: number;
    rejected: number;
    leaveTypeSummary: Array<{ leaveType: string; count: number }>;
    recentPendingRequests: HRDashboardLeaveRequest[];
  };
  payroll: {
    month: string;
    canPreview: boolean;
    canLock: boolean;
    employeeCount: number;
    reviewedCount: number;
    lockedCount: number;
    pendingCount: number;
    missingAttendanceCount: number;
    missingSalaryStructureCount: number;
    policyConfigurationIssueCount: number;
    estimatedGrossAmount?: number | null;
    estimatedNetAmount?: number | null;
    blockingIssues: string[];
    recommendedActions: string[];
  };
  celebrations: {
    today: HRDashboardCelebration[];
    upcoming: HRDashboardCelebration[];
  };
  insights: HRDashboardInsight[];
};

export type HRDashboardEmployeeSnapshot = {
  id: string;
  name: string;
  employeeIdentifier: string;
  roleName?: string | null;
  department?: string | null;
  isTeaching: boolean;
};

export type HRDashboardLeaveRequest = {
  id: string;
  publicId: number;
  employeeId: string;
  employeeName: string;
  employeeIdentifier: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: string;
  submittedAt: string;
};

export type HRDashboardCelebration = {
  employeeId: string;
  employeeName: string;
  employeeIdentifier: string;
  type: string;
  date: string;
  years?: number | null;
};

export type HRDashboardInsight = {
  severity: 'info' | 'warning' | 'critical' | 'success' | string;
  title: string;
  summary: string;
  source: string;
  actionLabel: string;
  actionHref: string;
};

export const buildHRDashboardSummaryParams = (
  params: { date?: string; month?: string; range?: number } | void
) => ({
  ...(params?.date ? { date: params.date } : {}),
  ...(params?.month ? { month: params.month } : {}),
  ...(params?.range ? { range: params.range } : {}),
});

export const buildHRDashboardDefaultParams = (now: Dayjs = dayjs()) => ({
  date: now.format('YYYY-MM-DD'),
  month: now.format('YYYY-MM'),
  range: 7,
});

export const hrDashboardApi = employeeApi.injectEndpoints({
  endpoints: (builder) => ({
    getHRDashboardSummary: builder.query<
      HRDashboardSummary,
      { date?: string; month?: string; range?: number } | void
    >({
      query: (params) => ({
        url: '/hr/dashboard/summary',
        method: 'GET',
        params: buildHRDashboardSummaryParams(params),
      }),
      providesTags: [
        employeeType.hrDashboard,
        employeeType.employee,
        employeeType.attendance,
        employeeType.runPayroll,
      ],
      keepUnusedDataFor: 60,
    }),
  }),
});

export const { useGetHRDashboardSummaryQuery } = hrDashboardApi;
