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

vi.mock('src/redux/customQueryAndMutation', () => ({
  default: () => mocks.queryResult,
}));

vi.mock('src/redux/hr/employeeApi', () => ({
  useGetEmployeeQuery: vi.fn(),
  useLazyGetEmployeeByIdQuery: () => [mocks.getEmployeeById],
}));

describe('RenderAssignReportingManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getEmployeeById.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        id: 'manager-1',
        fullName: 'Akshay Patel',
        status: 0,
      }),
    });
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
