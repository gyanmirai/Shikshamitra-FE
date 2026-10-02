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
    newJoiners?: HRDashboardEmployeeSnapshot[];
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

export type HRDashboardKey = 'Main' | 'Attendance' | 'Payroll';

export type HRDashboardPreviewStatus = 'Empty' | 'Ready' | 'Refreshing' | 'Failed' | string;

export type HRDashboardPreview = {
  dashboardKey: HRDashboardKey | string;
  scopeKey?: string;
  status: HRDashboardPreviewStatus;
  payloadJson: string;
  payloadVersion: number;
  isStale?: boolean;
  lastRefreshedAt?: string | null;
  lastSuccessfulRefreshAt?: string | null;
  nextScheduledRefreshAt?: string | null;
  refreshStartedAt?: string | null;
  refreshRequestedByUserId?: string | null;
  lastError?: string | null;
};

export type HRDashboardAttendancePreview = {
  date: string;
  totalStaff: number;
  present: number;
  absent: number;
  halfDay: number;
  missingAttendance: number;
  attendanceRate: number;
  trend: HRDashboardSummary['attendanceTrend'];
  topDefaulters: Array<{
    employeeId: string;
    employeeName: string;
    employeeIdentifier: string;
    missingAttendance: number;
    absences: number;
  }>;
  shiftSummary: Array<{
    shiftName: string;
    staffCount: number;
    present: number;
    missing: number;
  }>;
};

export type HRDashboardPayrollPreview = HRDashboardSummary['payroll'];

export const parseHRDashboardPayload = <T>(preview?: HRDashboardPreview): T | undefined => {
  if (!preview?.payloadJson || preview.payloadJson === '{}') return undefined;

  try {
    return JSON.parse(preview.payloadJson) as T;
  } catch {
    return undefined;
  }
};

const dashboardExceptionTextPatterns = [
  'exception of type',
  'volo.abp',
  'businessException',
  'stack trace',
];

export const isDashboardExceptionText = (value?: string | null) => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase();
  return dashboardExceptionTextPatterns.some((pattern) =>
    normalized.includes(pattern.toLowerCase())
  );
};

export const sanitizeHRDashboardSummary = (
  summary?: HRDashboardSummary
): HRDashboardSummary | undefined => {
  if (!summary) return undefined;

  const blockingIssues = summary.payroll.blockingIssues.filter(
    (issue) => !isDashboardExceptionText(issue)
  );
  let hasSanitizedInsights = false;
  const insights = summary.insights.map((insight) => {
    if (!isDashboardExceptionText(insight.title) && !isDashboardExceptionText(insight.summary)) {
      return insight;
    }

    hasSanitizedInsights = true;

    if (insight.source === 'payroll.readiness') {
      return {
        ...insight,
        title: 'Payroll needs review',
        summary: 'Payroll readiness needs attention before this month can be locked.',
      };
    }

    return {
      ...insight,
      summary: 'This dashboard item needs attention. Open the module to review details.',
    };
  });

  if (blockingIssues.length === summary.payroll.blockingIssues.length && !hasSanitizedInsights) {
    return summary;
  }

  return {
    ...summary,
    payroll: {
      ...summary.payroll,
      canLock: false,
      blockingIssues: blockingIssues.length
        ? blockingIssues
        : ['Payroll readiness needs attention. Open payroll to review the current cycle.'],
    },
    insights,
  };
};

export type HRDashboardEmployeeSnapshot = {
  id: string;
  name: string;
  employeeIdentifier: string;
  roleName?: string | null;
  department?: string | null;
  isTeaching: boolean;
  dateOfJoining?: string | null;
};

export type HRDashboardLeaveRequest = {
  id: string;
  publicId: number;
  employeeId: string;
  employeeName: string;
  employeeIdentifier: string;
  paidType?: string;
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
    getHRDashboardPreview: builder.query<HRDashboardPreview, HRDashboardKey>({
      query: (dashboardKey) => ({
        url: `/hr/dashboard/previews/${dashboardKey}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, dashboardKey) => [
        { type: employeeType.hrDashboard, id: dashboardKey },
      ],
      keepUnusedDataFor: 3600,
    }),
    refreshHRDashboardPreview: builder.mutation<HRDashboardPreview, HRDashboardKey>({
      query: (dashboardKey) => ({
        url: `/hr/dashboard/previews/${dashboardKey}/refresh`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, dashboardKey) => [
        { type: employeeType.hrDashboard, id: dashboardKey },
      ],
    }),
  }),
});

export const {
  useGetHRDashboardPreviewQuery,
  useRefreshHRDashboardPreviewMutation,
} = hrDashboardApi;
