import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, beforeEach } from 'vitest';
import { hrPermissions } from 'src/constants/hr-menus';
import { extendTheme, ThemeProvider } from '@mui/material/styles';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import HRPolicyWorkspace from './HRPolicyWorkspace';

const mocks = vi.hoisted(() => ({
  ctx: {} as any,
  query: vi.fn(),
  record: vi.fn(),
  fetching: false,
  failed: false,
  canReview: false,
}));
vi.mock('./hooks/useHRPolicyWorkspace', () => ({ useHRPolicyWorkspace: () => mocks.ctx }));
vi.mock('src/redux/hr/hr-setup-review-api', () => ({
  useGetHrSetupReviewQuery: (args: any) => {
    mocks.query(args);
    return {
      isFetching: mocks.fetching,
      isError: mocks.failed,
      refetch: vi.fn(),
      currentData:
        mocks.failed || mocks.fetching
          ? undefined
          : {
              ...args,
              configurationState: 'valid',
              reviewState: 'record_not_present',
              canReview: mocks.canReview,
              fingerprint: 'f'.repeat(64),
              concurrencyStamp: `stamp-${args.academicYearId}`,
              starterInitialized: true,
              details: [`Synthetic ${args.academicYearId} ${args.section}`],
              notices: [],
            },
    };
  },
  useRecordHrSetupReviewMutation: () => [mocks.record, { isLoading: false }],
}));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/custom-breadcrumbs', () => ({ CustomBreadcrumbs: () => null }));
vi.mock('./components/CalendarsTab', () => ({
  CalendarsTab: () => <p>Policy workspace remains available</p>,
}));
vi.mock('./components/PolicyTable', () => ({ PolicyTable: () => null }));
vi.mock('./components/AssignmentsTab', () => ({ AssignmentsTab: () => null }));
vi.mock('./components/LeavePoliciesPanel', () => ({ LeavePoliciesPanel: () => null }));
vi.mock('./components/PolicyAuditDrawer', () => ({ PolicyAuditDrawer: () => null }));
vi.mock('./components/PolicyImpactDrawer', () => ({ PolicyImpactDrawer: () => null }));
vi.mock('./components/PolicyVersionDrawer', () => ({ PolicyVersionDrawer: () => null }));
vi.mock('./components/ManualHolidayDrawer', () => ({ ManualHolidayDrawer: () => null }));
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
  mocks.fetching = false;
  mocks.failed = false;
  mocks.canReview = false;
  mocks.record.mockReturnValue({ unwrap: async () => ({}) });
  mocks.ctx = {
    tab: 'calendars',
    drawer: null,
    calendarForm: { name: 'Draft' },
    academicYearId: 'year-1',
    closeDrawer: vi.fn(),
    drawerTransitionDuration: 0,
    leaveSetupState: 'ready',
    attendanceSetupState: 'ready',
    payrollSetupState: 'ready',
  };
});

it('mounts the real advisory checklist in the workspace with read-only, year-scoped sections', () => {
  setup();
  fireEvent.click(screen.getByText('School HR setup review'));
  expect(screen.getByRole('region', { name: 'School setup review sections' })).toBeVisible();
  expect(mocks.query).toHaveBeenCalledWith(
    expect.objectContaining({ academicYearId: 'year-1', section: 'calendar' })
  );
  expect(mocks.query).toHaveBeenCalledWith(
    expect.objectContaining({ academicYearId: 'year-1', section: 'sample' })
  );
  expect(screen.getByText(/This checklist is advisory/)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /^Record / })).not.toBeInTheDocument();
  expect(mocks.record).not.toHaveBeenCalled();
});

it('makes no review API calls without an academic year or the owning read grants', () => {
  mocks.ctx.academicYearId = '';
  const result = setup(navigation);
  expect(screen.queryByText('School HR setup review')).not.toBeInTheDocument();
  expect(mocks.query).not.toHaveBeenCalled();
  mocks.ctx.academicYearId = 'year-1';
  result.rerenderWorkspace();
  expect(screen.queryByText('School HR setup review')).not.toBeInTheDocument();
  expect(mocks.query).not.toHaveBeenCalled();
});

it('keeps the policy workspace usable when advisory reads load or fail', () => {
  mocks.fetching = true;
  const result = setup();
  fireEvent.click(screen.getByText('School HR setup review'));
  expect(screen.getByText('Policy workspace remains available')).toBeVisible();
  expect(screen.queryByText('Defaults available')).not.toBeInTheDocument();
  mocks.fetching = false;
  mocks.failed = true;
  result.rerenderWorkspace();
  expect(screen.getByText('Policy workspace remains available')).toBeVisible();
  expect(screen.queryByRole('button', { name: /^Record / })).not.toBeInTheDocument();
  expect(screen.queryByText('Reviewed for this school')).not.toBeInTheDocument();
  expect(mocks.record).not.toHaveBeenCalled();
});

it('records only explicit current-year evidence and hides review controls while a policy editor is open', async () => {
  mocks.canReview = true;
  const result = setup();
  fireEvent.click(screen.getByText('School HR setup review'));
  fireEvent.click(screen.getByRole('button', { name: 'Record calendar and workweek review' }));
  await waitFor(() =>
    expect(mocks.record).toHaveBeenCalledWith(
      expect.objectContaining({
        academicYearId: 'year-1',
        section: 'calendar',
        fingerprint: 'f'.repeat(64),
        concurrencyStamp: 'stamp-year-1',
      })
    )
  );
  mocks.ctx.academicYearId = 'year-2';
  result.rerenderWorkspace();
  expect(mocks.query).toHaveBeenCalledWith(
    expect.objectContaining({ academicYearId: 'year-2', section: 'calendar' })
  );
  expect(screen.queryByText('Synthetic year-1 calendar')).not.toBeInTheDocument();
  mocks.ctx.drawer = { kind: 'calendar', mode: 'create' };
  result.rerenderWorkspace();
  expect(screen.queryByText('School HR setup review')).not.toBeInTheDocument();
  expect(screen.getByText('Unsaved policy editor')).toBeVisible();
  expect(mocks.record).toHaveBeenCalledOnce();
});
