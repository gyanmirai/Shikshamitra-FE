import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, beforeEach } from 'vitest';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import { render, screen, fireEvent } from '@testing-library/react';
import PoliciesPage from 'src/app/(auth-route)/hr/(Policies)/policies/page';
import PoliciesGroupLayout from 'src/app/(auth-route)/hr/(Policies)/layout';
import { hrLeavePolicyPermissions } from 'src/constants/hr-policy-permissions';

const query = vi.hoisted(() => vi.fn());
vi.mock('src/redux/hr/hr-setup-review-api', () => ({
  useGetHrSetupReviewQuery: query,
  useRecordHrSetupReviewMutation: () => [vi.fn(), { isLoading: false }],
}));
vi.mock('src/sections/error', () => ({ View403: () => <p>Access denied</p> }));
vi.mock('src/components/loading-screen', () => ({ SplashScreen: () => null }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const navigation = hrPermissions.policies;
const allGrants = [
  navigation.root,
  navigation.calendars,
  navigation.attendance,
  navigation.payroll,
  navigation.assignments,
  hrPermissions.policyActions.view,
  hrLeavePolicyPermissions.view,
];

function mount(grants = allGrants, academicYearId: string | null = 'school-year') {
  const store = configureStore({
    reducer: {
      auth: () => ({
        loading: false,
        permissionsInitialized: true,
        permissions: grants.map((name) => ({ name, isGranted: true })),
      }),
      globalState: () => ({ currentYear: academicYearId ? { id: academicYearId } : undefined }),
    },
  });
  return render(
    <Provider store={store}>
      <PoliciesGroupLayout>
        <PoliciesPage />
      </PoliciesGroupLayout>
    </Provider>
  );
}

beforeEach(() => {
  query.mockReset();
  query.mockReturnValue({ isError: true, refetch: vi.fn() });
});

it('opens through the route group with calendar-first settings and links that survive review failure', () => {
  mount();
  expect(screen.getByRole('heading', { name: 'Policies & Rules' })).toBeVisible();
  const linkDestinations = () =>
    screen.getAllByRole('link').map((link) => link.getAttribute('href'));
  expect(linkDestinations()).toEqual([
    hrPaths.policies.calendars,
    hrPaths.policies.attendance,
    hrPaths.policies.payroll,
    hrPaths.policies.leavePolicies,
    hrPaths.policies.assignments,
  ]);
  expect(query).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Review School Policies' }));
  expect(screen.getByText(/Unable to load work calendars review/)).toBeVisible();
  expect(linkDestinations()).toHaveLength(5);
  expect(screen.getByRole('heading', { name: 'Staff and Group Exceptions' })).toBeVisible();
});

it('allows a leave-only reader to open Leave and its own review', () => {
  mount([navigation.root, hrLeavePolicyPermissions.view]);
  expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
    hrPaths.policies.leavePolicies,
  ]);
  expect(screen.getByText(/payroll calendar and workday rules/)).toBeVisible();
  expect(
    screen.queryByRole('button', { name: 'Check Policies for One Staff Member' })
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Review School Policies' }));
  expect(query).toHaveBeenCalledExactlyOnceWith(
    { academicYearId: 'school-year', section: 'leave', newSample: undefined },
    { refetchOnMountOrArgChange: true }
  );
});

it('keeps assignments independently reachable without requiring any review evidence', () => {
  mount([navigation.root, navigation.assignments, hrPermissions.policyActions.view]);
  expect(screen.getByRole('link', { name: 'Open policy assignments' })).toHaveAttribute(
    'href',
    hrPaths.policies.assignments
  );
  expect(screen.queryByRole('button', { name: 'Review School Policies' })).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Check Policies for One Staff Member' })
  ).not.toBeInTheDocument();
  expect(query).not.toHaveBeenCalled();
});

it('leaves authorized destinations available without a selected academic year', () => {
  mount(allGrants, null);
  expect(screen.getByRole('link', { name: 'Open work calendars' })).toBeVisible();
  expect(screen.getByText(/Select an academic year/)).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Review School Policies' })).not.toBeInTheDocument();
  expect(query).not.toHaveBeenCalled();
});

it('shows an access empty state for destination grants without the owning read action', () => {
  mount([navigation.root, navigation.calendars, navigation.leavePolicies, navigation.assignments]);
  expect(screen.getByText(/No policy settings are available/)).toBeVisible();
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
  expect(query).not.toHaveBeenCalled();
});

it('denies the direct overview page without the Policies and Rules group grant', () => {
  mount([navigation.calendars, hrPermissions.policyActions.view]);
  expect(screen.getByText('Access denied')).toBeVisible();
  expect(screen.queryByRole('heading', { name: 'Policies & Rules' })).not.toBeInTheDocument();
  expect(query).not.toHaveBeenCalled();
});
