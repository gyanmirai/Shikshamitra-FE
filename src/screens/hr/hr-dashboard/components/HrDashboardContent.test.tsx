import type { HRDashboardSummary } from 'src/redux/hr/hrDashboardApi';

import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, within, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { HrDashboardContent } from './HrDashboardContent';

import type { HrDashboardDisplayPermissions } from '../hr-dashboard-view-model';

const mutationMocks = vi.hoisted(() => {
  const approveUnwrap = vi.fn().mockResolvedValue({});
  const rejectUnwrap = vi.fn().mockResolvedValue({});
  return {
    approveUnwrap,
    rejectUnwrap,
    approveMutation: vi.fn(() => ({ unwrap: approveUnwrap })),
    rejectMutation: vi.fn(() => ({ unwrap: rejectUnwrap })),
  };
});

vi.mock('src/components/chart', () => ({
  Chart: () => <div data-testid="dashboard-chart" />,
  useChart: (options: unknown) => options,
}));

vi.mock('src/components/iconify', () => ({
  Iconify: () => <span aria-hidden />,
}));

vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('src/redux/hr/leaveApi', () => ({
  useApproveLeaveRequestMutation: () => [mutationMocks.approveMutation],
  useRejectLeaveRequestMutation: () => [mutationMocks.rejectMutation],
}));

const theme = createTheme(defaultSettings);

const data: HRDashboardSummary = {
  date: '2026-08-23',
  month: '2026-08',
  range: 7,
  workforce: {
    totalActiveStaff: 126,
    teachingStaff: 82,
    nonTeachingStaff: 44,
    newJoinersThisMonth: 2,
    inactiveStaff: 5,
    recentEmployees: [
      {
        id: 'employee-1',
        name: 'Asha Patel',
        employeeIdentifier: 'EMP-001',
        roleName: 'Teacher',
        department: 'Science',
        isTeaching: true,
        dateOfJoining: '2026-08-11',
      },
    ],
    newJoiners: [
      {
        id: 'employee-2',
        name: 'Ravi Shah',
        employeeIdentifier: 'EMP-002',
        roleName: 'Accountant',
        department: 'Finance',
        isTeaching: false,
        dateOfJoining: '2026-08-18',
      },
    ],
  },
  attendanceToday: {
    present: 116,
    absent: 4,
    halfDay: 2,
    missingAttendance: 3,
    lateOrException: 1,
    attendanceRate: 92.1,
  },
  attendanceTrend: [
    { date: '2026-08-22', present: 114, absent: 6, leave: 4 },
    { date: '2026-08-23', present: 116, absent: 4, leave: 3 },
  ],
  leave: {
    pending: 1,
    approved: 12,
    rejected: 2,
    leaveTypeSummary: [{ leaveType: 'Casual Leave', count: 1 }],
    recentPendingRequests: [
      {
        id: 'leave-1',
        publicId: 101,
        employeeId: 'employee-1',
        employeeName: 'Asha Patel',
        employeeIdentifier: 'EMP-001',
        paidType: 'Paid Leave',
        leaveType: 'Casual Leave',
        startDate: '2026-08-25',
        endDate: '2026-08-26',
        totalDays: 2,
        status: 'Pending',
        submittedAt: '2026-08-22T10:00:00+05:30',
      },
    ],
  },
  payroll: {
    month: 'August 2026',
    canPreview: true,
    canLock: false,
    employeeCount: 126,
    reviewedCount: 88,
    lockedCount: 10,
    pendingCount: 28,
    missingAttendanceCount: 3,
    missingSalaryStructureCount: 2,
    policyConfigurationIssueCount: 1,
    blockingIssues: ['Three staff records have missing attendance.'],
    recommendedActions: ['Review pending staff payroll records.'],
  },
  celebrations: {
    today: [
      {
        employeeId: 'employee-1',
        employeeName: 'Asha Patel',
        employeeIdentifier: 'EMP-001',
        type: 'Birthday',
        date: '2026-08-23',
      },
    ],
    upcoming: [],
  },
  insights: [
    {
      severity: 'warning',
      title: 'Leave requests need review',
      summary: 'One recent leave request is waiting for a decision.',
      source: 'leave.pending',
      actionLabel: 'Review Leave',
      actionHref: '/hr/leave-approvals',
    },
  ],
};

const fullPermissions: HrDashboardDisplayPermissions = {
  canViewEmployees: true,
  canViewAttendance: true,
  canApproveLeave: true,
  canRunPayroll: true,
  canViewSalaryStructures: true,
  canViewReports: true,
};

const renderWithTheme = (ui: React.ReactNode) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('HrDashboardContent', () => {
  it('renders the standard hierarchy, linked metrics, and real destinations', () => {
    renderWithTheme(<HrDashboardContent data={data} permissions={fullPermissions} />);

    expect(screen.getByRole('heading', { level: 2, name: "Today's Summary" })).toBeVisible();
    expect(screen.getByRole('heading', { level: 2, name: 'Action Center' })).toBeVisible();
    expect(screen.getByRole('heading', { level: 2, name: 'Workforce Overview' })).toBeVisible();
    expect(screen.getByRole('heading', { level: 2, name: 'Attendance Overview' })).toBeVisible();
    expect(screen.getByRole('heading', { level: 2, name: 'Payroll Readiness' })).toBeVisible();
    expect(screen.getByRole('heading', { level: 2, name: 'People Updates' })).toBeVisible();

    expect(screen.getByRole('link', { name: 'Active Staff: 126' })).toHaveAttribute(
      'href',
      '/hr/employee'
    );
    expect(screen.getByRole('link', { name: 'Attendance Rate: 92.1%' })).toHaveAttribute(
      'href',
      '/hr/attendance-dashboard'
    );
    expect(screen.getByRole('link', { name: 'Pending Leave: 1' })).toHaveAttribute(
      'href',
      '/hr/leave-approvals'
    );
    expect(screen.getByRole('link', { name: 'Payroll Status: Needs review' })).toHaveAttribute(
      'href',
      '/hr/payroll/run-payroll'
    );
    expect(screen.getAllByRole('img').some((element) => element.getAttribute('aria-label'))).toBe(
      true
    );
    expect(screen.getByText("7-day trend and today's attendance status")).toBeVisible();
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
  });

  it('hides unauthorized links and mutations while keeping read-only metrics visible', () => {
    const restrictedPermissions = Object.fromEntries(
      Object.keys(fullPermissions).map((key) => [key, false])
    ) as HrDashboardDisplayPermissions;
    renderWithTheme(<HrDashboardContent data={data} permissions={restrictedPermissions} />);

    expect(screen.getAllByText('126').length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: 'Active Staff: 126' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /approve leave for/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /reject leave for/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Run Payroll' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Directory' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Review Leave' })).not.toBeInTheDocument();
  });

  it('requires rejection remarks before submitting a rejection', async () => {
    const user = userEvent.setup();
    renderWithTheme(<HrDashboardContent data={data} permissions={fullPermissions} />);

    await user.click(screen.getByRole('button', { name: 'Reject leave for Asha Patel' }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Reject' }));
    expect(screen.getByText('Remarks are required to reject the leave request.')).toBeVisible();

    await user.type(
      within(dialog).getByRole('textbox', { name: 'Remarks *' }),
      'Insufficient balance'
    );
    await user.click(within(dialog).getByRole('button', { name: 'Reject' }));
    await waitFor(() =>
      expect(mutationMocks.rejectMutation).toHaveBeenCalledWith({
        id: 'leave-1',
        body: { remarks: 'Insufficient balance' },
      })
    );
  });

  it('submits leave approval after confirmation', async () => {
    const user = userEvent.setup();
    renderWithTheme(<HrDashboardContent data={data} permissions={fullPermissions} />);

    await user.click(screen.getByRole('button', { name: 'Approve leave for Asha Patel' }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Approve' }));
    await waitFor(() =>
      expect(mutationMocks.approveMutation).toHaveBeenCalledWith({
        id: 'leave-1',
        body: { remarks: '' },
      })
    );
  });
});
