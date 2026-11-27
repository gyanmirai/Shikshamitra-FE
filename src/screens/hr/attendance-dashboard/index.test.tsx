import type { PropsWithChildren } from 'react';
import type { AttendanceDashboard } from 'src/redux/hr/hrOperationalDashboardApi';

import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { render, screen, within } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { dashboardPermissions } from 'src/screens/hr/hr-dashboard/operational-dashboard-state';

import AttendanceDashboardScreen from './index';

const mocks = vi.hoisted(() => ({
  search: new URLSearchParams(),
  select: vi.fn(),
  query: vi.fn(),
  refetch: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => mocks.search,
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('react-redux', () => ({ useSelector: mocks.select }));
vi.mock('src/hooks/use-hr-access-key', () => ({ useHRAccessKey: () => 'test-access-key' }));
vi.mock('src/redux/hr/hrOperationalDashboardApi', () => ({
  useGetHRAttendanceDashboardQuery: mocks.query,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));
vi.mock('src/components/chart', () => ({
  Chart: () => <div data-testid="attendance-chart" />,
  useChart: (options: unknown) => options,
}));

const date = '2026-05-23';
const summary = {
  date,
  staffCount: 13,
  present: 7,
  absent: 1,
  onLeave: 1,
  halfDay: 1,
  notMarked: 1,
  notScheduled: 1,
  needsSetup: 1,
  needsReview: 1,
};
const fixture: AttendanceDashboard = {
  asOfDate: '2026-05-24',
  generatedAt: '2026-05-24T09:00:00Z',
  scopeLabel: 'Staff in your assigned scope',
  summary,
  trend: [{ ...summary, date: '2026-05-17' }, summary],
  unavailableDates: [],
  review: [
    {
      employeeId: '31036e8c-68c2-41dc-8883-9fe6b902a182',
      name: 'Example Staff',
      status: 'Present',
      flags: [{ code: 'IncompletePunch', message: 'Attendance has an incomplete punch.' }],
    },
  ],
};

const theme = createTheme(defaultSettings);
const view = () =>
  render(<AttendanceDashboardScreen />, {
    wrapper: ({ children }: PropsWithChildren) => (
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>{children}</LocalizationProvider>
      </ThemeProvider>
    ),
  });

function grant(...names: string[]) {
  const state = {
    auth: { permissions: names.map((name) => ({ name, isGranted: true })) },
    globalState: { currentYear: { startDate: '2026-04-01', endDate: '2027-03-31' } },
  };
  mocks.select.mockImplementation((selector) => selector(state));
}

describe('Attendance dashboard', () => {
  beforeEach(() => {
    mocks.search = new URLSearchParams({ date });
    mocks.query.mockReset().mockReturnValue({ currentData: fixture, refetch: mocks.refetch });
    grant(dashboardPermissions.attendance);
  });

  it('renders scoped counts and hides named details and actions from dashboard-only users', () => {
    view();
    expect(mocks.query).toHaveBeenCalledWith(
      { date, accessKey: 'test-access-key' },
      expect.objectContaining({ skip: false })
    );
    expect(screen.getByText('Staff in your assigned scope')).toBeVisible();
    expect(screen.getByText('13 eligible staff')).toBeVisible();
    expect(screen.getByText('1 of 13 staff have review flags.')).toBeVisible();
    expect(screen.queryByText('Example Staff')).toBeNull();
    expect(screen.queryByRole('link', { name: 'Mark attendance' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Open register' })).toBeNull();
  });

  it('renders permitted review and marking actions with the selected date', () => {
    grant(
      dashboardPermissions.attendance,
      dashboardPermissions.staff,
      dashboardPermissions.markAttendanceView,
      dashboardPermissions.markAttendance
    );
    view();
    expect(screen.getByRole('link', { name: 'Mark attendance' })).toHaveAttribute(
      'href',
      `/hr/manual-attendance?date=${date}`
    );
    const review = screen.getByRole('region', { name: 'Needs Review' });
    expect(within(review).getByRole('link', { name: 'Open register' })).toHaveAttribute(
      'href',
      `/hr/attendance-tracking?startDate=${date}&endDate=${date}`
    );
    expect(
      within(review).getByRole('link', { name: 'View attendance for Example Staff' })
    ).toHaveAttribute(
      'href',
      `/hr/attendance-tracking?employeeId=${fixture.review![0].employeeId}&startDate=${date}&endDate=${date}`
    );
    expect(within(review).getByText('Attendance has an incomplete punch.')).toBeVisible();
  });

  it('honors a server-side tracking removal and requires both marking grants', () => {
    grant(
      dashboardPermissions.attendance,
      dashboardPermissions.staff,
      dashboardPermissions.markAttendance
    );
    mocks.query.mockReturnValue({ currentData: { ...fixture, review: undefined } });
    view();
    expect(screen.queryByRole('link', { name: 'Open register' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Mark attendance' })).toBeNull();
  });

  it('suppresses previous data during a date transition and after access is denied', () => {
    grant(dashboardPermissions.attendance, dashboardPermissions.staff);
    mocks.query.mockReturnValue({ data: fixture, isFetching: true });
    const { rerender } = view();
    expect(screen.getByRole('heading', { name: 'Attendance Dashboard' })).toBeVisible();
    expect(screen.queryByText('Example Staff')).toBeNull();
    expect(screen.queryByText('13 eligible staff')).toBeNull();

    mocks.query.mockReturnValue({ currentData: fixture, error: { status: 403 }, isError: true });
    rerender(<AttendanceDashboardScreen />);
    expect(screen.getByRole('alert')).toHaveTextContent('review your permissions and staff scope');
    expect(screen.queryByText('Example Staff')).toBeNull();
    expect(screen.queryByText('13 eligible staff')).toBeNull();
  });

  it('distinguishes unavailable academic-year scope from a day with no scoped staff', () => {
    mocks.query.mockReturnValue({ currentData: { ...fixture, unavailableDates: [date] } });
    view();
    expect(screen.getByText(/Staff scope could not be resolved/)).toBeVisible();
    expect(screen.queryByText('13 eligible staff')).toBeNull();
    expect(screen.queryByText('No eligible staff in your scope for this date.')).toBeNull();
  });
});
