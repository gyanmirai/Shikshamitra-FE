import type React from 'react';

import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from 'src/test/test-utils';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { RenderAssignReportingManager } from './AssignReportingManager';

const mocks = vi.hoisted(() => ({
  getEmployeeById: vi.fn(),
  queryResult: {
    data: {
      items: [
        {
          id: 'manager-1',
          fullName: 'Akshay Patel',
          status: 0,
          employeeIdentifier: 'HOD130001',
          kind: 'Employee',
        },
      ],
    },
    isLoading: false,
    isFetching: false,
  },
}));

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

vi.mock('src/components/custom-tooltip', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('src/redux/customQueryAndMutation', () => ({
  default: () => mocks.queryResult,
}));

vi.mock('src/redux/hr/employeeApi', () => ({
  useGetReportingManagerOptionsQuery: vi.fn(),
  useLazyGetEmployeeByIdQuery: () => [mocks.getEmployeeById],
}));

describe('RenderAssignReportingManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.queryResult.data.items = [
      {
        id: 'manager-1',
        fullName: 'Akshay Patel',
        status: 0,
        employeeIdentifier: 'HOD130001',
        kind: 'Employee',
      },
    ];
    mocks.getEmployeeById.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        id: 'manager-1',
        fullName: 'Akshay Patel',
        status: 0,
      }),
    });
  });

  const form = (values: Record<string, unknown> = {}) => ({
    values: {
      employeeId: 'employee-1',
      reportingManager: '',
      reportingManagerName: '',
      reportingManagerKind: 'Employee',
      ...values,
    },
    touched: {},
    errors: {},
    submitCount: 0,
    isSubmitting: false,
    setFieldValue: vi.fn(),
    setFieldTouched: vi.fn(),
    setFieldError: vi.fn(),
    validateForm: vi.fn().mockResolvedValue({}),
    submitForm: vi.fn(),
    resetForm: vi.fn(),
  });

  it('requires an explicit choice of the fresh tenant administrator and retains its identity kind', async () => {
    mocks.queryResult.data.items = [
      {
        id: 'admin-user-1',
        fullName: 'Tenant admin',
        status: 0,
        employeeIdentifier: '',
        kind: 'TenantAdministrator',
      },
    ];
    const formik = form();
    renderWithProviders(<RenderAssignReportingManager formik={formik} isMainForm />);
    expect(formik.setFieldValue).not.toHaveBeenCalled();
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox', { name: /Reporting manager/i }));
    await user.click(
      await screen.findByRole('option', { name: 'Tenant admin (Tenant administrator)' })
    );
    expect(formik.setFieldValue).toHaveBeenCalledWith('reportingManager', 'admin-user-1', true);
    expect(formik.setFieldValue).toHaveBeenCalledWith(
      'reportingManagerKind',
      'TenantAdministrator'
    );
    expect(mocks.getEmployeeById).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(formik.setFieldValue).toHaveBeenCalledWith('reportingManager', '', true);
    expect(formik.setFieldTouched).toHaveBeenCalledWith('reportingManager', true, false);
  });

  it('reloads a saved administrator without treating the login ID as an employee ID', async () => {
    const formik = form({
      reportingManager: 'admin-user-1',
      reportingManagerName: 'Tenant admin',
      reportingManagerKind: 'TenantAdministrator',
    });
    renderWithProviders(<RenderAssignReportingManager formik={formik} isMainForm />);
    expect(screen.getByRole('combobox', { name: /Reporting manager/i })).toHaveValue(
      'Tenant admin (Tenant administrator)'
    );
    expect(mocks.getEmployeeById).not.toHaveBeenCalled();
    expect(formik.setFieldValue).not.toHaveBeenCalled();
  });

  it('does not offer the employee as their own manager', async () => {
    const formik = form({ employeeId: 'manager-1' });
    renderWithProviders(<RenderAssignReportingManager formik={formik} isMainForm />);
    await userEvent.setup().click(screen.getByRole('combobox', { name: /Reporting manager/i }));
    expect(screen.queryByRole('option', { name: 'Akshay Patel' })).not.toBeInTheDocument();
  });

  it('clears stale required state when a manager is selected', async () => {
    const user = userEvent.setup();
    const formik = {
      values: {
        employeeId: 'employee-1',
        reportingManager: '',
        reportingManagerName: '',
        reportingManagerStatus: null,
      },
      touched: { reportingManager: true },
      errors: { reportingManager: 'Reporting Manager is required' },
      submitCount: 0,
      isSubmitting: false,
      setFieldValue: vi.fn(),
      setFieldTouched: vi.fn(),
      setFieldError: vi.fn(),
      validateForm: vi.fn().mockResolvedValue({}),
      submitForm: vi.fn(),
      resetForm: vi.fn(),
    };

    renderWithProviders(<RenderAssignReportingManager formik={formik} isMainForm />);

    expect(screen.getByText('Reporting Manager is required')).toBeVisible();

    await user.click(screen.getByPlaceholderText('Search and select a manager'));
    await user.click(await screen.findByText('Akshay Patel'));

    await waitFor(() => {
      expect(formik.setFieldTouched).toHaveBeenCalledWith('reportingManager', false, false);
      expect(formik.setFieldValue).toHaveBeenCalledWith('reportingManager', 'manager-1', true);
      expect(formik.setFieldError).toHaveBeenCalledWith('reportingManager', undefined);
    });
  });
});
