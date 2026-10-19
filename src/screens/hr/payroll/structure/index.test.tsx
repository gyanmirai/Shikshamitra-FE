import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import EmployeeSalaryStructureScreen from './index';

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  refetch: vi.fn(),
  query: vi.fn(),
  canRead: true,
  params: 'employeeId=staff-1&month=2026-10',
  isError: false,
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
    return { currentData: mocks.summary, isError: mocks.isError, refetch: mocks.refetch };
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
  mocks.summary = undefined;
});
it('keeps a stable loading state and reads URL-selected staff and month', () => {
  render(<EmployeeSalaryStructureScreen />);
  expect(screen.getByRole('heading', { name: 'Payroll Structure' })).toBeVisible();
  expect(screen.getByRole('status', { name: 'Loading salary details' })).toBeVisible();
  expect(mocks.query).toHaveBeenCalledWith(
    { employeeId: 'staff-1', month: '2026-10' },
    { skip: false }
  );
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
