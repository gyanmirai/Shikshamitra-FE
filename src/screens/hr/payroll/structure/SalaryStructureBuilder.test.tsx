import type { FormikProps } from 'formik';

import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { SalaryStructureBuilder } from './SalaryStructureBuilder';

const mocks = vi.hoisted(() => ({
  templatesLoading: false,
  revisionsFetching: false,
  revisions: [] as any[],
  readiness: { canActivate: false, blockerCodes: [] as string[] },
  activate: vi.fn(),
  calculate: vi.fn(),
  saveSalary: vi.fn(),
  refetchReadiness: vi.fn(),
  canManageSalary: true,
  refetchRevisions: vi.fn(),
  canViewEsi: true,
  canManageEsi: true,
  updateEnrollment: vi.fn(),
  enrollment: {
    employeeId: 'employee-1',
    status: 'PendingReview',
    wageCeilingCategory: 'Standard',
    insuranceNumber: '',
    employerShareReliefEligible: false,
  },
}));

vi.mock('react-redux', () => ({ useSelector: () => [], useDispatch: () => vi.fn() }));
vi.mock('src/utils/permissions', () => ({
  hasGrantedPermission: (_permissions: unknown, name: string) => {
    if (name.endsWith('CompensationRevisions.Manage')) return mocks.canManageSalary;
    if (name.endsWith('StatutorySchemes.View')) return mocks.canViewEsi;
    if (name.endsWith('StatutorySchemes.ManageEnrollment')) return mocks.canManageEsi;
    return true;
  },
}));
vi.mock('src/redux/hr/statutory-scheme-api', () => ({
  useGetEsiEnrollmentQuery: () => ({ currentData: mocks.enrollment, isFetching: false }),
  useGetEsiOverridesQuery: () => ({}),
  useUpdateEsiEnrollmentMutation: () => [mocks.updateEnrollment, { isLoading: false }],
}));
// Icon assets are unrelated to salary form behavior and must not start network requests.
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

vi.mock('src/redux/PF/PFApi', () => ({
  useGetPFQuery: () => ({ data: { items: [] }, isError: false }),
}));
vi.mock('src/redux/hr/employeeApi', () => ({
  useUpdateEmployeeStatusMutation: () => [mocks.activate, { isLoading: false }],
}));
vi.mock('src/redux/hr/salary-template-api', () => ({
  useGetActiveSalaryTemplatesQuery: () => ({
    data: {
      items: [
        {
          id: 'template-default',
          name: 'School Default',
          isDefault: true,
          editableVersion: {
            id: 'version-default',
            versionNumber: 1,
            defaultSalaryBasis: 'EMPLOYER_COST',
            defaultProtectionPolicy: 'PROTECT_EMPLOYER_COST',
            defaultPfApplicable: false,
            defaultPfRuleId: null,
            rules: [
              {
                componentId: 'basic',
                componentName: 'Basic',
                semanticType: 'BASIC',
                formulaType: 'FIXED',
                value: 5000,
              },
            ],
          },
        },
        {
          id: 'template-saved',
          name: 'Saved Template',
          isDefault: false,
          editableVersion: {
            id: 'version-saved',
            versionNumber: 4,
            defaultSalaryBasis: 'GROSS',
            defaultProtectionPolicy: 'PROTECT_GROSS',
            defaultPfApplicable: false,
            defaultPfRuleId: null,
            rules: [],
          },
        },
      ],
    },
    isLoading: mocks.templatesLoading,
    isError: false,
  }),
  useCalculateSalaryTemplateMutation: () => [mocks.calculate, { isLoading: false }],
}));
vi.mock('src/redux/hr/compensation-revision-api', () => ({
  useGetCompensationRevisionsQuery: () => ({
    isFetching: mocks.revisionsFetching,
    data: { items: mocks.revisions },
    refetch: mocks.refetchRevisions,
    isLoading: false,
    isError: false,
  }),
  useSaveEmployeeCompensationMutation: () => [mocks.saveSalary, { isLoading: false }],
  useGetEmployeeActivationReadinessQuery: () => ({
    data: mocks.readiness,
    refetch: mocks.refetchReadiness,
  }),
}));

const theme = createTheme(defaultSettings);
const formik = {
  values: { quotedMonthlyAmount: null },
  setFieldValue: vi.fn(),
} as unknown as FormikProps<any>;

const renderBuilder = (props: Partial<React.ComponentProps<typeof SalaryStructureBuilder>> = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <SalaryStructureBuilder
        formik={formik}
        employeeId="employee-1"
        dateOfJoining="2026-11-18"
        {...props}
      />
    </ThemeProvider>
  );

describe('SalaryStructureBuilder initialization and activation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.revisions = [];
    mocks.revisionsFetching = false;
    mocks.canManageSalary = true;
    mocks.refetchRevisions.mockResolvedValue({});
    mocks.calculate.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        grossSalary: 10000,
        totalDeductions: 100,
        netSalary: 9900,
        employerCost: 10100,
        earnings: [],
        deductions: [],
        employerContributions: [],
        warnings: [],
        employeeStateInsurance: { canCalculate: true, issueCodes: [] },
        targetResult: { isExact: true, difference: 0 },
      }),
    });
    mocks.saveSalary.mockReturnValue({ unwrap: vi.fn().mockResolvedValue({ revisionNumber: 1 }) });
    mocks.readiness = { canActivate: false, blockerCodes: [] };
    mocks.activate.mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) });
    mocks.refetchReadiness.mockResolvedValue({});
    mocks.canViewEsi = true;
    mocks.canManageEsi = true;
    mocks.updateEnrollment.mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) });
  });

  it('preselects the school default template and joining month for a new salary setup', async () => {
    renderBuilder();

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Salary template' })).toHaveTextContent(
        'School Default'
      );
      expect(screen.getByLabelText('Effective month')).toHaveValue('2026-11');
    });
  });

  it('renders staff identity with ESIC access in the editor header', () => {
    renderBuilder({
      formik: {
        values: { fullName: 'Test Staff', employeeIdentifier: 'STAFF001' },
      } as FormikProps<any>,
    });
    expect(screen.getByText('Test Staff · STAFF001')).toBeVisible();
    expect(screen.getByRole('button', { name: 'ESIC details' })).toBeVisible();
  });

  it('keeps the PF label, description and keyboard toggle accessible without help changing the draft', async () => {
    const user = userEvent.setup();
    renderBuilder();
    const pfSwitch = screen.getByRole('switch', { name: 'PF enrollment' });
    expect(pfSwitch).toHaveAccessibleDescription('Deduct Provident Fund for this employee');
    expect(screen.getByRole('combobox', { name: 'PF rule' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );

    await user.click(screen.getByText('PF enrollment', { exact: true }));
    expect(pfSwitch).toBeChecked();
    expect(screen.getByRole('combobox', { name: 'PF rule' })).not.toHaveAttribute(
      'aria-disabled',
      'true'
    );
    await user.click(screen.getByRole('button', { name: 'About PF applicability' }));
    expect(pfSwitch).toBeChecked();
    await user.click(pfSwitch);
    await user.keyboard(' ');
    expect(pfSwitch).toBeChecked();
    expect(mocks.calculate).not.toHaveBeenCalled();
    expect(mocks.saveSalary).not.toHaveBeenCalled();
  });

  it('preserves formatted decimal and large amounts in calculation and save payloads', async () => {
    const user = userEvent.setup();
    const calculation = await mocks.calculate().unwrap();
    mocks.calculate.mockClear();
    mocks.calculate.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ ...calculation, employerCost: 12345678.25 }),
    });
    renderBuilder();
    const amount = screen.getByLabelText('Monthly cost to school (CTC)');
    await user.type(amount, '12345678.25');
    expect(amount).toHaveValue('₹ 1,23,45,678.25');
    await user.click(screen.getByRole('button', { name: 'Calculate salary' }));
    expect(mocks.calculate).toHaveBeenCalledWith(
      expect.objectContaining({ monthlyAmount: 12345678.25 })
    );
    expect(screen.getByRole('status')).toHaveTextContent('Ready to save');
    expect(screen.getByText('₹1,23,45,678.25')).toBeVisible();
    expect(screen.getAllByText(/Annual equivalent:/)).toHaveLength(4);
    await user.click(screen.getByRole('button', { name: 'Save salary' }));
    expect(mocks.saveSalary).toHaveBeenCalledWith(
      expect.objectContaining({ body: expect.objectContaining({ monthlyAmount: 12345678.25 }) })
    );
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Saved'));
    await user.clear(amount);
    await user.type(amount, '74200.50');
    expect(amount).toHaveValue('₹ 74,200.50');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    expect(screen.getByRole('button', { name: 'Save salary' })).toBeDisabled();
  });

  it('shows amount errors after blur and keeps invalid values out of calculations', async () => {
    const user = userEvent.setup();
    renderBuilder();
    const amount = screen.getByLabelText('Monthly cost to school (CTC)');
    expect(amount).not.toHaveAttribute('aria-invalid', 'true');
    await user.type(amount, '-100.25');
    await user.tab();
    expect(amount).toHaveAttribute('aria-invalid', 'true');
    expect(amount).toHaveAccessibleDescription('Enter an amount greater than zero.');
    expect(screen.getByRole('button', { name: 'Calculate salary' })).toBeDisabled();
    expect(mocks.calculate).not.toHaveBeenCalled();
    await user.clear(amount);
    await user.type(amount, '10000');
    expect(amount).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByRole('button', { name: 'Calculate salary' })).toBeEnabled();
  });

  it('focuses the missing customization reason and preserves the draft', async () => {
    const user = userEvent.setup();
    renderBuilder();
    await user.type(screen.getByLabelText('Monthly cost to school (CTC)'), '10000');
    await user.click(screen.getByRole('button', { name: 'Customize' }));
    await user.clear(screen.getByLabelText('Value'));
    await user.type(screen.getByLabelText('Value'), '6000');
    await user.click(screen.getByRole('button', { name: 'Calculate salary' }));
    await user.click(screen.getByRole('button', { name: 'Save salary' }));
    const reason = screen.getByLabelText(/Customization reason/);
    expect(reason).toHaveFocus();
    expect(reason).toHaveAttribute('aria-invalid', 'true');
    expect(reason).toHaveAccessibleDescription(
      'Add a reason for the staff-specific salary customization.'
    );
    expect(screen.getByLabelText('Value')).toHaveValue(6000);
    expect(mocks.saveSalary).not.toHaveBeenCalled();
    await user.type(reason, 'Staff salary revision');
    expect(reason).toHaveAttribute('aria-invalid', 'false');
    await user.click(screen.getByRole('button', { name: 'Calculate salary' }));
    await user.click(screen.getByRole('button', { name: 'Save salary' }));
    expect(mocks.saveSalary).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({ customizationReason: 'Staff salary revision' }),
      })
    );
  });

  it('announces calculation and saving until data refresh finishes', async () => {
    const user = userEvent.setup();
    const result = await mocks.calculate().unwrap();
    mocks.calculate.mockClear();
    let finishCalculation!: (value: any) => void;
    let finishRefresh!: () => void;
    mocks.calculate.mockReturnValue({
      unwrap: () =>
        new Promise((resolve) => {
          finishCalculation = resolve;
        }),
    });
    mocks.refetchRevisions.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finishRefresh = resolve;
        })
    );
    renderBuilder();
    await user.type(screen.getByLabelText('Monthly cost to school (CTC)'), '10000');
    await user.click(screen.getByRole('button', { name: 'Calculate salary' }));
    expect(screen.getByRole('status')).toHaveTextContent('Calculating salary');
    expect(screen.getByLabelText('Monthly cost to school (CTC)')).toBeDisabled();
    await act(async () => finishCalculation(result));
    expect(screen.getByRole('status')).toHaveTextContent('Ready to save');
    await user.click(screen.getByRole('button', { name: 'Save salary' }));
    expect(screen.getByRole('status')).toHaveTextContent('Saving salary');
    expect(screen.getByRole('button', { name: 'Save salary' })).toBeDisabled();
    await act(async () => finishRefresh());
    expect(screen.getByRole('status')).toHaveTextContent('Saved');
  });

  it('waits for an in-flight revision refresh before initializing and retains edits on later refreshes', async () => {
    mocks.revisionsFetching = true;
    mocks.revisions = [
      {
        id: 'revision-current',
        revisionNumber: 1,
        status: 'EFFECTIVE',
        netSalary: 10000,
        isCurrent: true,
        effectiveMonth: '2026-10-01',
        salaryBasis: 'EMPLOYER_COST',
        quotedMonthlyAmount: 10000,
      },
    ];
    const result = renderBuilder();
    expect(screen.queryByLabelText('Monthly cost to school (CTC)')).not.toBeInTheDocument();
    mocks.revisions = [{ ...mocks.revisions[0], quotedMonthlyAmount: 20000 }];
    mocks.revisionsFetching = false;
    const rerender = () =>
      result.rerender(
        <ThemeProvider theme={theme}>
          <SalaryStructureBuilder formik={formik} employeeId="employee-1" />
        </ThemeProvider>
      );
    rerender();
    expect(await screen.findByLabelText('Monthly cost to school (CTC)')).toHaveValue('₹ 20,000');
    const user = userEvent.setup();
    await user.clear(screen.getByLabelText('Monthly cost to school (CTC)'));
    await user.type(screen.getByLabelText('Monthly cost to school (CTC)'), '25000');
    mocks.revisionsFetching = true;
    rerender();
    expect(screen.getByLabelText('Monthly cost to school (CTC)')).toHaveValue('₹ 25,000');
    mocks.revisionsFetching = false;
    mocks.revisions = [{ ...mocks.revisions[0], quotedMonthlyAmount: 30000 }];
    rerender();
    expect(screen.getByLabelText('Monthly cost to school (CTC)')).toHaveValue('₹ 25,000');
  });

  it('saves CTC without contaminating the separate payroll form with partial salary provenance', async () => {
    const user = userEvent.setup();
    mocks.calculate.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        grossSalary: 9685,
        totalDeductions: 73,
        netSalary: 9612,
        employerCost: 10000,
        earnings: [],
        deductions: [],
        employerContributions: [],
        warnings: [],
        employeeStateInsurance: { canCalculate: true, issueCodes: [] },
        targetResult: { isExact: true, difference: 0 },
      }),
    });
    mocks.saveSalary.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        salaryBasis: 'EMPLOYER_COST',
        quotedMonthlyAmount: 10000,
        sourceSalaryTemplateId: 'template-default',
        sourceSalaryTemplateVersionId: 'version-default',
        sourceSalaryTemplateVersion: 1,
        revisionNumber: 1,
        pfRuleId: null,
      }),
    });
    renderBuilder();
    await user.type(screen.getByLabelText('Monthly cost to school (CTC)'), '10000');
    await user.click(screen.getByRole('button', { name: 'Calculate salary' }));
    await user.click(await screen.findByRole('button', { name: 'Save salary' }));
    await waitFor(() => expect(mocks.refetchReadiness).toHaveBeenCalled());
    expect(mocks.saveSalary).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({ salaryBasis: 'EMPLOYER_COST', monthlyAmount: 10000 }),
      })
    );
    expect(formik.setFieldValue).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Save salary' })).toBeDisabled();
  });

  it('requires a fresh calculation after changing an input and reports dirty state', async () => {
    const user = userEvent.setup();
    const onEditorStateChange = vi.fn();
    renderBuilder({ onEditorStateChange });
    await user.type(screen.getByLabelText('Monthly cost to school (CTC)'), '10000');
    await user.click(screen.getByRole('button', { name: 'Calculate salary' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save salary' })).toBeEnabled());
    await user.type(screen.getByLabelText('Monthly cost to school (CTC)'), '1');
    expect(screen.getByRole('button', { name: 'Save salary' })).toBeDisabled();
    expect(screen.getByText('Recalculate to review your changes.')).toBeVisible();
    expect(onEditorStateChange).toHaveBeenLastCalledWith({ dirty: true, busy: false });
  });
  it('retains input and permits retry after calculation failure', async () => {
    mocks.calculate.mockReturnValue({
      unwrap: vi
        .fn()
        .mockRejectedValue({ data: { error: { message: 'Calculation unavailable' } } }),
    });
    const user = userEvent.setup();
    renderBuilder();
    await user.type(screen.getByLabelText('Monthly cost to school (CTC)'), '10000');
    await user.click(screen.getByRole('button', { name: 'Calculate salary' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Calculate salary' })).toBeEnabled()
    );
    expect(screen.getByLabelText('Monthly cost to school (CTC)')).toHaveValue('₹ 10,000');
    expect(screen.getByRole('button', { name: 'Save salary' })).toBeDisabled();
    expect(screen.getByRole('alert')).toBeVisible();
  });
  it('retains the draft after a save failure and resets the baseline only after success', async () => {
    const user = userEvent.setup();
    const onEditorStateChange = vi.fn();
    renderBuilder({ onEditorStateChange });
    await user.type(screen.getByLabelText('Monthly cost to school (CTC)'), '10000');
    await user.click(screen.getByRole('button', { name: 'Calculate salary' }));
    mocks.saveSalary.mockReturnValueOnce({ unwrap: vi.fn().mockRejectedValue({ status: 500 }) });
    await user.click(screen.getByRole('button', { name: 'Save salary' }));
    expect(await screen.findByRole('alert')).toBeVisible();
    expect(onEditorStateChange).toHaveBeenLastCalledWith({ dirty: true, busy: false });
    await user.click(screen.getByRole('button', { name: 'Save salary' }));
    await waitFor(() =>
      expect(onEditorStateChange).toHaveBeenLastCalledWith({ dirty: false, busy: false })
    );
    expect(screen.getByRole('button', { name: 'Save salary' })).toBeDisabled();
    expect(mocks.saveSalary.mock.calls[1][0].body).not.toHaveProperty('earningComponents');
    expect(mocks.saveSalary.mock.calls[1][0].body).not.toHaveProperty('deductionComponents');
  });

  it('requires conflict review and recalculation before retrying', async () => {
    const user = userEvent.setup();
    renderBuilder();
    await user.type(screen.getByLabelText('Monthly cost to school (CTC)'), '10000');
    await user.click(screen.getByRole('button', { name: 'Calculate salary' }));
    mocks.saveSalary.mockReturnValueOnce({ unwrap: vi.fn().mockRejectedValue({ status: 409 }) });
    await user.click(screen.getByRole('button', { name: 'Save salary' }));
    expect(await screen.findByText(/Salary changed in another session/)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save salary' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Reload salary history' }));
    expect(mocks.refetchRevisions).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Save salary' })).toBeDisabled();
    expect(screen.getByLabelText('Monthly cost to school (CTC)')).toHaveValue('₹ 10,000');
  });
  it('does not calculate or save without the compensation Manage permission', () => {
    mocks.canManageSalary = false;
    renderBuilder();
    expect(screen.getByRole('button', { name: 'Calculate salary' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save salary' })).toBeDisabled();
    expect(mocks.calculate).not.toHaveBeenCalled();
  });
  it('blocks saving when the server reports a statutory calculation blocker', async () => {
    const result = await mocks.calculate().unwrap();
    mocks.calculate.mockClear();
    mocks.calculate.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        ...result,
        employeeStateInsurance: { canCalculate: false, issueCodes: ['ESI_RULE_MISSING'] },
      }),
    });
    const user = userEvent.setup();
    renderBuilder();
    await user.type(screen.getByLabelText('Monthly cost to school (CTC)'), '10000');
    await user.click(screen.getByRole('button', { name: 'Calculate salary' }));
    expect(screen.getByRole('button', { name: 'Save salary' })).toBeDisabled();
  });

  it('keeps scheduled revisions in collapsed history until expanded', async () => {
    mocks.revisions = [
      {
        id: 'future',
        revisionNumber: 2,
        status: 'EFFECTIVE',
        effectiveMonth: '2027-01-01T00:00:00Z',
        sourceSalaryTemplateId: 'template-saved',
        salaryBasis: 'GROSS',
        quotedMonthlyAmount: 50000,
        pfRuleId: null,
        overrides: [],
        isCustomized: false,
        isCurrent: false,
        isScheduled: true,
        netSalary: 48000,
      },
    ];
    const user = userEvent.setup();
    renderBuilder();
    const history = screen.getByRole('button', {
      name: /Salary history No effective salary.*1 scheduled/,
    });
    expect(history).toHaveAttribute('aria-expanded', 'false');
    await user.click(history);
    expect(history).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Scheduled')).toBeVisible();
    expect(screen.getByText('Revision 2 - January 2027')).toBeVisible();
  });
  it('reopens the saved immutable revision and offers activation as a separate action', async () => {
    const user = userEvent.setup();
    mocks.revisions = [
      {
        id: 'revision-7',
        revisionNumber: 7,
        status: 'EFFECTIVE',
        effectiveMonth: '2026-10-01T00:00:00.000Z',
        sourceSalaryTemplateId: 'template-saved',
        sourceSalaryTemplateVersion: 4,
        salaryBasis: 'GROSS',
        protectionPolicy: 'PROTECT_GROSS',
        quotedMonthlyAmount: 55_000,
        pfRuleId: null,
        overrides: [],
        customizationReason: null,
        isCustomized: false,
        isCurrent: true,
        isScheduled: false,
        netSalary: 54_800,
      },
    ];
    mocks.readiness = { canActivate: true, blockerCodes: [] };

    renderBuilder();

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Salary template' })).toHaveTextContent(
        'Saved Template'
      );
      expect(screen.getByLabelText('Effective month')).toHaveValue('2026-10');
      expect(screen.getByLabelText('Monthly salary')).toHaveValue('₹ 55,000');
    });

    await user.click(screen.getByRole('button', { name: 'Activate staff' }));

    expect(mocks.activate).toHaveBeenCalledWith({
      id: 'employee-1',
      body: {
        employeeStatusType: 0,
        remarks: 'Activated after payroll setup',
        effectiveDate: null,
      },
    });
  });

  it('lets HR enter ESIC details for an inactive staff before salary setup', async () => {
    const user = userEvent.setup();
    mocks.readiness = { canActivate: false, blockerCodes: ['ESI_INSURANCE_NUMBER_REQUIRED'] };
    renderBuilder();
    expect(screen.queryByRole('button', { name: 'Activate staff' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'ESIC details' }));
    expect(screen.queryByText('Contribution details')).not.toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: /ESIC insurance number/ }), '1234567890');
    await user.click(screen.getByRole('button', { name: 'Save enrollment' }));
    await waitFor(() =>
      expect(mocks.updateEnrollment).toHaveBeenCalledWith({
        employeeId: 'employee-1',
        body: expect.objectContaining({ insuranceNumber: '1234567890' }),
      })
    );
    expect(mocks.refetchReadiness).toHaveBeenCalled();
  });

  it('includes an ESIC-only draft in page navigation protection and clears it after discard', async () => {
    const user = userEvent.setup();
    const onEditorStateChange = vi.fn();
    renderBuilder({ onEditorStateChange });
    await waitFor(() =>
      expect(onEditorStateChange).toHaveBeenLastCalledWith({ dirty: false, busy: false })
    );
    await user.click(screen.getByRole('button', { name: 'ESIC details' }));
    await user.type(screen.getByRole('textbox', { name: /ESIC insurance number/ }), '1234567890');
    expect(onEditorStateChange).toHaveBeenLastCalledWith({ dirty: true, busy: false });
    await user.click(screen.getByRole('button', { name: 'Close staff ESIC details' }));
    await user.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(screen.getByRole('textbox', { name: /ESIC insurance number/ })).toHaveValue(
      '1234567890'
    );
    expect(onEditorStateChange).toHaveBeenLastCalledWith({ dirty: true, busy: false });
    await user.click(screen.getByRole('button', { name: 'Close staff ESIC details' }));
    await user.click(screen.getByRole('button', { name: 'Discard changes' }));
    await waitFor(() =>
      expect(onEditorStateChange).toHaveBeenLastCalledWith({ dirty: false, busy: false })
    );
    expect(mocks.updateEnrollment).not.toHaveBeenCalled();
  });

  it('blocks page navigation during ESIC saves and invalidates the salary calculation afterwards', async () => {
    const user = userEvent.setup();
    const onEditorStateChange = vi.fn();
    let completeSave!: () => void;
    mocks.updateEnrollment.mockReturnValue({
      unwrap: () =>
        new Promise<void>((resolve) => {
          completeSave = resolve;
        }),
    });
    renderBuilder({ onEditorStateChange });
    await user.type(screen.getByRole('textbox', { name: 'Monthly cost to school (CTC)' }), '10000');
    await user.click(screen.getByRole('button', { name: 'Calculate salary' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save salary' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'ESIC details' }));
    await user.type(screen.getByRole('textbox', { name: /ESIC insurance number/ }), '1234567890');
    await user.click(screen.getByRole('button', { name: 'Save enrollment' }));
    expect(onEditorStateChange).toHaveBeenLastCalledWith({ dirty: true, busy: true });
    expect(screen.getByRole('button', { name: 'Close staff ESIC details' })).toBeDisabled();
    await act(async () => completeSave());
    await waitFor(() =>
      expect(onEditorStateChange).toHaveBeenLastCalledWith({ dirty: true, busy: false })
    );
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save salary' })).toBeDisabled());
    expect(mocks.refetchReadiness).toHaveBeenCalled();
  });

  it('preserves entered registration details when saving fails', async () => {
    const user = userEvent.setup();
    mocks.updateEnrollment.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue(new Error('offline')),
    });
    renderBuilder();
    await user.click(screen.getByRole('button', { name: 'ESIC details' }));
    await user.type(screen.getByRole('textbox', { name: /ESIC insurance number/ }), '1234567890');
    await user.click(screen.getByRole('button', { name: 'Save enrollment' }));
    await waitFor(() => expect(mocks.updateEnrollment).toHaveBeenCalled());
    expect(screen.getByRole('textbox', { name: /ESIC insurance number/ })).toHaveValue(
      '1234567890'
    );
    expect(mocks.refetchReadiness).not.toHaveBeenCalled();
  });

  it('does not expose enrollment editing without its permissions', async () => {
    const user = userEvent.setup();
    mocks.canManageEsi = false;
    renderBuilder();
    await user.click(screen.getByRole('button', { name: 'ESIC details' }));
    expect(screen.getByRole('textbox', { name: /ESIC insurance number/ })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Save enrollment' })).not.toBeInTheDocument();
  });

  it('does not expose ESIC details without View permission', () => {
    mocks.canViewEsi = false;
    renderBuilder();
    expect(screen.queryByRole('button', { name: 'ESIC details' })).not.toBeInTheDocument();
  });
});

it('keeps form-shaped loading and removes the routine salary banner', () => {
  mocks.templatesLoading = true;
  const result = renderBuilder();
  expect(screen.getByLabelText('Loading staff salary')).toHaveAttribute('aria-busy', 'true');
  expect(screen.getByText('Earnings')).toBeVisible();
  expect(screen.getByText('Deductions')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Calculate salary' })).toBeDisabled();
  mocks.templatesLoading = false;
  result.rerender(
    <ThemeProvider theme={theme}>
      <SalaryStructureBuilder formik={formik} employeeId="employee-1" />
    </ThemeProvider>
  );
  expect(screen.queryByText(/Salary saves immediately/)).not.toBeInTheDocument();
});
