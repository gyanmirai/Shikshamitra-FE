import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import EmployeeSalaryStructureScreen from './index';

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  params: 'employeeId=staff-1&setup=salary&from=staff-edit',
  employee: undefined as any,
  structure: vi.fn(),
  revision: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(mocks.params),
  useRouter: () => ({ replace: mocks.replace }),
}));
vi.mock('react-redux', () => ({ useSelector: () => [] }));
vi.mock('src/utils/permissions', () => ({ hasGrantedPermission: () => true }));
vi.mock('src/redux/hr/employeeApi', () => ({
  useGetEmployeeByIdQuery: () => ({ currentData: mocks.employee }),
  useLazyGetEmployeeQuery: vi.fn(),
}));
vi.mock('src/redux/customQueryAndMutation', () => ({ default: () => [vi.fn()] }));
vi.mock('src/redux/hr/employee-salary-structure-api', () => ({
  useGetEmployeeSalaryStructureQuery: (...args: any[]) => {
    mocks.structure(...args);
    return {};
  },
}));
vi.mock('src/redux/hr/compensation-revision-api', () => ({
  useGetEffectiveCompensationRevisionQuery: (...args: any[]) => {
    mocks.revision(...args);
    return {};
  },
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: () => <h1>Payroll Structure</h1>,
}));
vi.mock('src/components/customizabaleTable', () => ({ default: () => null }));
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
beforeEach(() => {
  vi.clearAllMocks();
  mocks.params = 'employeeId=staff-1&setup=salary&from=staff-edit';
  mocks.employee = undefined;
});

it('replaces a legacy salary link and starts salary reads before staff details resolve', () => {
  render(<EmployeeSalaryStructureScreen />);
  expect(mocks.replace).toHaveBeenCalledWith(
    '/hr/payroll/structure/staff-1/edit?returnTo=%2Fhr%2Femployee%3Fmode%3Dform%26editEmployee%3Dstaff-1%26step%3Dpayroll'
  );
  expect(mocks.structure).toHaveBeenCalledWith({ employeeId: 'staff-1' }, { skip: false });
  expect(mocks.revision).toHaveBeenCalledWith(expect.objectContaining({ employeeId: 'staff-1' }), {
    skip: false,
  });
  expect(
    screen.queryByText('Select a staff member to view salary structure.')
  ).not.toBeInTheDocument();
});
it('does not override manual selection when staff details arrive', () => {
  const { rerender } = render(<EmployeeSalaryStructureScreen />);
  mocks.employee = { fullName: 'First staff', status: 0 };
  rerender(<EmployeeSalaryStructureScreen />);
  expect(screen.getByText('First staff')).toBeVisible();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Select second staff' }));
  expect(screen.getByText('Second staff')).toBeVisible();
  expect(mocks.structure).toHaveBeenLastCalledWith({ employeeId: 'staff-2' }, { skip: false });
  fireEvent.click(screen.getByRole('button', { name: 'Clear staff' }));
  expect(mocks.structure).toHaveBeenLastCalledWith({ employeeId: '' }, { skip: true });
});
it('resets employee selection for another deep link and keeps the plain route idle', () => {
  const { rerender } = render(<EmployeeSalaryStructureScreen />);
  mocks.params = 'employeeId=staff-2&setup=salary';
  rerender(<EmployeeSalaryStructureScreen />);
  expect(mocks.replace).toHaveBeenLastCalledWith(
    '/hr/payroll/structure/staff-2/edit?returnTo=%2Fhr%2Fpayroll%2Fstructure%3FemployeeId%3Dstaff-2'
  );
  mocks.params = '';
  rerender(<EmployeeSalaryStructureScreen />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(mocks.structure).toHaveBeenLastCalledWith({ employeeId: '' }, { skip: true });
});
