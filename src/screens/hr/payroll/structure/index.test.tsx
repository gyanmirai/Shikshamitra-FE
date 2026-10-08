import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import EmployeeSalaryStructureScreen from './index';

const mocks = vi.hoisted(() => ({
  params: 'employeeId=staff-1&setup=salary&from=staff-edit',
  employee: undefined as any,
  structure: vi.fn(),
  revision: vi.fn(),
}));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams(mocks.params) }));
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
vi.mock('./salary-editor-dialog', () => ({
  SalaryEditorDialog: ({ employeeId, handleClose }: any) => (
    <div role="dialog" aria-label={employeeId}>
      <button type="button" onClick={handleClose}>
        Close editor
      </button>
    </div>
  ),
}));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.params = 'employeeId=staff-1&setup=salary&from=staff-edit';
  mocks.employee = undefined;
});

it('opens the editor and starts salary reads before staff details resolve', () => {
  render(<EmployeeSalaryStructureScreen />);
  expect(screen.getByRole('dialog', { name: 'staff-1' })).toBeVisible();
  expect(mocks.structure).toHaveBeenCalledWith({ employeeId: 'staff-1' }, { skip: false });
  expect(mocks.revision).toHaveBeenCalledWith(expect.objectContaining({ employeeId: 'staff-1' }), {
    skip: false,
  });
  expect(
    screen.queryByText('Select a staff member to view salary structure.')
  ).not.toBeInTheDocument();
});
it('does not reopen a dismissed editor when details arrive or override manual selection', () => {
  const { rerender } = render(<EmployeeSalaryStructureScreen />);
  fireEvent.click(screen.getByRole('button', { name: 'Close editor' }));
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
  expect(screen.getByRole('dialog', { name: 'staff-2' })).toBeVisible();
  mocks.params = '';
  rerender(<EmployeeSalaryStructureScreen />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(mocks.structure).toHaveBeenLastCalledWith({ employeeId: '' }, { skip: true });
});
