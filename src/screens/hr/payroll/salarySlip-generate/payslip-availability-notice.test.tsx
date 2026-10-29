import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import PayslipAvailabilityNotice from './payslip-availability-notice';

const state = vi.hoisted(() => ({
  query: {} as any,
  grants: [] as any[],
  refetch: vi.fn(),
  reload: vi.fn(),
  read: vi.fn(),
}));
vi.mock('react-redux', () => ({
  useSelector: (selector: any) => selector({ auth: { permissions: state.grants } }),
}));
vi.mock('src/redux/runPayroll/payslip-availability-api', () => ({
  useGetPayslipAvailabilityQuery: (...args: any[]) => {
    state.read(...args);
    return state.query;
  },
}));
vi.mock('src/routes/components', () => ({
  RouterLink: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));
beforeEach(() => {
  vi.clearAllMocks();
  state.grants = [{ name: 'HR.PayrollManagement.RunPayroll.View', isGranted: true }];
  state.query = {
    currentData: {
      employeeId: 'staff-1',
      monthYear: '2026-10',
      status: 'PENDING',
      canViewPayslip: false,
    },
    isError: false,
    refetch: state.refetch,
  };
});
const view = () => (
  <PayslipAvailabilityNotice employeeId="staff-1" monthYear="2026-10" reload={state.reload} />
);

it('explains an unavailable employee month without suggesting an impossible lock', () => {
  state.query.currentData.status = 'UNAVAILABLE';
  render(view());
  expect(
    screen.getByText(/Payroll is unavailable for this staff member and pay period/)
  ).toBeVisible();
  expect(screen.queryByRole('link', { name: 'Open Run Payroll' })).not.toBeInTheDocument();
  expect(
    screen.queryByText(/Ask your HR administrator to complete payroll/)
  ).not.toBeInTheDocument();
});

it.each([
  ['NOT_PREPARED', /Payroll has not been prepared/],
  ['PREPARING', /Payroll is being prepared/],
  ['FAILED', /Payroll preparation did not finish/],
  ['PENDING', /Payroll is not locked/],
  ['REVIEWED', /Payroll is reviewed but not locked/],
])('explains %s for the selected employee and links to the matching month', (status, message) => {
  state.query.currentData.status = status;
  render(view());
  expect(screen.getByText(message)).toBeVisible();
  expect(screen.getByRole('link', { name: 'Open Run Payroll' })).toHaveAttribute(
    'href',
    '/hr/payroll/run-payroll?month=2026-10&employeeId=staff-1'
  );
  expect(state.read).toHaveBeenCalledWith(
    { employeeId: 'staff-1', monthYear: '2026-10' },
    expect.any(Object)
  );
  expect(screen.queryByRole('button', { name: /Lock|Download|Print/ })).not.toBeInTheDocument();
});

it('keeps an unauthorized user on a safe administrator next step', () => {
  state.grants = [{ name: 'HR.PayrollManagement.RunPayroll.Lock', isGranted: true }];
  render(view());
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
  expect(screen.getByText(/Ask your HR administrator to complete payroll/)).toBeVisible();
});

it('does not use an old employee or month response as current evidence', () => {
  state.query.currentData = { ...state.query.currentData, employeeId: 'other-staff' };
  render(view());
  expect(screen.getByText(/Checking payslip availability/)).toBeVisible();
  expect(screen.queryByText(/Payroll is not locked/)).not.toBeInTheDocument();
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
});

it.each([403, 503])('distinguishes %s failure from an empty period and retries', (status) => {
  state.query = { ...state.query, isError: true, error: { status } };
  render(view());
  expect(screen.getByRole('alert')).toHaveTextContent(
    status === 403 ? 'You do not have access' : 'Payroll status could not be checked'
  );
  expect(screen.queryByText(/Payroll is not locked/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Retry status' }));
  expect(state.refetch).toHaveBeenCalledTimes(1);
});

it.each(['AVAILABLE', 'ISSUANCE_REQUIRED'])(
  'distinguishes %s from unlocked payroll and offers a read-only reload',
  (status) => {
    state.query.currentData.status = status;
    render(view());
    expect(
      screen.getByText(
        status === 'AVAILABLE'
          ? /payslip has been issued/
          : /issued payslip document is unavailable/
      )
    ).toBeVisible();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(state.reload).toHaveBeenCalledTimes(status === 'AVAILABLE' ? 1 : 0);
    fireEvent.click(screen.getByRole('button', { name: 'Reload payslips' }));
    expect(state.reload).toHaveBeenCalledTimes(status === 'AVAILABLE' ? 2 : 1);
    expect(state.refetch).toHaveBeenCalledTimes(1);
  }
);

it('automatically reloads once after a pending period is issued and ignores a late response for another selection', () => {
  const page = render(view());
  expect(state.reload).not.toHaveBeenCalled();
  state.query.currentData = {
    ...state.query.currentData,
    employeeId: 'another-staff',
    status: 'AVAILABLE',
  };
  page.rerender(view());
  expect(state.reload).not.toHaveBeenCalled();
  state.query.currentData = { ...state.query.currentData, employeeId: 'staff-1' };
  page.rerender(view());
  expect(state.reload).toHaveBeenCalledOnce();
  page.rerender(view());
  expect(state.reload).toHaveBeenCalledOnce();
});
