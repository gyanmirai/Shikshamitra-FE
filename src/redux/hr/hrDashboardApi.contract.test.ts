import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import {
  parseHRDashboardPayload,
  sanitizeHRDashboardSummary,
  buildHRDashboardDefaultParams,
  buildHRDashboardSummaryParams,
} from './hrDashboardApi';

describe('hrDashboardApi contracts', () => {
  it('builds summary query params without empty values', () => {
    expect(
      buildHRDashboardSummaryParams({
        date: '2026-05-23',
        month: '2026-05',
        range: 7,
      })
    ).toEqual({
      date: '2026-05-23',
      month: '2026-05',
      range: 7,
    });
  });

  it('omits optional dashboard params when they are not supplied', () => {
    expect(buildHRDashboardSummaryParams()).toEqual({});
  });

  it('builds explicit browser-local default dashboard params', () => {
    expect(buildHRDashboardDefaultParams(dayjs('2026-05-23T10:15:00'))).toEqual({
      date: '2026-05-23',
      month: '2026-05',
      range: 7,
    });
  });

  it('treats an empty snapshot payload as unavailable', () => {
    expect(
      parseHRDashboardPayload({
        dashboardKey: 'Main',
        scopeKey: 'hr-wide',
        status: 'Empty',
        payloadJson: '{}',
        payloadVersion: 1,
        isStale: true,
      })
    ).toBeUndefined();
  });

  it('parses a ready snapshot payload without requiring live summary params', () => {
    expect(
      parseHRDashboardPayload<{ workforce: { totalActiveStaff: number } }>({
        dashboardKey: 'Main',
        scopeKey: 'hr-wide',
        status: 'Ready',
        payloadJson: '{"workforce":{"totalActiveStaff":42}}',
        payloadVersion: 1,
        isStale: false,
        lastSuccessfulRefreshAt: '2026-05-23T06:00:00Z',
        nextScheduledRefreshAt: '2026-05-24T06:00:00Z',
      })
    ).toEqual({ workforce: { totalActiveStaff: 42 } });
  });

  it('removes raw backend exception text from stale dashboard snapshots', () => {
    const sanitized = sanitizeHRDashboardSummary({
      date: '2026-05-23',
      month: '2026-05',
      range: 7,
      workforce: {
        totalActiveStaff: 0,
        teachingStaff: 0,
        nonTeachingStaff: 0,
        newJoinersThisMonth: 0,
        inactiveStaff: 0,
        recentEmployees: [],
      },
      attendanceToday: {
        present: 0,
        absent: 0,
        halfDay: 0,
        missingAttendance: 0,
        lateOrException: 0,
        attendanceRate: 0,
      },
      attendanceTrend: [],
      leave: {
        pending: 0,
        approved: 0,
        rejected: 0,
        leaveTypeSummary: [],
        recentPendingRequests: [],
      },
      payroll: {
        month: '2026-05',
        canPreview: false,
        canLock: false,
        employeeCount: 0,
        reviewedCount: 0,
        lockedCount: 0,
        pendingCount: 0,
        missingAttendanceCount: 0,
        missingSalaryStructureCount: 0,
        policyConfigurationIssueCount: 0,
        blockingIssues: ['Exception of type Volo.Abp.BusinessException was thrown.'],
        recommendedActions: [],
      },
      celebrations: {
        today: [],
        upcoming: [],
      },
      insights: [
        {
          severity: 'critical',
          title: 'Payroll cannot be locked',
          summary: "Exception of type 'Volo.Abp.BusinessException' was thrown.",
          source: 'payroll.readiness',
          actionLabel: 'Open payroll',
          actionHref: '/hr/payroll/run-payroll',
        },
      ],
    });

    expect(sanitized?.payroll.blockingIssues).toEqual([
      'Payroll readiness needs attention. Open payroll to review the current cycle.',
    ]);
    expect(sanitized?.insights[0]).toMatchObject({
      title: 'Payroll needs review',
      summary: 'Payroll readiness needs attention before this month can be locked.',
    });
  });
});
