import type { FormikProps } from 'formik';
import type { StaffStatutoryProfile } from 'src/redux/hr/statutory-profile-api';

import { useFormik } from 'formik';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import { SalaryStructureBuilder } from './SalaryStructureBuilder';

vi.mock('src/redux/hr/esi-policy-api', () => ({
  useGetEsiPolicyOptionsQuery: () => ({
    data: [
      {
        id: 'esi-policy-1',
        name: 'Standard ESIC',
        code: 'STANDARD_ESIC',
        isDefault: true,
        isArchived: false,
        versions: [
          {
            id: mocks.esiRuleVersionId,
            version: 1,
            effectiveFrom: '2025-01-01',
            employeePercentage: 0.75,
            employerPercentage: 3.25,
          },
        ],
      },
    ],
    isLoading: false,
    isError: false,
    refetch: () => mocks.refetchSetup(),
  }),
  effectiveEsiPolicyVersion: (policy: any) => policy?.versions[0],
}));

const mocks = vi.hoisted(() => ({
  templatesLoading: false,
  esiRuleVersionId: 'esi-rule-1',
  revisionsFetching: false,
  revisions: [] as any[],
  readiness: { canActivate: false, blockerCodes: [] as string[] },
  activate: vi.fn(),
  calculate: vi.fn(),
  saveSalary: vi.fn(),
  refetchReadiness: vi.fn(),
  refetchSetup: vi.fn(),
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

vi.mock('src/redux/hr/statutory-profile-api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('src/redux/hr/statutory-profile-api')>();
  return {
    ...actual,
    useGetStaffStatutoryProfileQuery: () => ({
      currentData: {
        employeeId: 'employee-1',
        effectiveMonth: '2026-10',
        concurrencyStamp: 'profile-stamp',
        canViewPf: true,
        canViewEsic: mocks.canViewEsi,
        canManagePf: mocks.canManageSalary,
        canManageEsic: mocks.canManageEsi,
        profile: {
          ...actual.emptyStatutoryProfile,
          pfNumber: '7',
          esicInsuranceNumber: mocks.enrollment.insuranceNumber,
          versionId: mocks.revisions.length ? 'existing-profile' : null,
        },
        warnings: [],
        history: [],
      },
      isLoading: false,
    }),
    useSaveStaffStatutoryProfileMutation: () => [vi.fn(), { isLoading: false }],
  };
});

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
  useGetPFQuery: () => ({
    data: { items: [{ id: 'pf-rule', name: 'School PF', isActive: true }] },
    isError: false,
    refetch: () => mocks.refetchSetup(),
  }),
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
            defaultEsiManagementMode: 'IN_PLATFORM' as const,
            defaultEsiPolicyId: 'esi-policy-1',
            rules: [
              {
                componentId: 'basic',
                componentName: 'Basic',
                semanticType: 'BASIC',
                formulaType: 'FIXED_AMOUNT',
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
            defaultEsiManagementMode: 'IN_PLATFORM' as const,
            defaultEsiPolicyId: 'esi-policy-1',
            rules: [],
          },
        },
      ],
    },
    isLoading: mocks.templatesLoading,
    isError: false,
    refetch: () => mocks.refetchSetup(),
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

function OnboardingBuilder({ onSalaryChange }: { onSalaryChange: (value: any) => void }) {
  const statutoryForm = useFormik<StaffStatutoryProfile>({
    initialValues: {
      applyPf: true,
      applyEsic: true,
      pfNumber: '',
      uanNumber: '',
      esicInsuranceNumber: '',
      pfDisabledReason: '',
      esicDisabledReason: '',
    },
    onSubmit: () => {},
  });
  return (
    <SalaryStructureBuilder
      formik={formik}
      dateOfJoining="2026-11-18"
      initialMonth="2026-11"
      onboarding={{ statutoryForm, onSalaryChange }}
    />
  );
}

describe('SalaryStructureBuilder initialization and activation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.esiRuleVersionId = 'esi-rule-1';
    mocks.revisions = [];
    mocks.revisionsFetching = false;
    mocks.canManageSalary = true;
    mocks.refetchRevisions.mockResolvedValue({});
    mocks.refetchSetup.mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) });
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
        employeeStateInsurance: { ruleId: 'esi-rule-1', canCalculate: true, issueCodes: [] },
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

  it('prepares onboarding salary before an employee exists without saving or activating', async () => {
    const onSalaryChange = vi.fn();
    render(
      <ThemeProvider theme={theme}>
        <OnboardingBuilder onSalaryChange={onSalaryChange} />
      </ThemeProvider>
    );
    await waitFor(() => expect(screen.getByLabelText('Effective month')).toHaveValue('2026-11'));
    expect(screen.getByLabelText('Effective month')).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Save salary' })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Monthly cost to school (CTC)'), {
      target: { value: '18000' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Preview salary' }));
    await waitFor(() =>
      expect(onSalaryChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          monthlyAmount: 18000,
          templateVersionId: 'version-default',
          effectiveMonth: '2026-11-01T00:00:00.000Z',
        })
      )
    );
    expect(mocks.calculate).toHaveBeenCalledWith(
      expect.objectContaining({
        employeeId: null,
        statutoryProfileOverride: expect.objectContaining({ applyPf: true, applyEsic: true }),
      })
    );
    expect(mocks.saveSalary).not.toHaveBeenCalled();
    expect(mocks.activate).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Monthly cost to school (CTC)'), {
      target: { value: '0' },
    });
    await waitFor(() => expect(onSalaryChange).toHaveBeenLastCalledWith(null));
    expect(screen.getByRole('button', { name: /preview/i })).toBeDisabled();
  });

  it('requires the existing explicit PF enrollment choice for onboarding above the threshold', async () => {
    const onSalaryChange = vi.fn();
    render(
      <ThemeProvider theme={theme}>
        <OnboardingBuilder onSalaryChange={onSalaryChange} />
      </ThemeProvider>
    );
    await waitFor(() => expect(screen.getByLabelText('Effective month')).toHaveValue('2026-11'));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Amount basis' }));
    fireEvent.click(screen.getByRole('option', { name: 'Monthly salary' }));
    fireEvent.change(screen.getByLabelText('Monthly salary'), { target: { value: '50000' } });
    await waitFor(() =>
      expect(screen.getByRole('radio', { name: 'Opt in to PF' })).toBeInTheDocument()
    );
    expect(onSalaryChange).toHaveBeenLastCalledWith(null);
    expect(screen.getByRole('button', { name: 'Preview salary' })).toBeDisabled();
    fireEvent.click(screen.getByRole('radio', { name: 'Opt in to PF' }));
    fireEvent.click(screen.getByRole('button', { name: 'Preview salary' }));
    await waitFor(() =>
      expect(onSalaryChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ monthlyAmount: 50000 })
      )
    );
  });

  it('keeps onboarding input after a preview failure and permits retry', async () => {
    const onSalaryChange = vi.fn();
    mocks.calculate.mockReturnValueOnce({
      unwrap: vi
        .fn()
        .mockRejectedValue({ status: 500, data: { detail: 'Synthetic preview failure' } }),
    });
    render(
      <ThemeProvider theme={theme}>
        <OnboardingBuilder onSalaryChange={onSalaryChange} />
      </ThemeProvider>
    );
    await waitFor(() => expect(screen.getByLabelText('Effective month')).toHaveValue('2026-11'));
    fireEvent.change(screen.getByLabelText('Monthly cost to school (CTC)'), {
      target: { value: '18000' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Preview salary' }));
    await waitFor(() => expect(screen.getByText('Synthetic preview failure')).toBeInTheDocument());
    expect(onSalaryChange).toHaveBeenLastCalledWith(null);
    expect(screen.getByLabelText('Monthly cost to school (CTC)')).toHaveValue('₹ 18,000');
    fireEvent.click(screen.getByRole('button', { name: 'Preview salary' }));
    await waitFor(() =>
      expect(onSalaryChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ monthlyAmount: 18000 })
      )
    );
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

  it('retains salary and statutory edits through setup refresh failure and retry without saving', async () => {
    renderBuilder({ initialMonth: '2026-11' });
    fireEvent.change(screen.getByLabelText('Monthly cost to school (CTC)'), {
      target: { value: '18000' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'PF registration details' }));
    fireEvent.change(screen.getByLabelText('PF number'), { target: { value: 'SYNTHETIC-DRAFT' } });
    mocks.refetchSetup.mockReturnValueOnce({
      unwrap: vi.fn().mockRejectedValue(new Error('synthetic')),
    });
    fireEvent.click(screen.getByRole('button', { name: 'Refresh setup' }));
    await waitFor(() =>
      expect(screen.getByText(/Setup could not be refreshed/)).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', { name: 'Refresh setup' }));
    await waitFor(() => expect(screen.getByText(/Setup refreshed/)).toBeInTheDocument());
    expect(
      (screen.getByLabelText('Monthly cost to school (CTC)') as HTMLInputElement).value
    ).toContain('18,000');
    expect(screen.getByLabelText('Effective month')).toHaveValue('2026-11');
    expect(screen.getByLabelText('PF number')).toHaveValue('SYNTHETIC-DRAFT');
    expect(mocks.refetchSetup).toHaveBeenCalledTimes(6);
    expect(mocks.calculate).not.toHaveBeenCalled();
    expect(mocks.saveSalary).not.toHaveBeenCalled();
    expect(mocks.refetchRevisions).not.toHaveBeenCalled();
  });

  it('confirms month changes before discarding statutory edits and keeps other salary inputs', async () => {
    const user = userEvent.setup();
    renderBuilder({ initialMonth: '2026-11' });
    fireEvent.change(screen.getByLabelText('Monthly cost to school (CTC)'), {
      target: { value: '18000' },
    });
    await user.click(screen.getByRole('button', { name: 'PF registration details' }));
    fireEvent.change(screen.getByLabelText('PF number'), { target: { value: 'GJ/DRAFT/333' } });
    fireEvent.change(screen.getByLabelText('Effective month'), { target: { value: '2026-12' } });
    expect(screen.getByLabelText('Effective month')).toHaveValue('2026-11');
    await user.click(screen.getByRole('button', { name: 'Keep current month' }));
    expect(screen.getByLabelText('PF number')).toHaveValue('GJ/DRAFT/333');
    fireEvent.change(screen.getByLabelText('Effective month'), { target: { value: '2026-12' } });
    await user.click(screen.getByRole('button', { name: 'Change month' }));
    expect(screen.getByLabelText('Effective month')).toHaveValue('2026-12');
    expect(screen.getByLabelText('Monthly cost to school (CTC)')).toHaveValue('₹ 18,000');
    await user.click(screen.getByRole('button', { name: 'PF registration details' }));
    expect(screen.getByLabelText('PF number')).toHaveValue('7');
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

  it('offers explicit, accessible PF opt-in and opt-out choices above the gross ceiling', async () => {
    const user = userEvent.setup();
    renderBuilder();
    await user.click(screen.getByRole('combobox', { name: 'Amount basis' }));
    await user.click(screen.getByRole('option', { name: 'Monthly salary' }));
    await user.type(screen.getByLabelText('Monthly salary'), '30000');
    const choices = screen.getByRole('radiogroup', { name: 'PF enrollment' });
    expect(choices).toHaveAccessibleDescription(
      'Above ₹25,000 gross salary, choose whether to enroll in PF.'
    );
    const optIn = screen.getByRole('radio', { name: 'Opt in to PF' });
    const optOut = screen.getByRole('radio', { name: 'Opt out of PF' });
    expect(optIn).not.toBeChecked();
    expect(optOut).not.toBeChecked();
    expect(screen.getByRole('button', { name: /Preview salary|Refresh preview/ })).toBeDisabled();
    expect(screen.getByRole('combobox', { name: 'PF rule' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );

    await user.click(optIn);
    expect(optIn).toBeChecked();
    expect(screen.getByRole('combobox', { name: 'PF rule' })).not.toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(optIn).toBeChecked();
    await user.click(optOut);
    expect(optOut).toBeChecked();
    await user.keyboard('{ArrowLeft}');
    expect(optIn).toBeChecked();
    expect(mocks.calculate).not.toHaveBeenCalled();
    expect(mocks.saveSalary).not.toHaveBeenCalled();
  });

  it.each(['24999', '25000'])('requires PF automatically at gross salary %s', async (amount) => {
    const user = userEvent.setup();
    renderBuilder();
    await user.click(screen.getByRole('combobox', { name: 'Amount basis' }));
    await user.click(screen.getByRole('option', { name: 'Monthly salary' }));
    await user.type(screen.getByLabelText('Monthly salary'), amount);
    expect(screen.getByText('Required by default up to ₹25,000 gross salary.')).toBeVisible();
    expect(screen.queryByRole('radio', { name: 'Opt out of PF' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    expect(mocks.calculate).toHaveBeenCalledWith(
      expect.objectContaining({
        monthlyAmount: Number(amount),
        pfApplicable: true,
        pfRuleId: 'pf-rule',
        esiManagementMode: 'IN_PLATFORM' as const,
        esiPolicyId: 'esi-policy-1',
      })
    );
  });

  it('requires an explicit choice when salary increases from mandatory to optional', async () => {
    const user = userEvent.setup();
    renderBuilder();
    await user.click(screen.getByRole('combobox', { name: 'Amount basis' }));
    await user.click(screen.getByRole('option', { name: 'Monthly salary' }));
    const amount = screen.getByLabelText('Monthly salary');
    await user.type(amount, '25000');
    await user.clear(amount);
    await user.type(amount, '25001');
    expect(screen.getByRole('radio', { name: 'Opt in to PF' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Opt out of PF' })).not.toBeChecked();
    expect(screen.getByRole('button', { name: /Preview salary|Refresh preview/ })).toBeDisabled();
    await user.click(screen.getByRole('radio', { name: 'Opt out of PF' }));
    await user.click(screen.getByLabelText('Reason for turning PF off'));
    await user.paste('Employee selected opt-out');
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    expect(mocks.calculate).toHaveBeenCalledWith(
      expect.objectContaining({ monthlyAmount: 25001, pfApplicable: false, pfRuleId: null })
    );
  });

  it('uses calculated gross for CTC even when the quoted employer cost is above the ceiling', async () => {
    const user = userEvent.setup();
    const calculation = await mocks.calculate().unwrap();
    mocks.calculate.mockClear();
    mocks.calculate.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        ...calculation,
        grossSalary: 24500,
        employerCost: 26000,
        pfEligibility: {
          grossSalary: 24500,
          wages: 14700,
          coverageCeiling: 25000,
          status: 'MANDATORY',
          enrollmentRequired: true,
          canSave: true,
        },
      }),
    });
    renderBuilder();
    await user.type(screen.getByLabelText('Monthly cost to school (CTC)'), '26000');
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    expect(
      await screen.findByText('Required by default up to ₹25,000 gross salary.')
    ).toBeVisible();
    expect(screen.queryByRole('radio', { name: 'Opt out of PF' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save salary' })).toBeEnabled();
  });

  it('requires a voluntary choice after calculating an undecided CTC salary', async () => {
    const user = userEvent.setup();
    const calculation = await mocks.calculate().unwrap();
    mocks.calculate.mockClear();
    mocks.calculate.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        ...calculation,
        grossSalary: 30000,
        employerCost: 30000,
        pfEligibility: {
          grossSalary: 30000,
          wages: 18000,
          coverageCeiling: 25000,
          status: 'VOLUNTARY',
          enrollmentRequired: false,
          canSave: true,
        },
      }),
    });
    renderBuilder();
    await user.type(screen.getByLabelText('Monthly cost to school (CTC)'), '30000');
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    expect(await screen.findByText('Choose whether to opt in or opt out of PF')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save salary' })).toBeDisabled();
    await user.click(screen.getByRole('radio', { name: 'Opt out of PF' }));
    await user.click(screen.getByLabelText('Reason for turning PF off'));
    await user.paste('Employee selected opt-out');
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    expect(screen.getByRole('button', { name: 'Save salary' })).toBeEnabled();
    expect(mocks.calculate).toHaveBeenLastCalledWith(
      expect.objectContaining({ pfApplicable: false, pfRuleId: null })
    );
  });

  it('allows voluntary consent when an earlier PF rule never established membership', async () => {
    const user = userEvent.setup();
    mocks.revisions = [
      {
        id: 'pending-pf-revision',
        revisionNumber: 1,
        status: 'EFFECTIVE',
        effectiveMonth: '2026-10-01T00:00:00.000Z',
        sourceSalaryTemplateId: 'template-saved',
        salaryBasis: 'GROSS',
        quotedMonthlyAmount: 15000,
        pfRuleId: 'pf-rule',
        esiManagementMode: 'IN_PLATFORM' as const,
        esiPolicyId: 'esi-policy-1',
        pfEnrollment: { membership: 'NOT_MEMBER' },
        warnings: ['PF_NUMBER_MISSING'],
        overrides: [],
        isCurrent: true,
      },
    ];
    const calculation = await mocks.calculate().unwrap();
    mocks.calculate.mockClear();
    mocks.calculate.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        ...calculation,
        grossSalary: 30000,
        pfEligibility: {
          grossSalary: 30000,
          wages: 18000,
          coverageCeiling: 25000,
          status: 'VOLUNTARY',
          enrollmentRequired: false,
          canSave: false,
          issueCode: 'PF_CONSENT_REQUIRED',
        },
      }),
    });
    renderBuilder();
    const amount = await screen.findByLabelText('Monthly salary');
    await user.clear(amount);
    await user.type(amount, '30000');
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    const consent = await screen.findByLabelText('Employee consent reference');
    await user.click(consent);
    await user.paste('Approved voluntary enrollment');
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    expect(mocks.calculate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        pfEnrollment: {
          membership: 'NOT_MEMBER',
          consentReference: 'Approved voluntary enrollment',
        },
      })
    );
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
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    expect(mocks.calculate).toHaveBeenCalledWith(
      expect.objectContaining({ monthlyAmount: 12345678.25 })
    );
    expect(screen.getByRole('status')).toHaveTextContent('Preview ready');
    expect(screen.getByText('₹1,23,45,678.25')).toBeVisible();
    expect(screen.getByText('Monthly cost to school')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Save salary' }));
    expect(mocks.saveSalary).toHaveBeenCalledWith(
      expect.objectContaining({ body: expect.objectContaining({ monthlyAmount: 12345678.25 }) })
    );
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Saved'));
    await user.clear(amount);
    await user.type(amount, '74200.50');
    expect(amount).toHaveValue('₹ 74,200.50');
    expect(screen.getByRole('status')).toHaveTextContent('Preview needs refresh');
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
    expect(screen.getByRole('button', { name: /Preview salary|Refresh preview/ })).toBeDisabled();
    expect(mocks.calculate).not.toHaveBeenCalled();
    await user.clear(amount);
    await user.type(amount, '10000');
    expect(amount).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByRole('button', { name: /Preview salary|Refresh preview/ })).toBeEnabled();
  });

  it('focuses the missing customization reason and preserves the draft', async () => {
    const user = userEvent.setup();
    renderBuilder();
    await user.click(screen.getByLabelText('Monthly cost to school (CTC)'));
    await user.paste('10000');
    await user.click(screen.getByRole('button', { name: 'Staff-specific customization' }));
    await user.click(screen.getByRole('button', { name: 'Customize' }));
    await user.clear(screen.getByLabelText('Value'));
    await user.paste('6000');
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    await user.click(screen.getByRole('button', { name: 'Save salary' }));
    const reason = screen.getByLabelText(/Customization reason/);
    expect(reason).toHaveFocus();
    expect(reason).toHaveAttribute('aria-invalid', 'true');
    expect(reason).toHaveAccessibleDescription(
      'Add a reason for the staff-specific salary customization.'
    );
    expect(screen.getByLabelText('Value')).toHaveValue(6000);
    expect(mocks.saveSalary).not.toHaveBeenCalled();
    await user.paste('Staff salary revision');
    expect(reason).toHaveAttribute('aria-invalid', 'false');
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
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
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    expect(screen.getByRole('status')).toHaveTextContent('Preparing preview');
    expect(screen.getByLabelText('Monthly cost to school (CTC)')).toBeDisabled();
    await act(async () => finishCalculation(result));
    expect(screen.getByRole('status')).toHaveTextContent('Preview ready');
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
        employeeStateInsurance: { ruleId: 'esi-rule-1', canCalculate: true, issueCodes: [] },
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
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
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
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save salary' })).toBeEnabled());
    await user.type(screen.getByLabelText('Monthly cost to school (CTC)'), '1');
    expect(screen.getByRole('button', { name: 'Save salary' })).toBeDisabled();
    expect(screen.getByText('Your changes need a new preview.')).toBeVisible();
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
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Preview salary|Refresh preview/ })).toBeEnabled()
    );
    expect(screen.getByLabelText('Monthly cost to school (CTC)')).toHaveValue('₹ 10,000');
    expect(screen.getByRole('button', { name: 'Save salary' })).toBeDisabled();
    expect(
      screen
        .getAllByRole('alert')
        .find((alert) =>
          /calculation failed|save failed|retry|could not|failed|unavailable/i.test(
            alert.textContent ?? ''
          )
        )!
    ).toBeVisible();
  });
  it('retains the draft after a save failure and resets the baseline only after success', async () => {
    const user = userEvent.setup();
    const onEditorStateChange = vi.fn();
    renderBuilder({ onEditorStateChange });
    await user.type(screen.getByLabelText('Monthly cost to school (CTC)'), '10000');
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    mocks.saveSalary.mockReturnValueOnce({ unwrap: vi.fn().mockRejectedValue({ status: 500 }) });
    await user.click(screen.getByRole('button', { name: 'Save salary' }));
    await waitFor(() =>
      expect(
        screen
          .getAllByRole('alert')
          .some((alert) => /error|failed|wrong/i.test(alert.textContent ?? ''))
      ).toBe(true)
    );
    expect(onEditorStateChange).toHaveBeenLastCalledWith({ dirty: true, busy: false });
    await user.click(screen.getByRole('button', { name: 'Save salary' }));
    await waitFor(() =>
      expect(onEditorStateChange).toHaveBeenLastCalledWith({ dirty: false, busy: false })
    );
    expect(screen.getByRole('button', { name: 'Save salary' })).toBeDisabled();
    expect(mocks.saveSalary.mock.calls[1][0].body).not.toHaveProperty('earningComponents');
    expect(mocks.saveSalary.mock.calls[1][0].body).not.toHaveProperty('deductionComponents');
  });

  it('invalidates the preview when the catalogue resolves a different ESIC version', async () => {
    const user = userEvent.setup();
    const view = renderBuilder();
    await user.type(screen.getByLabelText('Monthly cost to school (CTC)'), '10000');
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    expect(screen.getByRole('button', { name: 'Save salary' })).toBeEnabled();
    mocks.esiRuleVersionId = 'esi-rule-2';
    view.rerender(
      <ThemeProvider theme={theme}>
        <SalaryStructureBuilder
          formik={formik}
          employeeId="employee-1"
          dateOfJoining="2026-11-18"
        />
      </ThemeProvider>
    );
    expect(screen.getByRole('button', { name: 'Save salary' })).toBeDisabled();
    expect(screen.getByText('Your changes need a new preview.')).toBeVisible();
  });

  it('requires a refreshed preview after the server rejects a changed ESIC version', async () => {
    const user = userEvent.setup();
    renderBuilder();
    await user.type(screen.getByLabelText('Monthly cost to school (CTC)'), '10000');
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    mocks.saveSalary.mockReturnValueOnce({
      unwrap: vi.fn().mockRejectedValue({
        status: 409,
        data: { errorCode: 'HR:Payroll:CompensationPreviewStale' },
      }),
    });
    await user.click(screen.getByRole('button', { name: 'Save salary' }));
    expect(mocks.saveSalary).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({ expectedEsiPolicyVersionId: 'esi-rule-1' }),
      })
    );
    expect(await screen.findByText(/ESIC policy changed. Refresh preview/)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save salary' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Refresh preview' }));
    expect(screen.getByRole('button', { name: 'Save salary' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Save salary' }));
    expect(mocks.saveSalary).toHaveBeenCalledTimes(2);
  });

  it('requires conflict review and recalculation before retrying', async () => {
    const user = userEvent.setup();
    renderBuilder();
    await user.type(screen.getByLabelText('Monthly cost to school (CTC)'), '10000');
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
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
    expect(screen.getByRole('button', { name: /Preview salary|Refresh preview/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save salary' })).toBeDisabled();
    expect(mocks.calculate).not.toHaveBeenCalled();
  });
  it('blocks saving when the server reports a statutory calculation blocker', async () => {
    const result = await mocks.calculate().unwrap();
    mocks.calculate.mockClear();
    mocks.calculate.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        ...result,
        employeeStateInsurance: {
          ruleId: 'esi-rule-1',
          canCalculate: false,
          issueCodes: ['ESI_RULE_MISSING'],
        },
      }),
    });
    const user = userEvent.setup();
    renderBuilder();
    await user.type(screen.getByLabelText('Monthly cost to school (CTC)'), '10000');
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    expect(screen.getByRole('button', { name: 'Save salary' })).toBeDisabled();
  });

  it('allows saving a valid preview while ESIC registration is pending', async () => {
    const result = await mocks.calculate().unwrap();
    mocks.calculate.mockClear();
    mocks.calculate.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        ...result,
        employeeStateInsurance: {
          ruleId: 'esi-rule-1',
          canCalculate: true,
          registrationPending: true,
          issueCodes: ['ESI_NUMBER_MISSING', 'ESI_REGISTRATION_PENDING'],
        },
      }),
    });
    const user = userEvent.setup();
    renderBuilder();
    await user.type(screen.getByLabelText('Monthly cost to school (CTC)'), '10000');
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    expect(screen.getByRole('button', { name: 'Save salary' })).toBeEnabled();
    expect(screen.getByRole('status')).toHaveTextContent('Preview ready');
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

    renderBuilder({ dateOfJoining: '2025-01-01' });

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

  it('saves ESIC registration in the salary transaction for inactive staff', async () => {
    const user = userEvent.setup();
    renderBuilder();
    await user.click(screen.getByRole('button', { name: 'ESIC registration details' }));
    await user.type(screen.getByLabelText('ESIC insurance number'), '1234567890');
    await user.type(screen.getByLabelText('Monthly cost to school (CTC)'), '10000');
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    await user.click(screen.getByRole('button', { name: 'Save salary' }));
    await waitFor(() =>
      expect(mocks.saveSalary).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            statutoryProfileOverride: expect.objectContaining({
              esicInsuranceNumber: '1234567890',
              applyEsic: true,
            }),
            statutoryProfileUpdateEsic: true,
          }),
        })
      )
    );
  });
  it('includes an ESIC-only edit in salary navigation protection', async () => {
    const user = userEvent.setup();
    const onEditorStateChange = vi.fn();
    renderBuilder({ onEditorStateChange });
    await waitFor(() =>
      expect(onEditorStateChange).toHaveBeenLastCalledWith({ dirty: false, busy: false })
    );
    await user.click(screen.getByRole('button', { name: 'ESIC registration details' }));
    await user.type(screen.getByLabelText('ESIC insurance number'), '1234567890');
    await waitFor(() =>
      expect(onEditorStateChange).toHaveBeenLastCalledWith({ dirty: true, busy: false })
    );
  });
  it('guards salary saves containing registration edits and preserves failed drafts', async () => {
    const user = userEvent.setup();
    const onEditorStateChange = vi.fn();
    renderBuilder({ onEditorStateChange });
    await user.click(screen.getByRole('button', { name: 'ESIC registration details' }));
    await user.type(screen.getByLabelText('ESIC insurance number'), '1234567890');
    await user.type(screen.getByLabelText('Monthly cost to school (CTC)'), '10000');
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    let rejectSave!: (reason: unknown) => void;
    mocks.saveSalary.mockReturnValueOnce({
      unwrap: () =>
        new Promise((_, reject) => {
          rejectSave = reject;
        }),
    });
    await user.click(screen.getByRole('button', { name: 'Save salary' }));
    await waitFor(() =>
      expect(onEditorStateChange).toHaveBeenLastCalledWith({ dirty: true, busy: true })
    );
    await act(async () => rejectSave({ status: 500 }));
    expect(screen.getByLabelText('ESIC insurance number')).toHaveValue('1234567890');
    await waitFor(() =>
      expect(onEditorStateChange).toHaveBeenLastCalledWith({ dirty: true, busy: false })
    );
  });
  it('keeps registration fields read-only without the scheme action permission', () => {
    mocks.canManageEsi = false;
    renderBuilder();
    expect(screen.getByLabelText('ESIC insurance number')).toBeDisabled();
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
  expect(screen.getByRole('button', { name: /Preview salary|Refresh preview/ })).toBeDisabled();
  mocks.templatesLoading = false;
  result.rerender(
    <ThemeProvider theme={theme}>
      <SalaryStructureBuilder formik={formik} employeeId="employee-1" />
    </ThemeProvider>
  );
  expect(screen.queryByText(/Salary saves immediately/)).not.toBeInTheDocument();
});
