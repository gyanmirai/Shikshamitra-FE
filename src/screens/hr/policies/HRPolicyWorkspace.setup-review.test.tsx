import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, beforeEach } from 'vitest';
import { hrPermissions } from 'src/constants/hr-menus';
import { extendTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen, fireEvent } from '@testing-library/react';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';

import HRPolicyWorkspace from './HRPolicyWorkspace';

const mocks = vi.hoisted(() => ({
  ctx: {} as any,
  query: vi.fn(),
  push: vi.fn(),
}));
vi.mock('./hooks/useHRPolicyWorkspace', () => ({ useHRPolicyWorkspace: () => mocks.ctx }));
vi.mock('src/redux/hr/hr-setup-review-api', () => ({
  useGetHrSetupReviewQuery: mocks.query,
  useRecordHrSetupReviewMutation: () => [vi.fn(), { isLoading: false }],
}));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ links }: { links: { name: string; href?: string }[] }) => (
    <a href={links[0]?.href}>{links[0]?.name}</a>
  ),
}));
vi.mock('./components/CalendarsTab', () => ({
  CalendarsTab: () => <p>Policy workspace remains available</p>,
}));
vi.mock('./components/PolicyTable', () => ({ PolicyTable: () => null }));
vi.mock('./components/AssignmentsTab', () => ({ AssignmentsTab: () => null }));
vi.mock('./components/LeavePoliciesPanel', () => ({ LeavePoliciesPanel: () => null }));
vi.mock('./components/PolicyAuditDrawer', () => ({ PolicyAuditDrawer: () => null }));
vi.mock('./components/PolicyImpactDrawer', () => ({ PolicyImpactDrawer: () => null }));
vi.mock('./components/PolicyVersionDrawer', () => ({ PolicyVersionDrawer: () => null }));
vi.mock('./components/ManualHolidayDialog', () => ({ ManualHolidayDialog: () => null }));
vi.mock('./components/CalendarPolicyDrawer', () => ({
  CalendarPolicyDrawer: () => <p>Unsaved policy editor</p>,
}));

const navigation = Object.values(hrPermissions.policies);
const readGrants = [
  ...navigation,
  'HR.Policies.View',
  'HR.LeaveManagement.Setting.LeavePolicy.View',
];
function setup(grants = readGrants) {
  const store = configureStore({
    reducer: {
      confirmPopup,
      auth: () => ({ permissions: grants.map((name) => ({ name, isGranted: true })) }),
    },
  });
  const ui = () => (
    <Provider store={store}>
      <ThemeProvider theme={extendTheme({ customShadows: { z1: 'none' } } as any)}>
        <HRPolicyWorkspace focus="calendars" />
      </ThemeProvider>
    </Provider>
  );
  const result = render(ui());
  return { ...result, rerenderWorkspace: () => result.rerender(ui()) };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.ctx = {
    tab: 'calendars',
    drawer: null,
    calendarForm: { name: 'Draft' },
    academicYearId: 'year-1',
    closeDrawer: vi.fn(),
    drawerTransitionDuration: 0,
    leaveSetupState: 'missing',
    attendanceSetupState: 'missing',
    payrollSetupState: 'multiple',
    canOpenLeavePolicies: true,
    canOpenAttendancePolicies: true,
    canOpenPayrollPolicies: true,
  };
});

it.each(['calendars', 'attendance', 'payroll', 'leave', 'assignments'])(
  'keeps school review and its queries off the %s table',
  (tab) => {
    mocks.ctx.tab = tab;
    setup();
    expect(
      screen.queryByRole('button', { name: 'Review School Policies' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Check Policies for One Staff Member' })
    ).not.toBeInTheDocument();
    expect(mocks.query).not.toHaveBeenCalled();
    expect(screen.getByRole('link', { name: 'Policies & Rules' })).toHaveAttribute(
      'href',
      '/hr/policies'
    );
  }
);

it.each([
  ['calendars', []],
  ['attendance', ['Default attendance policy missing']],
  ['payroll', ['Multiple default payroll policies']],
  ['leave', ['Default leave policy missing']],
] as const)('shows only the owning default warning on %s', (tab, warnings) => {
  mocks.ctx.tab = tab;
  setup();
  warnings.forEach((warning) => {
    expect(screen.getByText(warning)).toBeVisible();
  });
  expect(screen.queryAllByRole('alert')).toHaveLength(warnings.length);
  expect(screen.queryByRole('button', { name: /^Open .* Policies$/ })).not.toBeInTheDocument();
});

it('offers all relevant recovery links on assignments, subject to destination access', () => {
  mocks.ctx.tab = 'assignments';
  mocks.ctx.canOpenLeavePolicies = false;
  setup();
  expect(screen.getAllByRole('alert')).toHaveLength(3);
  expect(screen.queryByRole('button', { name: 'Open Leave Policies' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Open Attendance Policies' }));
  fireEvent.click(screen.getByRole('button', { name: 'Open Payroll Policies' }));
  expect(mocks.push.mock.calls).toEqual([['/hr/attendance'], ['/hr/payrollPolicies']]);
});

it('leaves the calendar table and editor available without cross-policy warnings', () => {
  const result = setup();
  expect(screen.getByText('Policy workspace remains available')).toBeVisible();
  mocks.ctx.drawer = { kind: 'calendar', mode: 'create' };
  result.rerenderWorkspace();
  expect(screen.getByText('Unsaved policy editor')).toBeVisible();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
