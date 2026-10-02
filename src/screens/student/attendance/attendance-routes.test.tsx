import type { AttendanceSettings } from 'src/redux/student/attendance-management/types';

import { render, screen } from '@testing-library/react';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import ReportsPage from 'src/app/(auth-route)/student/attendance/reports/page';
import SettingsPage from 'src/app/(auth-route)/student/attendance/setting/page';
import LeavePage from 'src/app/(auth-route)/student/attendance/leave-absent/page';
import DailyPage from 'src/app/(auth-route)/student/attendance/take-attendance/page';

const state = vi.hoisted(() => ({
  params: new URLSearchParams(),
  settings: undefined as AttendanceSettings | undefined,
  query: vi.fn(),
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
vi.mock('src/redux/student/attendance-management/api', () => ({
  useGetAttendanceSettingsQuery: (args: unknown) => {
    state.query(args);
    return { currentData: state.settings, isError: false };
  },
  useSaveAttendanceDraftMutation: () => [vi.fn(), { isLoading: false }],
  usePreviewAttendancePolicyMutation: () => [vi.fn(), { isLoading: false }],
  usePublishAttendancePolicyMutation: () => [vi.fn(), { isLoading: false }],
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
vi.mock('src/screens/student/attendance/setting/individual-schedules', () => ({
  default: () => null,
}));
vi.mock('src/screens/student/attendance/setting/attendance-type', () => ({
  default: ({ embedded }: { embedded?: boolean }) => (
    <h2>{embedded ? 'Embedded leave types' : 'Legacy leave types'}</h2>
  ),
}));
vi.mock('src/screens/student/attendance/take-attendance', () => ({
  default: () => <section aria-label="Daily Attendance workspace" />,
}));
vi.mock('src/screens/student/attendance/leave-absent', () => ({
  default: () => <section aria-label="Leave and Corrections workspace" />,
}));
vi.mock('src/screens/student/attendance/reports', () => ({
  default: () => <section aria-label="Attendance register workspace" />,
}));

describe('Attendance route entry points', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.params = new URLSearchParams();
    state.settings = undefined;
  });

  it('opens the policy workspace with its task navigation while settings load', () => {
    render(<SettingsPage />);
    expect(screen.getByRole('heading', { name: 'Attendance Settings' })).toBeVisible();
    expect(screen.getByRole('navigation', { name: 'Attendance settings tasks' })).toBeVisible();
    expect(screen.getByRole('link', { name: /School Day & Applicability/ })).toBeVisible();
    expect(screen.getByRole('link', { name: /Daily Marking/ })).toBeVisible();
    expect(screen.getByRole('link', { name: /Leave & Corrections/ })).toBeVisible();
    expect(screen.getByRole('link', { name: /Monitoring & Alerts/ })).toBeVisible();
    expect(state.query).toHaveBeenCalledWith({});
    expect(screen.queryByRole('heading', { name: 'Legacy leave types' })).not.toBeInTheDocument();
  });

  it('keeps leave types embedded within the Leave and Corrections settings task', () => {
    state.params = new URLSearchParams('task=leave&view=types');
    const options = {
      allowLate: true,
      allowHalfDay: true,
      lateCredit: 1,
      halfDayCredit: 0.5,
      approvedLeaveTreatment: 'Exclude' as const,
      halfDayLeaveTreatment: 'HalfDenominator' as const,
      sameDayCorrectionRequiresReason: true,
      priorDayCorrectionRequiresApproval: true,
      lockedCorrectionRequiresApproval: true,
      lowAttendanceThreshold: 75,
      markingCutoff: '10:00',
      schoolTimeZone: 'Asia/Kolkata',
    };
    const policy = { schemaVersion: 1, defaults: options, exceptions: [] };
    state.settings = {
      draftPolicy: policy,
      effectivePolicy: policy,
      publishedVersionNumber: 1,
      isStarter: false,
      versions: [],
    };
    render(<SettingsPage />);
    expect(screen.getByRole('heading', { name: 'Attendance Settings' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Embedded leave types' })).toBeVisible();
    expect(screen.getByText('Approved leave counting')).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Legacy leave types' })).not.toBeInTheDocument();
  });

  it.each([
    { Page: DailyPage, workspace: 'Daily Attendance workspace' },
    { Page: LeavePage, workspace: 'Leave and Corrections workspace' },
    { Page: ReportsPage, workspace: 'Attendance register workspace' },
  ])('opens the owning workspace for $workspace', ({ Page, workspace }) => {
    render(<Page />);
    expect(screen.getByRole('region', { name: workspace })).toBeVisible();
  });
});
