import type React from 'react';

import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from 'src/test/test-utils';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { EmployeeStatusType } from 'src/enums/employee-status-type';

import ChangeStatusForm from './chnage-status-form';

const mocks = vi.hoisted(() => ({
  updateStatus: vi.fn(),
  getEmployeeStatusDeactivationCheck: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({ label }: { label: string }) => <input aria-label={label} readOnly />,
}));

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

vi.mock('src/components/custom-tooltip', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('src/components/customDialog', () => ({
  DialogScrollContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    error: mocks.toastError,
    success: vi.fn(),
  },
}));

vi.mock('src/redux/customQueryAndMutation', () => ({
  default: () => [mocks.updateStatus, { isLoading: false }],
}));

vi.mock('src/redux/hr/employeeApi', () => ({
  useUpdateEmployeeStatusMutation: vi.fn(),
  useGetEmployeeStatusDeactivationCheckQuery: (...args: unknown[]) =>
    mocks.getEmployeeStatusDeactivationCheck(...args),
}));

const changeStatusForm = (status = EmployeeStatusType.Active) => (
  <ChangeStatusForm
    handleClose={vi.fn()}
    employeeId="manager-1"
    employeeName="Manager One"
    status={status}
  />
);

const renderForm = (status = EmployeeStatusType.Active) =>
  renderWithProviders(changeStatusForm(status));

describe('ChangeStatusForm manager deactivation warning', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.updateStatus.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({}),
    });
    mocks.getEmployeeStatusDeactivationCheck.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: false,
    });
  });

  it.each([EmployeeStatusType.Inactive, EmployeeStatusType.Left, EmployeeStatusType.Retired])(
    'checks manager deactivation eligibility for non-active status %s',
    (selectedStatus) => {
      mocks.getEmployeeStatusDeactivationCheck.mockReturnValue({
        data: { canDeactivate: true, activeDirectReportCount: 0 },
        isLoading: false,
        isFetching: false,
        isError: false,
      });

      renderForm(selectedStatus);

      expect(mocks.getEmployeeStatusDeactivationCheck).toHaveBeenCalledWith('manager-1', {
        skip: false,
        refetchOnMountOrArgChange: true,
      });
    }
  );

  it('shows the warning and disables Update when the deactivation check blocks the manager', async () => {
    mocks.getEmployeeStatusDeactivationCheck.mockReturnValue({
      data: { canDeactivate: false, activeDirectReportCount: 1 },
      isLoading: false,
      isFetching: false,
      isError: false,
    });

    renderForm(EmployeeStatusType.Inactive);

    expect(
      await screen.findByTestId('hr-employee-manager-deactivation-warning-dialog')
    ).toBeVisible();
    expect(screen.getByText('Cannot Deactivate Manager')).toBeVisible();
    expect(
      screen.getByText(
        'This employee is currently assigned as a Reporting Manager for active staff members. Please assign a new manager to their team before making this employee inactive.'
      )
    ).toBeVisible();
    expect(screen.getByTestId('hr-employee-status-update-button')).toBeDisabled();
    expect(mocks.getEmployeeStatusDeactivationCheck).toHaveBeenCalledWith('manager-1', {
      skip: false,
      refetchOnMountOrArgChange: true,
    });
  });

  it('uses canDeactivate as the blocking decision even when active report count is zero', async () => {
    mocks.getEmployeeStatusDeactivationCheck.mockReturnValue({
      data: { canDeactivate: false, activeDirectReportCount: 0 },
      isLoading: false,
      isFetching: false,
      isError: false,
    });

    renderForm(EmployeeStatusType.Inactive);

    expect(
      await screen.findByTestId('hr-employee-manager-deactivation-warning-dialog')
    ).toBeVisible();
    expect(screen.getByTestId('hr-employee-status-update-button')).toBeDisabled();
  });

  it('does not show the warning when the selected status is Active', () => {
    renderForm(EmployeeStatusType.Active);

    expect(
      screen.queryByTestId('hr-employee-manager-deactivation-warning-dialog')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('hr-employee-status-update-button')).toBeEnabled();
    expect(mocks.getEmployeeStatusDeactivationCheck).toHaveBeenCalledWith('manager-1', {
      skip: true,
      refetchOnMountOrArgChange: true,
    });
  });

  it('does not show the warning when a non-active manager has no active staff', () => {
    mocks.getEmployeeStatusDeactivationCheck.mockReturnValue({
      data: { canDeactivate: true, activeDirectReportCount: 0 },
      isLoading: false,
      isFetching: false,
      isError: false,
    });

    renderForm(EmployeeStatusType.Inactive);

    expect(
      screen.queryByTestId('hr-employee-manager-deactivation-warning-dialog')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('hr-employee-status-update-button')).toBeEnabled();
  });

  it('disables Update while the deactivation check is loading', () => {
    mocks.getEmployeeStatusDeactivationCheck.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: false,
      isError: false,
    });

    renderForm(EmployeeStatusType.Inactive);

    expect(screen.getByTestId('hr-employee-status-update-button')).toBeDisabled();
    expect(
      screen.queryByTestId('hr-employee-manager-deactivation-warning-dialog')
    ).not.toBeInTheDocument();
  });

  it('does not show the manager warning for stale blocked data during refetch', () => {
    mocks.getEmployeeStatusDeactivationCheck.mockReturnValue({
      data: { canDeactivate: false, activeDirectReportCount: 1 },
      isLoading: false,
      isFetching: true,
      isError: false,
    });

    renderForm(EmployeeStatusType.Inactive);

    expect(screen.getByTestId('hr-employee-status-update-button')).toBeDisabled();
    expect(
      screen.queryByTestId('hr-employee-manager-deactivation-warning-dialog')
    ).not.toBeInTheDocument();
  });

  it('fails closed when the deactivation check cannot verify reporting-manager assignments', () => {
    mocks.getEmployeeStatusDeactivationCheck.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
    });

    renderForm(EmployeeStatusType.Inactive);

    expect(screen.getByTestId('hr-employee-status-update-button')).toBeDisabled();
    expect(
      screen.getByText('Unable to verify reporting-manager assignments. Please try again.')
    ).toBeVisible();
    expect(
      screen.queryByTestId('hr-employee-manager-deactivation-warning-dialog')
    ).not.toBeInTheDocument();
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it('closes the manager warning when a refetch fails with stale blocked data', async () => {
    let deactivationCheckState = {
      data: { canDeactivate: false, activeDirectReportCount: 1 },
      isLoading: false,
      isFetching: false,
      isError: false,
    };
    mocks.getEmployeeStatusDeactivationCheck.mockImplementation(() => deactivationCheckState);

    const { rerender } = renderForm(EmployeeStatusType.Inactive);

    expect(
      await screen.findByTestId('hr-employee-manager-deactivation-warning-dialog')
    ).toBeVisible();

    deactivationCheckState = {
      data: { canDeactivate: false, activeDirectReportCount: 1 },
      isLoading: false,
      isFetching: false,
      isError: true,
    };
    rerender(changeStatusForm(EmployeeStatusType.Inactive));

    expect(screen.getByTestId('hr-employee-status-update-button')).toBeDisabled();
    expect(
      screen.getByText('Unable to verify reporting-manager assignments. Please try again.')
    ).toBeVisible();
    await waitFor(() =>
      expect(
        screen.queryByTestId('hr-employee-manager-deactivation-warning-dialog')
      ).not.toBeInTheDocument()
    );
  });

  it('suppresses the generic toast for the known reporting-manager backend block', async () => {
    const user = userEvent.setup();
    const unwrap = vi.fn().mockRejectedValue({
      data: { code: 'HR:Employee:010032', message: 'Reporting manager has active reports' },
    });
    mocks.updateStatus.mockReturnValue({ unwrap });
    mocks.getEmployeeStatusDeactivationCheck.mockReturnValue({
      data: { canDeactivate: true, activeDirectReportCount: 0 },
      isLoading: false,
      isFetching: false,
      isError: false,
    });

    renderForm(EmployeeStatusType.Inactive);

    await user.click(screen.getByTestId('hr-employee-status-update-button'));

    expect(
      await screen.findByTestId('hr-employee-manager-deactivation-warning-dialog')
    ).toBeVisible();
    expect(mocks.toastError).not.toHaveBeenCalled();
  });
});
