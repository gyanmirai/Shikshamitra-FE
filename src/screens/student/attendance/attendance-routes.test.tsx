import { render, screen } from '@testing-library/react';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import ReportsPage from 'src/app/(auth-route)/student/attendance/reports/page';
import SettingsPage from 'src/app/(auth-route)/student/attendance/setting/page';
import LeavePage from 'src/app/(auth-route)/student/attendance/leave-absent/page';
import DailyPage from 'src/app/(auth-route)/student/attendance/take-attendance/page';

const state = vi.hoisted(() => ({
  params: new URLSearchParams(),
  push: vi.fn(),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: state.push }) }));
vi.mock('react-redux', () => ({
  useSelector: (select: (value: unknown) => unknown) => select({ auth: { permissions: [] } }),
}));
vi.mock('src/screens/student/attendance/setting/attendance-context', () => ({
  useAttendanceContext: () => ({
    params: state.params,
    currentYear: { id: 'year' },
    standards: [],
    divisions: [],
    standardId: '',
    divisionId: '',
    update: vi.fn(),
  }),
}));
vi.mock('src/hooks/use-unsaved-navigation', () => ({
  useUnsavedNavigation: () => ({
    requestNavigation: (action: () => void) => action(),
    confirmation: null,
  }),
}));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading }: { heading: string }) => <h1>{heading}</h1>,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/custom-select', () => ({
  default: ({ label }: { label: string }) => <div>{label}</div>,
}));
vi.mock('src/routes/components', () => ({ RouterLink: 'a' }));
vi.mock('src/screens/student/attendance/setting/attendance-type', () => ({
  default: () => (
    <>
      <h1>Attendance Settings</h1>
      <h2>Leave types table</h2>
    </>
  ),
}));
vi.mock('src/screens/student/attendance/take-attendance', () => ({
  default: () => <section aria-label="Daily Attendance workspace" />,
}));
vi.mock('src/screens/student/attendance/leave-absent', () => ({
  default: () => <section aria-label="Leave Requests workspace" />,
}));
vi.mock('src/screens/student/attendance/reports', () => ({
  default: () => <section aria-label="Attendance register workspace" />,
}));

describe('Attendance route entry points', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.params = new URLSearchParams();
  });

  it('opens the leave types workspace directly', () => {
    render(<SettingsPage />);
    expect(screen.getByRole('heading', { name: 'Attendance Settings' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Leave types table' })).toBeVisible();
    expect(
      screen.queryByRole('navigation', { name: 'Attendance settings tasks' })
    ).not.toBeInTheDocument();
  });

  it.each([
    { Page: DailyPage, workspace: 'Daily Attendance workspace' },
    { Page: LeavePage, workspace: 'Leave Requests workspace' },
    { Page: ReportsPage, workspace: 'Attendance register workspace' },
  ])('opens the owning workspace for $workspace', ({ Page, workspace }) => {
    render(<Page />);
    expect(screen.getByRole('region', { name: workspace })).toBeVisible();
  });
});
