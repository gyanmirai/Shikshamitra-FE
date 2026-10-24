import type { EmployeeDashboardData } from 'src/redux/hr/employeeApi';

import { vi, it, expect } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import { screen, within } from '@testing-library/react';
import { createTheme } from 'src/theme/create-theme';
import { renderWithProviders } from 'src/test/test-utils';
import { defaultSettings } from 'src/components/settings/config-settings';

import EmployeeAttendanceTrendChart from './EmployeeAttendanceTrendChart';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/chart', () => ({
  Chart: () => <div aria-label="Attendance chart" />,
  useChart: (options: unknown) => options,
}));

it('preserves monthly row headers, values and chronological sorting across year boundaries', async () => {
  const data: EmployeeDashboardData = {
    employeeId: 'synthetic-staff',
    date: '2026-10-01',
    academicYearName: '2026-27',
    todayStatus: 'NotMarked',
    attendancePercentage: null,
    recordedAttendanceDays: 0,
    leaveBalanceDays: 0,
    hasUnlimitedLeave: false,
    isLeaveBalanceAvailable: true,
    pendingLeaveRequests: 0,
    attendanceDays: [],
    holidays: [],
    attendanceTrend: [
      { month: '2026-12', present: 20, halfDay: 1, absent: 2, halfDayLeave: 0, fullDayLeave: 3 },
      { month: '2027-01', present: 18, halfDay: 2, absent: 1, halfDayLeave: 1, fullDayLeave: 4 },
      { month: '2027-02', present: 19, halfDay: 1, absent: 0, halfDayLeave: 2, fullDayLeave: 1 },
    ],
  };
  renderWithProviders(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <EmployeeAttendanceTrendChart data={data} />
    </ThemeProvider>
  );
  await userEvent.click(screen.getByText('View monthly attendance data'));
  const table = screen.getByRole('table', { name: 'Monthly attendance data table' });
  expect(within(table).getAllByRole('rowheader')).toHaveLength(3);
  const december = within(table).getByRole('rowheader', { name: "Dec '26" });
  expect(december).toHaveAttribute('scope', 'row');
  expect(
    within(december.closest('tr')!)
      .getAllByRole('cell')
      .map((cell) => cell.textContent)
  ).toEqual(['20', '1', '2', '0', '3']);
  expect(within(table).getByRole('rowheader', { name: "Jan '27" })).toHaveAttribute('scope', 'row');
  const sortMonth = within(table).getByRole('button', { name: 'Sort by Month' });
  await userEvent.click(sortMonth);
  expect(
    within(table)
      .getAllByRole('rowheader')
      .map((header) => header.textContent)
  ).toEqual(["Dec '26", "Jan '27", "Feb '27"]);
  await userEvent.click(sortMonth);
  expect(
    within(table)
      .getAllByRole('rowheader')
      .map((header) => header.textContent)
  ).toEqual(["Feb '27", "Jan '27", "Dec '26"]);
});
