import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';

import EmployeeSalaryStructureScreen from './index';

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  refetch: vi.fn(),
  query: vi.fn(),
  canRead: true,
  params: 'employeeId=staff-1&month=2026-10',
  isError: false,
  isFetching: false,
  summary: undefined as any,
}));
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(mocks.params),
  useRouter: () => ({ replace: mocks.replace }),
}));
vi.mock('react-redux', () => ({ useSelector: () => [] }));
vi.mock('src/utils/permissions', () => ({ hasGrantedPermission: () => mocks.canRead }));
vi.mock('src/redux/hr/employeeApi', () => ({
  useGetEmployeeByIdQuery: () => ({ currentData: employee }),
  useLazyGetEmployeeOptionsQuery: () => [vi.fn()],
}));
vi.mock('src/redux/customQueryAndMutation', () => ({ default: () => [vi.fn()] }));
vi.mock('src/redux/hr/compensation-revision-api', () => ({
  useGetSalarySummaryQuery: (...args: any[]) => {
    mocks.query(...args);
    return {
      currentData: mocks.summary,
      isError: mocks.isError,
      isFetching: mocks.isFetching,
      refetch: mocks.refetch,
    };
  },
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ action }: any) => (
    <>
      <h1>Payroll Structure</h1>
      {action}
    </>
  ),
}));
vi.mock('src/components/paginated-search-select', () => ({
  PaginatedSearchSelect: ({ value, onChange }: any) => (
    <>
      <span>{value?.label}</span>
      <button
        type="button"
        onClick={() => onChange(null, { id: 'staff-2', label: 'Second staff' })}
      >
        Select second staff
      </button>
      <button type="button" onClick={() => onChange(null, null)}>
        Clear staff
      </button>
    </>
  ),
}));
const employee = { fullName: 'Test Staff' };
const loaded = () => ({
  month: '2026-10',
  revisionId: 'revision-1',
  salaryEffectiveMonth: '2022-04-01',
  grossSalary: 18000,
  totalDeductions: 1395,
  netSalary: 16605,
  employerCost: 19845,
  quotedEmployerCost: null,
  isComplete: true,
  earnings: [{ code: 'basic', name: 'Basic salary', amount: 18000 }],
  deductions: [{ code: 'pf', name: 'Provident fund', amount: 1296 }],
  employerContributions: [],
  blockingIssues: [],
  statutorySummary: [
    {
      scheme: 'PF',
      status: 'APPLIED',
      reason: 'School PF rule applies.',
      registrationPending: true,
      employeeAmount: 1296,
      employerAmount: 1296,
    },
    {
      scheme: 'ESIC',
      status: 'APPLIED',
      reason: 'Within coverage.',
      registrationPending: true,
      employeeAmount: 135,
      employerAmount: 585,
    },
    {
      scheme: 'PT',
      status: 'NOT_APPLICABLE',
      reason: 'No tax in this slab.',
      registrationPending: false,
      employeeAmount: 0,
      employerAmount: 0,
    },
  ],
});
beforeEach(() => {
  vi.clearAllMocks();
  mocks.params = 'employeeId=staff-1&month=2026-10';
  mocks.canRead = true;
  mocks.isError = false;
  mocks.isFetching = false;
  mocks.summary = undefined;
});
it('keeps a stable loading state and reads URL-selected staff and month', () => {
  render(<EmployeeSalaryStructureScreen />);
  expect(screen.getByRole('heading', { name: 'Payroll Structure' })).toBeVisible();
  expect(screen.getByRole('status', { name: 'Loading salary details' })).toBeVisible();
  expect(screen.getByRole('status', { name: 'Loading salary details' })).toHaveAttribute(
    'aria-busy',
    'true'
  );
  expect(screen.queryByText('₹0')).not.toBeInTheDocument();
  expect(screen.queryByText('Unavailable')).not.toBeInTheDocument();
  expect(mocks.query).toHaveBeenCalledWith(
    { employeeId: 'staff-1', month: '2026-10' },
    { skip: false }
  );
});
it('retains the salary and context during refresh, then removes the busy feedback', () => {
  mocks.summary = loaded();
  mocks.isFetching = true;
  const { rerender } = render(<EmployeeSalaryStructureScreen />);
  expect(screen.getByRole('region', { name: 'Salary details' })).toHaveAttribute(
    'aria-busy',
    'true'
  );
  expect(screen.getByRole('progressbar', { name: 'Refreshing salary details' })).toBeVisible();
  expect(screen.getByText('₹16,605')).toBeVisible();
  expect(screen.getByDisplayValue('2026-10')).toBeVisible();
  expect(screen.queryByRole('status', { name: 'Loading salary details' })).not.toBeInTheDocument();
  mocks.isFetching = false;
  rerender(<EmployeeSalaryStructureScreen />);
  expect(screen.getByRole('region', { name: 'Salary details' })).toHaveAttribute(
    'aria-busy',
    'false'
  );
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  expect(screen.getByText('₹16,605')).toBeVisible();
});
it('shows totals and all statutory decisions while registration is pending', () => {
  mocks.summary = loaded();
  render(<EmployeeSalaryStructureScreen />);
  expect(screen.getByText('Estimated take-home')).toBeVisible();
  expect(screen.getByText('₹16,605')).toBeVisible();
  expect(screen.getByText('Professional tax')).toBeVisible();
  expect(screen.getAllByText(/Registration pending/)).toHaveLength(2);
  expect(screen.getByRole('link', { name: /Open Run Payroll/ })).toHaveAttribute(
    'href',
    '/hr/payroll/run-payroll?month=2026-10'
  );
  expect(screen.getByRole('link', { name: 'Edit salary' })).toHaveAttribute(
    'href',
    expect.stringContaining('month=2026-10')
  );
});
it.each([
  [20445, '₹600 lower than saved CTC.'],
  [19245, '₹600 higher than saved CTC.'],
  [19844.75, '₹0.25 higher than saved CTC.'],
])('explains the monthly CTC comparison without an alert for saved CTC %s', (quoted, message) => {
  mocks.summary = { ...loaded(), quotedEmployerCost: quoted };
  render(<EmployeeSalaryStructureScreen />);
  const estimate = within(screen.getByRole('region', { name: 'Full-month estimate' }));
  expect(estimate.getByRole('heading', { name: 'Full-month estimate', level: 2 })).toBeVisible();
  expect(estimate.getByText('October 2026')).toBeVisible();
  expect(estimate.getByText(message)).toBeVisible();
  expect(estimate.getByText(/Agreed gross salary remains unchanged/)).toBeVisible();
  expect(estimate.getByText(/Salary effective from April 2022/)).toBeVisible();
  expect(estimate.queryByRole('alert')).not.toBeInTheDocument();
});
it.each([null, 19845, 19845.005])(
  'omits the CTC comparison when absent or immaterial: %s',
  (quoted) => {
    mocks.summary = { ...loaded(), quotedEmployerCost: quoted };
    render(<EmployeeSalaryStructureScreen />);
    expect(screen.queryByText(/than saved CTC/)).not.toBeInTheDocument();
  }
);
it('does not imply a known school cost when the estimate is incomplete', () => {
  mocks.summary = { ...loaded(), isComplete: false, employerCost: null, quotedEmployerCost: 20000 };
  render(<EmployeeSalaryStructureScreen />);
  expect(screen.getByRole('alert')).toHaveTextContent('This estimate is incomplete');
  expect(screen.getByText('Unavailable')).toBeVisible();
  expect(screen.queryByText(/than saved CTC/)).not.toBeInTheDocument();
});
it('never presents incomplete totals as zero', () => {
  mocks.summary = {
    ...loaded(),
    isComplete: false,
    netSalary: null,
    totalDeductions: null,
    employerCost: null,
  };
  render(<EmployeeSalaryStructureScreen />);
  expect(screen.getByText(/This estimate is incomplete/)).toBeVisible();
  expect(screen.getAllByText('Unavailable')).toHaveLength(3);
});
it('preserves month when changing staff', () => {
  render(<EmployeeSalaryStructureScreen />);
  fireEvent.click(screen.getByRole('button', { name: 'Select second staff' }));
  expect(mocks.replace).toHaveBeenLastCalledWith(
    '/hr/payroll/structure?employeeId=staff-2&month=2026-10'
  );
});
it('offers retry after a failed request', () => {
  mocks.isError = true;
  render(<EmployeeSalaryStructureScreen />);
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(mocks.refetch).toHaveBeenCalled();
});
it('does not read salary without compensation permission', () => {
  mocks.canRead = false;
  render(<EmployeeSalaryStructureScreen />);
  expect(mocks.query).toHaveBeenCalledWith(expect.anything(), { skip: true });
  expect(screen.getByText(/do not have permission/)).toBeVisible();
});
it('keeps a plain route idle and retains staff-entry redirects', () => {
  mocks.params = '';
  const { rerender } = render(<EmployeeSalaryStructureScreen />);
  expect(mocks.query).toHaveBeenLastCalledWith(expect.anything(), { skip: true });
  mocks.params = 'employeeId=staff-1&setup=salary&from=staff-edit&month=2026-10';
  rerender(<EmployeeSalaryStructureScreen />);
  expect(mocks.replace).toHaveBeenCalledWith(expect.stringContaining('/staff-1/edit?returnTo='));
  expect(mocks.replace).toHaveBeenCalledWith(expect.stringContaining('month=2026-10'));
});
