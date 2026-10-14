import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { PayrollProfileWorkspace } from './payroll-profile-workspace';
import { PayrollProfileDetailsEditor } from './payroll-profile-details-editor';
import {
  staffSalaryEditorHref,
  staffPayrollProfileHref,
  changedPayrollProfileGroups,
} from './payroll-profile-utils';

const mocks = vi.hoisted(() => ({
  prefetch: vi.fn(),
  permissions: [] as Array<{ name: string; isGranted: boolean }>,
  details: {
    data: {
      bankDetails: {
        bankName: 'Test bank',
        branchName: 'Main',
        accountHolderName: 'Staff',
        accountNumber: '1234567890',
        ifscCode: 'SBIN0001234',
      },
      salaryDetails: {
        epfNumber: 'legacy-format',
        uanNumber: '123456789012',
        punchId: 'STAFF01',
        totalWorkingHourPerMonth: 160,
      },
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  },
  salary: { data: null as any, isLoading: false, isError: false, refetch: vi.fn() },
  revisions: { data: { items: [] as any[] }, isLoading: false, isError: false, refetch: vi.fn() },
  policies: { currentData: null as any, isFetching: false, isError: false, refetch: vi.fn() },
  save: vi.fn(),
}));
vi.mock('../payroll/structure/use-salary-editor-prefetch', () => ({
  useSalaryEditorPrefetch: () => mocks.prefetch,
}));
vi.mock('react-redux', () => ({
  useSelector: (selector: any) =>
    selector({
      auth: { permissions: mocks.permissions },
      globalState: { currentYear: { id: 'year' } },
    }),
}));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
vi.mock('src/components/form-section-card', () => ({
  FormSectionCard: ({ title, children, action }: any) => (
    <section>
      <h2>{title}</h2>
      {action}
      {children}
    </section>
  ),
}));
vi.mock('../policies/components/HRPolicySharedUI', () => ({
  DrawerHeader: ({ title, onClose, closeDisabled }: any) => (
    <header>
      <h2>{title}</h2>
      <button type="button" disabled={closeDisabled} onClick={onClose}>
        Close
      </button>
    </header>
  ),
}));
vi.mock('../payroll/setting/employee-esi-details', () => ({ EmployeeEsiDetails: () => null }));
vi.mock('./statutory-profile-editor', () => ({
  StatutoryProfileEditor: () => <div>Statutory registration details</div>,
}));
vi.mock('./payroll-profile-policy-editor', () => ({
  PayrollProfilePolicyEditor: () => <div>Assignment editor</div>,
}));
vi.mock('src/redux/hr/employeeApi', () => ({ useGetBankDetailsQuery: () => mocks.details }));
vi.mock('src/redux/hr/hr-policy-api', () => ({
  useGetPolicyAssignmentPreviewQuery: () => mocks.policies,
}));
vi.mock('src/redux/hr/compensation-revision-api', () => ({
  useGetEffectiveCompensationRevisionQuery: () => mocks.salary,
  useGetCompensationRevisionsQuery: () => mocks.revisions,
}));
vi.mock('src/redux/hr/salary-template-api', () => ({
  useGetSalaryTemplateQuery: () => ({ data: { name: 'Teaching salary' } }),
}));
vi.mock('src/redux/hr/employee-payroll-profile-api', () => ({
  useUpdatePayrollProfileDetailsMutation: () => [mocks.save, { isLoading: false }],
}));

const initialDetails = {
  bankDetails: mocks.details.data.bankDetails,
  statutoryIdentifiers: { epfNumber: 'legacy-format', uanNumber: '123456789012' },
  attendanceIntegration: { punchId: 'STAFF01', totalWorkingHourPerMonth: 160 },
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.permissions = [
    'HR.PayrollManagement.CompensationRevisions.View',
    'HR.PayrollManagement.CompensationRevisions.Manage',
    'HR.Policies.View',
    'HR.Policies.Assign',
    'HR.Policies.PreviewImpact',
    'HR.Employee.EmployeeList.Edit',
    'HR.PayrollManagement.PayrollStructure.Add',
    'HR.PayrollManagement.RunPayroll.View',
  ].map((name) => ({ name, isGranted: true }));
  mocks.salary.data = null;
  mocks.salary.isError = false;
  mocks.policies.currentData = null;
  mocks.policies.isError = false;
  mocks.revisions.data.items = [];
  mocks.save.mockReturnValue({ unwrap: async () => undefined });
});

describe('staff payroll overview', () => {
  it('preloads salary on pointer and keyboard intent, but not while actions are disabled', () => {
    const { rerender } = render(<PayrollProfileWorkspace employeeId="staff-1" />);
    const link = screen.getByRole('link', { name: 'Set up salary' });
    fireEvent.mouseEnter(link);
    fireEvent.focus(link);
    expect(mocks.prefetch).toHaveBeenCalledTimes(2);
    rerender(<PayrollProfileWorkspace employeeId="staff-1" actionsDisabled />);
    fireEvent.mouseEnter(link);
    fireEvent.focus(link);
    expect(mocks.prefetch).toHaveBeenCalledTimes(2);
  });
  it('offers salary setup and routes one-time adjustments to payroll without profile editors', () => {
    render(<PayrollProfileWorkspace employeeId="staff-1" />);
    expect(screen.getByRole('link', { name: 'Set up salary' })).toHaveAttribute(
      'href',
      staffSalaryEditorHref('staff-1')
    );
    expect(screen.getByRole('link', { name: /One-time adjustments/ })).toHaveAttribute(
      'href',
      '/hr/payroll/run-payroll'
    );
    expect(
      screen.queryByRole('button', { name: /Temp|Add adjustment|Add Earning/i })
    ).not.toBeInTheDocument();
  });
  it('shows current recurring components and scheduled salary separately', () => {
    mocks.salary.data = {
      grossSalary: 40000,
      estimatedStatutoryDeductions: [{ code: 'PT', name: 'Professional tax', amount: 200 }],
      netSalary: 38000,
      effectiveMonth: '2026-04-01T00:00:00',
      lines: [
        { id: 'basic', name: 'Basic pay', amount: 30000, isEarning: true, displayOrder: 1 },
        { id: 'pf', name: 'PF', amount: 2000, isEarning: false, displayOrder: 2 },
      ],
    };
    mocks.revisions.data.items = [
      {
        isScheduled: true,
        status: 'EFFECTIVE',
        effectiveMonth: '2027-01-01T00:00:00',
        grossSalary: 45000,
        netSalary: 43000,
      },
    ];
    render(<PayrollProfileWorkspace employeeId="staff-1" />);
    expect(screen.getByText('Basic pay')).toBeVisible();
    expect(screen.getByText('PF')).toBeVisible();
    expect(screen.getByText('Professional tax')).toBeVisible();
    expect(screen.getByText('Apr 2026')).toBeVisible();
    expect(screen.getByText('From Jan 2027')).toBeVisible();
    expect(screen.getByText('Scheduled changes')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Change salary' })).toBeVisible();
    expect(screen.getByText(/Payroll uses current registration/)).toBeVisible();
  });
  it('does not label policy failures as organization defaults', () => {
    mocks.policies.isError = true;
    render(<PayrollProfileWorkspace employeeId="staff-1" />);
    expect(screen.getByText(/Unable to resolve policies/)).toBeVisible();
    expect(screen.queryByText('Organization policies')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Change assignment' })).not.toBeInTheDocument();
  });
  it('does not offer mutations with view-only permissions', () => {
    mocks.permissions = [
      { name: 'HR.PayrollManagement.CompensationRevisions.View', isGranted: true },
    ];
    render(<PayrollProfileWorkspace employeeId="staff-1" />);
    expect(screen.queryByRole('link', { name: 'Set up salary' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit details' })).not.toBeInTheDocument();
  });
  it('restores the staff payroll section via a fixed internal return route', () => {
    const route = new URL(staffPayrollProfileHref('staff-1'), 'https://example.test');
    expect(route.searchParams.get('employee')).toBe('staff-1');
    expect(route.searchParams.get('infoTab')).toBe('payroll');
    expect(route.searchParams.get('tab')).toBe('personalInformation');
  });
});

describe('profile details editing', () => {
  it('submits only changed groups, preserving legacy identifiers and salary data', async () => {
    const close = vi.fn();
    render(
      <PayrollProfileDetailsEditor
        employeeId="staff-1"
        initialValues={initialDetails}
        onClose={close}
      />
    );
    fireEvent.change(screen.getByLabelText('Bank name *'), { target: { value: 'Updated bank' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save details' }));
    await waitFor(() => expect(close).toHaveBeenCalled());
    expect(mocks.save).toHaveBeenCalledWith({
      employeeId: 'staff-1',
      body: { bankDetails: { ...initialDetails.bankDetails, bankName: 'Updated bank' } },
    });
  });
  it('keeps edits open when the server rejects the save', async () => {
    const close = vi.fn();
    mocks.save.mockReturnValue({
      unwrap: async () => {
        throw Object.assign(new Error('Unable to save details.'), {
          data: { detail: 'Unable to save details.' },
        });
      },
    });
    render(
      <PayrollProfileDetailsEditor
        employeeId="staff-1"
        initialValues={initialDetails}
        onClose={close}
      />
    );
    fireEvent.change(screen.getByLabelText('Bank name *'), { target: { value: 'Unsaved bank' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save details' }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeVisible());
    expect(close).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Bank name *')).toHaveValue('Unsaved bank');
  });
  it('preserves zero hours and allows clearing identifiers without sending bank details', () => {
    const next = {
      ...initialDetails,
      statutoryIdentifiers: { epfNumber: '', uanNumber: '' },
      attendanceIntegration: { punchId: '', totalWorkingHourPerMonth: 0 },
    };
    expect(changedPayrollProfileGroups(initialDetails, next)).toEqual({
      statutoryIdentifiers: next.statutoryIdentifiers,
      attendanceIntegration: next.attendanceIntegration,
    });
  });
});
