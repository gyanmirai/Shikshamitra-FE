import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { PayrollProfilePolicyEditor } from './payroll-profile-policy-editor';

const mocks = vi.hoisted(() => ({ preview: vi.fn(), upsert: vi.fn(), disable: vi.fn() }));
vi.mock('react-redux', () => ({
  useSelector: (selector: any) => selector({ confirmPopup: { isChanges: false } }),
  useDispatch: () => vi.fn(),
}));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
vi.mock('../policies/components/HRPolicySharedUI', () => ({
  DrawerHeader: ({ title, onClose }: any) => (
    <header>
      <h2>{title}</h2>
      <button type="button" onClick={onClose}>
        Close
      </button>
    </header>
  ),
}));
vi.mock('src/redux/hr/hr-policy-api', () => ({
  useGetPayrollPoliciesQuery: () => ({
    data: { items: [{ id: 'payroll', name: 'Payroll policy', status: 'active' }] },
  }),
  useGetAttendancePoliciesQuery: () => ({
    data: { items: [{ id: 'attendance', name: 'Attendance policy', status: 'active' }] },
  }),
  usePreviewPolicyAssignmentImpactMutation: () => [mocks.preview, {}],
  useUpsertEmployeePolicyOverrideMutation: () => [mocks.upsert, {}],
  useDisableEmployeePolicyOverrideMutation: () => [mocks.disable, {}],
}));
vi.mock('src/redux/hr/leaveApi', () => ({
  useGetLeavePoliciesQuery: () => ({
    data: { items: [{ id: 'leave', policyTitle: 'Leave policy', isActive: true }] },
  }),
}));
const assigned = {
  policySource: 'employee',
  assignment: {
    id: 'assignment',
    payrollPolicyId: 'payroll',
    attendancePolicyId: 'attendance',
    leavePolicyId: 'leave',
    effectiveFrom: '2026-01-01',
  },
} as any;
const impact = {
  requiresConfirmation: true,
  confirmationToken: 'review-token',
  warnings: [
    {
      code: 'review',
      severity: 'warning',
      message: 'Existing payroll review will be invalidated.',
    },
  ],
  blockingWarnings: [],
  affectedPayrollMonths: [{ label: 'October 2026' }],
};
beforeEach(() => {
  vi.clearAllMocks();
  mocks.preview.mockReturnValue({ unwrap: async () => impact });
  mocks.upsert.mockReturnValue({ unwrap: async () => undefined });
  mocks.disable.mockReturnValue({ unwrap: async () => undefined });
});
const renderEditor = (close = vi.fn()) => {
  render(
    <PayrollProfilePolicyEditor
      employeeId="staff"
      academicYearId="year"
      preview={assigned}
      onClose={close}
    />
  );
  return close;
};
const review = async () => {
  fireEvent.change(screen.getByLabelText('Reason *'), { target: { value: 'Updated assignment' } });
  fireEvent.click(screen.getByRole('button', { name: 'Review assignment' }));
  await screen.findByText('Review assignment impact');
};
describe('staff policy assignment drawer', () => {
  it('requires impact review before an employee-specific save and forwards confirmation', async () => {
    const close = renderEditor();
    await review();
    expect(screen.getByText('Existing payroll review will be invalidated.')).toBeVisible();
    expect(mocks.upsert).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm assignment' }));
    await waitFor(() => expect(close).toHaveBeenCalled());
    expect(mocks.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        employeeId: 'staff',
        academicYearId: 'year',
        assignmentId: 'assignment',
        confirmationToken: 'review-token',
      })
    );
  });
  it('hides selectors for organization policies and uses the disable API after review', async () => {
    renderEditor();
    fireEvent.click(screen.getByRole('radio', { name: 'Use organization policies' }));
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    await review();
    expect(mocks.preview).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'employee-override-disable' })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Confirm assignment' }));
    await waitFor(() =>
      expect(mocks.disable).toHaveBeenCalledWith(
        expect.objectContaining({
          employeeId: 'staff',
          assignmentId: 'assignment',
          assignmentReason: 'Updated assignment',
          confirmationToken: 'review-token',
        })
      )
    );
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
  it('blocks confirmation when impact contains blocking warnings', async () => {
    mocks.preview.mockReturnValue({
      unwrap: async () => ({
        ...impact,
        blockingWarnings: [
          { code: 'locked', severity: 'blocking', message: 'Payroll is finalized.' },
        ],
      }),
    });
    renderEditor();
    await review();
    expect(screen.getByRole('button', { name: 'Confirm assignment' })).toBeDisabled();
    expect(screen.getByText('Payroll is finalized.')).toBeVisible();
  });
  it('retains inputs and requires fresh review after a rejected save', async () => {
    mocks.upsert.mockReturnValue({
      unwrap: async () => {
        throw Object.assign(new Error('Assignment changed. Review again.'), {
          data: { detail: 'Assignment changed. Review again.' },
        });
      },
    });
    const close = renderEditor();
    await review();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm assignment' }));
    await screen.findByRole('button', { name: 'Review assignment' });
    expect(screen.getByLabelText('Reason *')).toHaveValue('Updated assignment');
    expect(close).not.toHaveBeenCalled();
  });
  it('requires a reason and protects dirty dismissal', async () => {
    const close = renderEditor();
    fireEvent.change(screen.getByLabelText('Effective from *'), {
      target: { value: '2026-11-01' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Review assignment' }));
    await screen.findByText('Enter a reason for this change');
    expect(mocks.preview).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await screen.findByText('Discard unsaved changes?');
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(close).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Effective from *')).toHaveValue('2026-11-01');
  });
});
