import type { EmployeeDashboardData } from 'src/redux/hr/employeeApi';

import { vi, it, expect, describe, beforeEach } from 'vitest';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen, fireEvent } from '@testing-library/react';

import EmployeeProfileDashboard from './employee-dashboard';

const state = vi.hoisted(() => ({
  employeeQuery: vi.fn(),
  dashboardQuery: vi.fn(),
  refetch: vi.fn(),
  refetchEmployee: vi.fn(),
}));

vi.mock('src/redux/hr/employeeApi', () => ({
  useGetCurrentEmployeeQuery: state.employeeQuery,
  useGetEmployeeDashboardQuery: state.dashboardQuery,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('./profileDashboardComponent/ProfileDashboardAttendance', () => ({
  default: () => <div>Attendance calendar</div>,
}));
vi.mock('next/dynamic', () => ({ default: () => () => <div>Populated attendance chart</div> }));

const data: EmployeeDashboardData = {
  employeeId: 'staff-1',
  date: '2026-10-20',
  academicYearName: '2026-2027',
  todayStatus: 'NotMarked',
  attendancePercentage: null,
  recordedAttendanceDays: 0,
  leaveBalanceDays: 20,
  hasUnlimitedLeave: true,
  isLeaveBalanceAvailable: true,
  pendingLeaveRequests: 0,
  attendanceDays: [],
  holidays: [],
  attendanceTrend: [
    { month: '2026-10', present: 0, halfDay: 0, absent: 0, halfDayLeave: 0, fullDayLeave: 0 },
  ],
};

const renderDashboard = (id = 'staff-1') =>
  render(
    <ThemeProvider theme={createTheme({ cssVariables: true })}>
      <EmployeeProfileDashboard editData={{ id }} />
    </ThemeProvider>
  );

beforeEach(() => {
  vi.clearAllMocks();
  state.employeeQuery.mockReturnValue({
    currentData: undefined,
    isFetching: false,
    isError: false,
    refetch: state.refetchEmployee,
  });
  state.dashboardQuery.mockReturnValue({
    currentData: data,
    isFetching: false,
    isError: false,
    refetch: state.refetch,
  });
});

describe('staff dashboard data and request states', () => {
  it('uses four honest metrics and explains mixed unlimited leave without an empty chart', () => {
    renderDashboard();
    expect(screen.getByTestId('staff-dashboard-metrics').children).toHaveLength(4);
    expect(screen.getByText('Not available')).toBeVisible();
    expect(screen.getByText('20')).toBeVisible();
    expect(screen.queryByText('20+')).not.toBeInTheDocument();
    expect(screen.getByText('Days available, plus unlimited leave')).toBeVisible();
    expect(screen.getByText('No attendance records yet.')).toBeVisible();
    expect(screen.queryByText('Populated attendance chart')).not.toBeInTheDocument();
    expect(state.employeeQuery).toHaveBeenCalledWith(undefined, { skip: true });
  });

  it('keeps a recorded zero percentage distinct from unavailable attendance', () => {
    state.dashboardQuery.mockReturnValue({
      currentData: { ...data, attendancePercentage: 0 },
      isFetching: false,
    });
    renderDashboard();
    expect(screen.getByText('0%')).toBeVisible();
    expect(screen.queryByText('Not available')).not.toBeInTheDocument();
  });

  it('renders the chart for leave-only records even with zero recorded attendance days', () => {
    state.dashboardQuery.mockReturnValue({
      currentData: { ...data, attendanceTrend: [{ ...data.attendanceTrend[0], fullDayLeave: 2 }] },
      isFetching: false,
    });
    renderDashboard();
    expect(screen.getByText('Populated attendance chart')).toBeVisible();
    expect(screen.queryByText('No attendance records yet.')).not.toBeInTheDocument();
  });

  it('preserves visible data and announces a background refresh', () => {
    state.dashboardQuery.mockReturnValue({ currentData: data, isFetching: true });
    renderDashboard();
    expect(screen.getByText('20')).toBeVisible();
    expect(screen.getByRole('progressbar', { name: 'Refreshing staff dashboard' })).toBeVisible();
    expect(
      screen.queryByRole('status', { name: 'Loading staff dashboard' })
    ).not.toBeInTheDocument();
  });

  it('preserves data and offers retry after a failed background refresh', () => {
    state.dashboardQuery.mockReturnValue({
      currentData: data,
      isFetching: false,
      isError: true,
      refetch: state.refetch,
    });
    renderDashboard();
    expect(screen.getByText('20')).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent('Showing the last loaded data');
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(state.refetch).toHaveBeenCalledOnce();
  });

  it('does not flash another employee cached data when the request argument changes', () => {
    const view = renderDashboard();
    state.dashboardQuery.mockReturnValue({ data, currentData: undefined, isFetching: true });
    view.rerender(
      <ThemeProvider theme={createTheme({ cssVariables: true })}>
        <EmployeeProfileDashboard editData={{ id: 'staff-2' }} />
      </ThemeProvider>
    );
    expect(screen.getByRole('status', { name: 'Loading staff dashboard' })).toBeVisible();
    expect(screen.queryByText('20')).not.toBeInTheDocument();
    expect(state.dashboardQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ employeeId: 'staff-2' }),
      { skip: false }
    );
  });

  it('offers retry when the initial dashboard request fails', () => {
    state.dashboardQuery.mockReturnValue({
      currentData: undefined,
      isFetching: false,
      isError: true,
      refetch: state.refetch,
    });
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(state.refetch).toHaveBeenCalledOnce();
  });

  it('resolves the current employee only for the self-service path', () => {
    state.employeeQuery.mockReturnValue({
      currentData: { id: 'staff-me' },
      isFetching: false,
      isError: false,
    });
    render(<EmployeeProfileDashboard />);
    expect(state.employeeQuery).toHaveBeenLastCalledWith(undefined, { skip: false });
    expect(state.dashboardQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ employeeId: 'staff-me' }),
      { skip: false }
    );
  });

  it('retries the self-service employee lookup when it fails', () => {
    state.employeeQuery.mockReturnValue({
      currentData: undefined,
      isFetching: false,
      isError: true,
      refetch: state.refetchEmployee,
    });
    state.dashboardQuery.mockReturnValue({ currentData: undefined, isFetching: false });
    render(<EmployeeProfileDashboard />);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(state.refetchEmployee).toHaveBeenCalledOnce();
  });
});
