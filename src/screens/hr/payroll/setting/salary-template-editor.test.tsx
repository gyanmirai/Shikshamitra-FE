import type { SalaryTemplate } from 'src/redux/hr/salary-template-api';

import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';
import {
  HrSetupTaskContext,
  HrSetupEditorContext,
} from 'src/screens/hr/setup/hr-setup-editor-context';

import SalaryTemplateEditor from './salary-template-editor';

vi.mock('src/redux/hr/esi-policy-api', () => ({
  useGetEsiPolicyOptionsQuery: () => ({
    data: mocks.esiEmpty
      ? []
      : [
          {
            id: 'esi-policy-1',
            name: 'Standard ESIC',
            code: 'STANDARD_ESIC',
            isDefault: true,
            isArchived: false,
            versions: [
              {
                version: 1,
                effectiveFrom: '2025-01-01',
                employeePercentage: 0.75,
                employerPercentage: 3.25,
              },
            ],
          },
        ],
    isLoading: false,
    isError: mocks.esiError,
    refetch: mocks.refetchEsi,
  }),
  effectiveEsiPolicyVersion: (policy: any) => policy?.versions[0],
}));

const mocks = vi.hoisted(() => ({
  permissions: new Set(['View', 'Add', 'Edit']),
  updateTemplate: vi.fn(),
  createTemplate: vi.fn(),
  calculate: vi.fn(),
  calculating: false,
  refetch: vi.fn(),
  loading: false,
  catalogLoading: false,
  catalogEmpty: false,
  catalogError: undefined as unknown,
  refetchCatalog: vi.fn(),
  esiEmpty: false,
  esiError: false,
  refetchEsi: vi.fn(),
  failed: false,
  template: {
    id: 'template-1',
    name: 'Flexible Salary',
    description: 'Tenant template',
    status: 'ACTIVE' as 'ACTIVE' | 'NEEDS_SETUP' | 'ARCHIVED',
    isDefault: true,
    activeVersion: 1,
    versionCount: 1,
    updatedAt: '2026-09-15T00:00:00.000Z',
    concurrencyStamp: 'stamp-1',
    editableVersion: {
      id: 'version-1',
      versionNumber: 1,
      status: 'ACTIVE' as const,
      defaultSalaryBasis: 'EMPLOYER_COST' as const,
      defaultProtectionPolicy: 'PROTECT_EMPLOYER_COST' as const,
      defaultPfApplicable: false,
      defaultPfRuleId: null,
      defaultEsiManagementMode: 'IN_PLATFORM' as const,
      defaultEsiPolicyId: 'esi-policy-1',
      rules: [
        {
          code: 'BASIC',
          componentId: 'earning-1',
          lineKind: 'EARNING' as const,
          semanticType: 'BASIC',
          formulaType: 'PERCENTAGE_OF_GROSS',
          value: 60,
          displayOrder: 0,
        },
        {
          code: 'SPECIAL_ALLOWANCE',
          componentId: 'earning-2',
          lineKind: 'EARNING' as const,
          semanticType: 'BALANCING_EARNING',
          formulaType: 'REMAINDER_OF_GROSS',
          value: null,
          displayOrder: 1,
        },
      ],
    },
  } as SalaryTemplate,
}));

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('src/routes/components', () => ({
  RouterLink: ({ children, ...props }: React.ComponentProps<'a'>) => <a {...props}>{children}</a>,
}));

vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: (selector: any) =>
    selector({
      auth: { permissions: [], loading: false, permissionsInitialized: true },
      confirmPopup: { isChanges: false },
    }),
}));
vi.mock('src/utils/permissions', () => ({
  hasGrantedPermission: (_permissions: unknown, permission: string | string[]) =>
    (Array.isArray(permission) ? permission : [permission]).every(
      (name) =>
        name.endsWith('.HR') ||
        ['HR', 'HR.PayrollManagement'].includes(name) ||
        [...mocks.permissions].some((action) => name.endsWith(`.${action}`))
    ),
  hasNavigationPermission: () => true,
}));
// Icon assets are unrelated to salary form behavior and must not start network requests.
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

vi.mock('src/redux/PF/PFApi', () => ({
  useGetPFQuery: () => ({ data: { items: [] }, isError: false }),
}));
vi.mock('src/redux/hr/salary-template-api', () => ({
  useGetSalaryTemplateQuery: (_id: string, options: { skip: boolean }) => ({
    data: options.skip || mocks.loading || mocks.failed ? undefined : mocks.template,
    isLoading: mocks.loading,
    isError: mocks.failed,
    refetch: mocks.refetch,
  }),
  useGetSalaryTemplateVersionsQuery: () => ({
    data: { items: [mocks.template.editableVersion] },
  }),
  useGetSalaryTemplateComponentCatalogQuery: () => ({
    data:
      mocks.catalogLoading || mocks.catalogError
        ? undefined
        : {
            items: mocks.catalogEmpty
              ? []
              : [
                  { componentId: 'earning-1', name: 'Basic Salary', lineKind: 'EARNING' },
                  { componentId: 'earning-2', name: 'Special Allowance', lineKind: 'EARNING' },
                  { componentId: 'deduction-1', name: 'Loan Recovery', lineKind: 'DEDUCTION' },
                ],
          },
    isLoading: mocks.catalogLoading,
    isError: Boolean(mocks.catalogError),
    error: mocks.catalogError,
    refetch: mocks.refetchCatalog,
  }),
  useCreateSalaryTemplateMutation: () => [mocks.createTemplate, { isLoading: false }],
  useUpdateSalaryTemplateMutation: () => [mocks.updateTemplate, { isLoading: false }],
  usePreviewSalaryTemplateMutation: () => [mocks.calculate, { isLoading: mocks.calculating }],
}));

const theme = createTheme(defaultSettings);
const renderEditor = (ui: React.ReactNode) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

const originalTemplate = structuredClone(mocks.template);

describe('SalaryTemplateEditor', () => {
  it('leaves loading navigation to the wizard instead of rendering an inert embedded Cancel action', () => {
    mocks.catalogLoading = true;
    renderEditor(
      <HrSetupEditorContext.Provider value={() => {}}>
        <SalaryTemplateEditor mode="create" onClose={() => {}} />
      </HrSetupEditorContext.Provider>
    );
    expect(screen.getByRole('status', { name: 'Loading salary template' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Create Template' })).toBeNull();
  });

  it('defers automatic picker refresh until a pending preview finishes and invalidates the preview', async () => {
    const user = userEvent.setup();
    const proof = await mocks.calculate().unwrap();
    mocks.calculate.mockClear();
    let finishPreview: (result: unknown) => void = () => {};
    mocks.calculate.mockReturnValueOnce({
      unwrap: () =>
        new Promise((resolve) => {
          finishPreview = resolve;
        }),
    });
    const editor = <SalaryTemplateEditor templateId="template-1" />;
    const view = renderEditor(editor);
    await user.click(screen.getByRole('button', { name: 'Preview salary' }));
    mocks.calculating = true;
    view.rerender(<ThemeProvider theme={theme}>{editor}</ThemeProvider>);
    await user.click(screen.getByRole('button', { name: 'Add Deduction' }));
    expect(screen.queryByRole('button', { name: 'Refresh setup' })).toBeNull();
    expect(mocks.refetchCatalog).not.toHaveBeenCalled();
    mocks.calculating = false;
    await act(async () => finishPreview(proof));
    await waitFor(() => expect(mocks.refetchCatalog).toHaveBeenCalledOnce());
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
    expect(mocks.updateTemplate).not.toHaveBeenCalled();
  });

  it('explains an empty catalogue without exposing component creation to a template editor without Add access', async () => {
    const user = userEvent.setup();
    mocks.permissions = new Set(['View', 'Edit']);
    mocks.catalogEmpty = true;
    renderEditor(<SalaryTemplateEditor templateId="template-1" />);
    await user.click(screen.getByRole('button', { name: 'Add Deduction' }));
    const picker = screen.getByRole('dialog', { name: 'Add Deduction Component' });
    expect(picker).toHaveTextContent('No active deduction components are available.');
    expect(picker).toHaveTextContent('Ask your HR administrator to create the component.');
    expect(screen.queryByRole('link', { name: /Create deduction component/ })).toBeNull();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  it('automatically refreshes the standalone picker without replacing entered values', async () => {
    const user = userEvent.setup();
    mocks.catalogEmpty = true;
    renderEditor(<SalaryTemplateEditor mode="create" />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Template name' }), {
      target: { value: 'Standalone draft' },
    });
    await user.click(screen.getByRole('button', { name: 'Add Deduction' }));
    expect(
      screen.getByRole('link', { name: 'Create deduction component (new tab)' })
    ).toHaveAttribute('href', '/hr/payroll/setting/deduction-component');
    await waitFor(() => expect(mocks.refetchCatalog).toHaveBeenCalledOnce());
    expect(screen.queryByRole('button', { name: 'Refresh setup' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('textbox', { name: 'Template name' })).toHaveValue('Standalone draft');
  });

  it('opens a visible modal picker in setup and preserves the draft on cancel and repeated adds', async () => {
    const user = userEvent.setup();
    renderEditor(
      <HrSetupEditorContext.Provider value={() => {}}>
        <SalaryTemplateEditor mode="create" />
      </HrSetupEditorContext.Provider>
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'Template name' }), {
      target: { value: 'Retained setup draft' },
    });
    await user.click(screen.getByRole('button', { name: 'Add Earning' }));
    expect(screen.getByRole('dialog', { name: /Add earning component/i })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog', { name: /Add earning component/i })).toBeNull();
    expect(screen.getByRole('textbox', { name: 'Template name' })).toHaveValue(
      'Retained setup draft'
    );
    await user.click(screen.getByRole('button', { name: 'Add Deduction' }));
    expect(screen.getByRole('dialog', { name: /Add deduction component/i })).toBeVisible();
    await user.click(screen.getByRole('combobox', { name: 'Payroll component' }));
    await user.click(screen.getByRole('option', { name: 'Loan Recovery' }));
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(screen.getByRole('textbox', { name: 'Loan Recovery amount' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Add Deduction' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/already added/i);
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    expect(mocks.createTemplate).not.toHaveBeenCalled();
  });

  it('does not reuse PF correction targets after an unchanged-input retry succeeds and expires', async () => {
    vi.useFakeTimers();
    try {
      const success = await mocks.calculate().unwrap();
      mocks.calculate.mockClear();
      mocks.calculate
        .mockReturnValueOnce({
          unwrap: vi.fn().mockRejectedValue({
            status: 400,
            data: {
              errorCode: 'HR:Payroll:PfRuleNotEffective',
              detail: 'One or more business rules were violated.',
            },
          }),
        })
        .mockReturnValueOnce({
          unwrap: vi.fn().mockResolvedValue({
            ...success,
            expiresAt: new Date(Date.now() + 1000).toISOString(),
          }),
        });
      renderEditor(<SalaryTemplateEditor templateId="template-1" />);
      await act(async () =>
        fireEvent.click(screen.getByRole('button', { name: 'Preview salary' }))
      );
      expect(screen.getByRole('button', { name: 'Review PF rule' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Review preview month' })).toBeVisible();
      await act(async () =>
        fireEvent.click(screen.getByRole('button', { name: 'Preview salary' }))
      );
      expect(mocks.calculate.mock.calls[1][0]).toEqual(mocks.calculate.mock.calls[0][0]);
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled();
      await act(async () => vi.advanceTimersByTimeAsync(1000));
      expect(
        screen.getByText('The salary preview expired. Refresh preview before saving.')
      ).toBeVisible();
      expect(screen.queryByRole('button', { name: 'Review PF rule' })).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Review preview month' })
      ).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
      expect(mocks.updateTemplate).not.toHaveBeenCalled();
    } finally {
      cleanup();
      vi.useRealTimers();
    }
  });

  it('focuses the visible month control for an ineffective PF rule', async () => {
    const user = userEvent.setup();
    mocks.calculate.mockReturnValueOnce({
      unwrap: vi.fn().mockRejectedValue({
        status: 400,
        data: {
          errorCode: 'HR:Payroll:PfRuleNotEffective',
          detail: 'One or more business rules were violated.',
        },
      }),
    });
    renderEditor(<SalaryTemplateEditor templateId="template-1" />);
    await user.click(screen.getByRole('button', { name: 'Preview salary' }));
    await user.click(await screen.findByRole('button', { name: 'Review preview month' }));
    await waitFor(() => expect(screen.getByRole('spinbutton', { name: 'Month' })).toHaveFocus());
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
  });
  it('explains an impossible employer-cost target, focuses corrections and requires a fresh proof', async () => {
    const user = userEvent.setup();
    mocks.template.editableVersion.rules[0] = {
      ...mocks.template.editableVersion.rules[0],
      formulaType: 'FIXED_AMOUNT',
      value: 2000,
    };
    mocks.template.editableVersion.rules[1] = {
      ...mocks.template.editableVersion.rules[1],
      semanticType: 'ORDINARY',
      formulaType: 'FIXED_AMOUNT',
      value: 50000,
    };
    mocks.calculate.mockReturnValueOnce({
      unwrap: vi.fn().mockRejectedValue({
        status: 400,
        data: {
          errorCode: 'HR:Payroll:CompensationTargetNotSolvable',
          detail: 'One or more business rules were violated.',
          data: { salaryBasis: 'EMPLOYER_COST', target: 50000, fixedEarnings: 52000 },
        },
      }),
    });
    renderEditor(<SalaryTemplateEditor templateId="template-1" />);
    const amount = screen.getByRole('textbox', { name: 'Monthly cost to school (CTC)' });
    fireEvent.change(amount, { target: { value: '50000' } });
    await user.click(screen.getByRole('button', { name: 'Preview salary' }));
    expect(await screen.findByText(/Fixed earnings exceed cost to school/)).toBeVisible();
    expect(screen.getByText(/Employee deductions do not reduce employer cost/)).toBeVisible();
    expect(screen.queryByText('One or more business rules were violated.')).not.toBeInTheDocument();
    expect(amount).toHaveValue('₹ 50,000');
    expect(amount).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Review monthly amount' }));
    await waitFor(() => expect(amount).toHaveFocus());
    await user.click(screen.getByRole('button', { name: 'Review earning rules' }));
    expect(screen.getByRole('button', { name: 'Collapse Basic Salary' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(
      screen.getByRole('combobox', { name: 'Payroll purpose for Basic Salary' })
    ).toBeVisible();
    await waitFor(() =>
      expect(document.getElementById('salary-earnings')).toContainElement(
        document.activeElement as HTMLElement
      )
    );
    fireEvent.change(amount, { target: { value: '52000' } });
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Preview salary' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled());
    expect(mocks.calculate.mock.calls.at(-1)?.[0]).toMatchObject({
      monthlyAmount: 52000,
      salaryBasis: 'EMPLOYER_COST',
    });
    expect(mocks.updateTemplate).not.toHaveBeenCalled();
  });

  it('offers Professional Tax setup only for a draft that requires it', async () => {
    const user = userEvent.setup();
    const openTask = vi.fn();
    mocks.template.editableVersion.rules.push({
      code: 'PT',
      componentId: 'deduction-1',
      lineKind: 'DEDUCTION',
      semanticType: 'PROFESSIONAL_TAX',
      formulaType: 'PROFESSIONAL_TAX',
      value: null,
      displayOrder: 2,
    });
    renderEditor(
      <HrSetupTaskContext.Provider value={openTask}>
        <SalaryTemplateEditor templateId="template-1" />
      </HrSetupTaskContext.Provider>
    );
    expect(openTask).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('button', { name: 'Create required PF rule' })
    ).not.toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: 'Configure required Professional Tax rule' })
    );
    expect(openTask).toHaveBeenCalledWith('professional-tax');
    expect(screen.getByRole('textbox', { name: 'Template name' })).toHaveValue('Flexible Salary');
  });

  it('registers the preview-validated save action with the setup wizard footer', async () => {
    const user = userEvent.setup();
    const report = vi.fn();
    const onSaved = vi.fn();
    renderEditor(
      <HrSetupEditorContext.Provider value={report}>
        <SalaryTemplateEditor templateId="template-1" onSaved={onSaved} />
      </HrSetupEditorContext.Provider>
    );
    expect(report.mock.calls.at(-1)?.[0].save).toBeTypeOf('function');
    expect(report.mock.calls.at(-1)?.[0].disabled).toBe(true);
    expect(screen.queryByRole('button', { name: 'Save Changes' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    await waitFor(() => expect(report.mock.calls.at(-1)?.[0].disabled).toBe(false));
    await act(async () => {
      await report.mock.calls.at(-1)?.[0].save();
    });
    expect(mocks.updateTemplate).toHaveBeenCalledOnce();
    expect(onSaved).toHaveBeenCalledOnce();
  });
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.template = structuredClone(originalTemplate);
    mocks.permissions = new Set(['View', 'Add', 'Edit']);
    mocks.loading = false;
    mocks.catalogLoading = false;
    mocks.calculating = false;
    mocks.catalogEmpty = false;
    mocks.catalogError = undefined;
    mocks.refetchCatalog.mockResolvedValue({ data: { items: [] } });
    mocks.esiEmpty = false;
    mocks.esiError = false;
    mocks.refetchEsi.mockResolvedValue({ data: [] });
    mocks.failed = false;
    mocks.template.status = 'ACTIVE';
    mocks.calculate.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        isSample: true,
        previewToken: 'preview-proof',
        expiresAt: new Date(Date.now() + 1800000).toISOString(),
        calculation: {
          grossSalary: 20000,
          totalDeductions: 0,
          netSalary: 20000,
          employerContributionTotal: 0,
          employerCost: 20000,
          targetResult: { difference: 0, isExact: true },
          employeeStateInsurance: {
            managementMode: 'IN_PLATFORM',
            policyId: 'esi-policy-1',
            policyName: 'Standard ESIC',
            coverageDecision: 'NOT_APPLICABLE',
          },
          earnings: [],
          deductions: [],
          employerContributions: [],
          warnings: [],
        },
      }),
    });
    mocks.updateTemplate.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        ...mocks.template,
        activeVersion: 2,
        versionCount: 2,
        concurrencyStamp: 'stamp-2',
        editableVersion: {
          ...mocks.template.editableVersion,
          id: 'version-2',
          versionNumber: 2,
        },
      }),
    });
  });

  afterEach(cleanup);

  it('explains and repairs the fresh-tenant Basic-purpose gate without changing the entered salary', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    mocks.esiEmpty = true;
    mocks.createTemplate.mockReturnValue({ unwrap: async () => mocks.template });
    renderEditor(<SalaryTemplateEditor mode="create" onSaved={onSaved} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Template name' }), {
      target: { value: 'New school salary' },
    });
    await user.click(screen.getByRole('combobox', { name: 'ESIC management' }));
    await user.click(screen.getByRole('option', { name: 'Handled outside ShikshaMitra' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'External management reason' }), {
      target: { value: 'Synthetic school manages ESIC externally.' },
    });
    await user.click(screen.getByRole('button', { name: 'Add Earning' }));
    await user.click(screen.getByRole('combobox', { name: 'Payroll component' }));
    await user.click(screen.getByRole('option', { name: 'Basic Salary' }));
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Basic Salary amount' }), {
      target: { value: '50000' },
    });
    await user.click(screen.getByRole('button', { name: 'Add Deduction' }));
    await user.click(screen.getByRole('combobox', { name: 'Payroll component' }));
    await user.click(screen.getByRole('option', { name: 'Loan Recovery' }));
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Loan Recovery amount' }), {
      target: { value: '1000' },
    });
    expect(screen.getByRole('button', { name: 'Create Template' })).toBeDisabled();
    expect(document.getElementById('salary-preview-status')).toHaveTextContent(
      'Choose Basic as the payroll purpose for exactly one earning.'
    );
    expect(mocks.calculate).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Review configuration' }));
    const purpose = await screen.findByRole('combobox', {
      name: 'Payroll purpose for Basic Salary',
    });
    await waitFor(() => expect(purpose).toHaveFocus());
    await user.click(purpose);
    await user.click(screen.getByRole('option', { name: 'Basic' }));
    expect(
      (screen.getByRole('textbox', { name: 'Basic Salary amount' }) as HTMLInputElement).value
    ).toContain('50,000');
    expect(screen.getByRole('button', { name: 'Create Template' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Preview before creating' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Create Template' })).toBeEnabled()
    );
    expect(mocks.calculate).toHaveBeenCalledWith(
      expect.objectContaining({
        rules: expect.arrayContaining([
          expect.objectContaining({
            componentId: 'earning-1',
            semanticType: 'BASIC',
            formulaType: 'FIXED_AMOUNT',
            value: 50000,
          }),
          expect.objectContaining({
            componentId: 'deduction-1',
            semanticType: 'ORDINARY',
            formulaType: 'FIXED_AMOUNT',
            value: 1000,
          }),
        ]),
      })
    );
    await user.click(screen.getByRole('button', { name: 'Create Template' }));
    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  }, 15000);

  it('distinguishes denied component access from missing payroll setup', async () => {
    mocks.catalogError = { status: 403, data: { detail: 'Forbidden' } };
    renderEditor(<SalaryTemplateEditor mode="create" />);
    expect(await screen.findByText(/cannot load salary components/)).toBeVisible();
    expect(screen.getByText(/Ask your administrator/)).toBeVisible();
    expect(screen.queryByText('No active earning components')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Unable to load the salary template. Try again.')
    ).not.toBeInTheDocument();
    expect(mocks.createTemplate).not.toHaveBeenCalled();
  });

  it('offers safe component setup and refresh without losing the new template draft', async () => {
    const user = userEvent.setup();
    mocks.catalogEmpty = true;
    renderEditor(<SalaryTemplateEditor mode="create" />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Template name' }), {
      target: { value: 'Unsaved salary template' },
    });
    expect(screen.getByText('No active earning components')).toBeVisible();
    const setup = screen.getByRole('link', { name: /Review salary components/ });
    expect(setup).toHaveAttribute('href', '/hr/payroll/setting/earning-component');
    expect(setup).toHaveAttribute('target', '_blank');
    expect(setup).toHaveAttribute('rel', 'noopener noreferrer');
    await user.click(screen.getByRole('button', { name: 'Refresh setup' }));
    expect(mocks.refetchCatalog).toHaveBeenCalledOnce();
    expect(screen.getByRole('textbox', { name: 'Template name' })).toHaveValue(
      'Unsaved salary template'
    );
    expect(screen.getByRole('button', { name: 'Create Template' })).toBeDisabled();
    expect(mocks.calculate).not.toHaveBeenCalled();
    expect(mocks.createTemplate).not.toHaveBeenCalled();
  });

  it('offers ESIC setup without discarding a draft and keeps failed refreshes actionable', async () => {
    const user = userEvent.setup();
    mocks.esiEmpty = true;
    mocks.refetchEsi.mockResolvedValueOnce({ error: { status: 503 } });
    renderEditor(<SalaryTemplateEditor mode="create" />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Template name' }), {
      target: { value: 'Draft awaiting policy' },
    });
    expect(screen.getByText('No active ESIC policies')).toBeVisible();
    const setup = screen.getByRole('link', { name: /Review statutory setup/ });
    expect(setup).toHaveAttribute('href', '/hr/payroll/setting/statutory-schemes');
    expect(setup).toHaveAttribute('target', '_blank');
    expect(setup).toHaveAttribute('rel', 'noopener noreferrer');
    await user.click(screen.getByRole('button', { name: 'Refresh setup' }));
    expect(await screen.findByText(/Setup could not be refreshed/)).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Template name' })).toHaveValue(
      'Draft awaiting policy'
    );
    expect(screen.getByRole('button', { name: 'Create Template' })).toBeDisabled();
    expect(mocks.calculate).not.toHaveBeenCalled();
    expect(mocks.createTemplate).not.toHaveBeenCalled();
  });

  it('does not treat a failed ESIC read as an empty policy catalogue', () => {
    mocks.esiEmpty = true;
    mocks.esiError = true;
    renderEditor(<SalaryTemplateEditor mode="create" />);
    expect(screen.getByText('ESIC policies could not be loaded.')).toBeVisible();
    expect(screen.queryByText('No active ESIC policies')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Create an ESIC policy in Statutory Schemes first.')
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Review statutory setup/ })).not.toBeInTheDocument();
  });

  it('does not offer component setup links without access to the prerequisite page', () => {
    mocks.permissions = new Set(['Add']);
    mocks.catalogEmpty = true;
    renderEditor(<SalaryTemplateEditor mode="create" />);
    expect(screen.getByText('No active earning components')).toBeVisible();
    expect(
      screen.queryByRole('link', { name: /Review salary components/ })
    ).not.toBeInTheDocument();
    expect(screen.getByText(/Ask your HR administrator to review this setup/)).toBeVisible();
    expect(mocks.createTemplate).not.toHaveBeenCalled();
  });

  it('defaults to CTC and offers only the two supported salary bases', async () => {
    const user = userEvent.setup();
    renderEditor(<SalaryTemplateEditor mode="create" />);
    expect(screen.queryByRole('combobox', { name: /Protection policy/ })).toBeNull();
    const basis = screen.getByRole('combobox', { name: /Default salary basis/ });
    expect(basis).toHaveTextContent('Monthly cost to school (CTC)');
    await user.click(basis);
    expect(screen.getAllByRole('option')).toHaveLength(2);
    await user.click(screen.getByRole('option', { name: 'Monthly salary' }));
    expect(screen.getByRole('textbox', { name: 'Monthly salary' })).toBeVisible();
  });

  it('preserves workflow context and cancellation while the create catalogue loads', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    mocks.catalogLoading = true;
    const { rerender } = renderEditor(<SalaryTemplateEditor mode="create" onClose={onClose} />);

    expect(screen.getByRole('status', { name: 'Loading salary template' })).toHaveAttribute(
      'aria-busy',
      'true'
    );
    expect(screen.getByRole('heading', { name: 'Create Salary Template' })).toBeVisible();
    expect(screen.queryByRole('button', { name: /Step [12]:/ })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Preview salary|Refresh preview/ })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Template' })).toBeDisabled();
    expect(screen.queryByRole('textbox', { name: 'Template name' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledOnce();

    mocks.catalogLoading = false;
    await act(async () => {
      rerender(
        <ThemeProvider theme={theme}>
          <SalaryTemplateEditor mode="create" onClose={onClose} />
        </ThemeProvider>
      );
    });
    expect(
      screen.queryByRole('status', { name: 'Loading salary template' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Template name' })).toBeVisible();
  });

  it('keeps the title and close action available while loading or reporting an error', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    mocks.loading = true;
    renderEditor(<SalaryTemplateEditor templateId="template-1" mode="edit" onClose={onClose} />);
    expect(screen.getByRole('heading', { name: 'Edit Salary Template' })).toBeVisible();
    expect(screen.getByRole('status', { name: 'Loading salary template' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(onClose).toHaveBeenCalledOnce();
    cleanup();
    mocks.loading = false;
    mocks.failed = true;
    renderEditor(<SalaryTemplateEditor templateId="template-1" mode="edit" onClose={onClose} />);
    expect(screen.getByText('Unable to load the salary template. Try again.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Back' })).toBeEnabled();
  });

  it('shows configuration and sample together and supports keyboard preview navigation', async () => {
    const user = userEvent.setup();
    renderEditor(<SalaryTemplateEditor templateId="template-1" mode="edit" />);
    const review = screen.getByRole('button', { name: 'Preview salary' });
    act(() => review.focus());
    await user.keyboard('{Enter}');
    expect(screen.getByRole('heading', { name: 'Salary preview' })).toBeVisible();
    await waitFor(() => expect(mocks.calculate).toHaveBeenCalledTimes(1));
    expect(screen.getAllByRole('button', { name: /Preview salary|Refresh preview/ })).toHaveLength(
      1
    );
    expect(screen.queryByRole('button', { name: 'Preview Calculation' })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Template name' })).toBeVisible();
    expect(screen.queryByRole('button', { name: /Step [12]:/ })).not.toBeInTheDocument();
  });

  it('opens an active template directly in edit mode and saves the next active version', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderEditor(<SalaryTemplateEditor templateId="template-1" mode="edit" onClose={onClose} />);

    expect(screen.getByRole('textbox', { name: 'Template name' })).toHaveValue('Flexible Salary');
    expect(screen.getByText(/existing staff salary revisions stay unchanged/i)).toBeVisible();

    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() =>
      expect(mocks.updateTemplate).toHaveBeenCalledWith({
        templateId: 'template-1',
        body: expect.objectContaining({
          name: 'Flexible Salary',
          expectedActiveVersionId: 'version-1',
          concurrencyStamp: 'stamp-1',
          rules: mocks.template.editableVersion.rules,
        }),
      })
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows readable PF and ESIC status labels after preview', async () => {
    const user = userEvent.setup();
    const view = renderEditor(<SalaryTemplateEditor templateId="template-1" mode="edit" />);
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    expect(await screen.findByText('PF · Not applied')).toBeVisible();
    expect(screen.getByText(/ESIC · Standard ESIC ·/)).toBeVisible();
    expect(view.container.textContent).not.toContain('\uFFFD');
  });

  it('preserves the expected version when repairing a migrated template that needs setup', async () => {
    const user = userEvent.setup();
    mocks.template.status = 'NEEDS_SETUP';
    renderEditor(<SalaryTemplateEditor templateId="template-1" mode="edit" />);

    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() =>
      expect(mocks.updateTemplate).toHaveBeenCalledWith({
        templateId: 'template-1',
        body: expect.objectContaining({
          expectedActiveVersionId: 'version-1',
          concurrencyStamp: 'stamp-1',
        }),
      })
    );
  });

  it('keeps archived templates read-only and exposes version history', async () => {
    const user = userEvent.setup();
    mocks.template.status = 'ARCHIVED';
    const onClose = vi.fn();
    renderEditor(<SalaryTemplateEditor templateId="template-1" mode="edit" onClose={onClose} />);

    expect(screen.getByText('Read only')).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Template name' })).toBeDisabled();

    expect(screen.getByText('Version history')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('uses view mode when the user lacks edit permission', async () => {
    mocks.permissions = new Set(['View']);
    await act(async () => {
      renderEditor(<SalaryTemplateEditor templateId="template-1" mode="view" />);
    });

    expect(screen.getByText('Read only')).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Template name' })).toBeDisabled();
  });

  it('previews current edited rules and invalidates on sample and formula changes', async () => {
    const user = userEvent.setup();
    renderEditor(<SalaryTemplateEditor templateId="template-1" mode="edit" />);
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled());
    const value = screen.getByRole('textbox', { name: 'Basic Salary percent' });
    await user.clear(value);
    await user.type(value, '10');
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
    expect(screen.queryByText('Net salary')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    await waitFor(() =>
      expect(mocks.calculate).toHaveBeenLastCalledWith(
        expect.objectContaining({
          rules: expect.arrayContaining([
            expect.objectContaining({ semanticType: 'BASIC', value: 10 }),
          ]),
        })
      )
    );
    await user.clear(screen.getByRole('textbox', { name: 'Monthly cost to school (CTC)' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Monthly cost to school (CTC)' }),
      '20000.01'
    );
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
  });

  it('retains preview after a name edit and displays calculation errors inline', async () => {
    const user = userEvent.setup();
    renderEditor(<SalaryTemplateEditor templateId="template-1" mode="edit" />);
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled());
    fireEvent.change(screen.getByRole('textbox', { name: 'Template name' }), {
      target: { value: 'Flexible Salary revised' },
    });
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled();
    mocks.calculate.mockReturnValueOnce({
      unwrap: () =>
        Promise.reject(
          Object.assign(new Error('Allocation failed'), {
            data: { detail: 'Gross is INR 20000; missing INR 8000.' },
          })
        ),
    });
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    expect(await screen.findByText('Gross is INR 20000; missing INR 8000.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
  });

  it('ignores a late response for inputs changed while calculating', async () => {
    const user = userEvent.setup();
    let finish: (result: unknown) => void = () => undefined;
    const pending = new Promise((resolve) => {
      finish = resolve;
    });
    mocks.calculate.mockReturnValueOnce({ unwrap: () => pending });
    renderEditor(<SalaryTemplateEditor templateId="template-1" mode="edit" />);
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    await user.clear(screen.getByRole('textbox', { name: 'Monthly cost to school (CTC)' }));
    await user.type(screen.getByRole('textbox', { name: 'Monthly cost to school (CTC)' }), '10000');
    finish({
      previewToken: 'stale',
      expiresAt: new Date(Date.now() + 1800000).toISOString(),
      calculation: {},
    });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled()
    );
    expect(screen.queryByText('Net salary')).not.toBeInTheDocument();
  });

  it('protects dirty page navigation and preserves edits after a background template refresh', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const view = renderEditor(<SalaryTemplateEditor templateId="template-1" onClose={onClose} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Template name' }), {
      target: { value: 'My unsaved template' },
    });
    mocks.template = {
      ...mocks.template,
      name: 'Server changed this',
      concurrencyStamp: 'new-stamp',
    };
    view.rerender(
      <ThemeProvider theme={theme}>
        <SalaryTemplateEditor templateId="template-1" onClose={onClose} />
      </ThemeProvider>
    );
    expect(screen.getByRole('textbox', { name: 'Template name' })).toHaveValue(
      'My unsaved template'
    );
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    expect(mocks.calculate).toHaveBeenLastCalledWith(
      expect.objectContaining({ concurrencyStamp: 'stamp-1', expectedActiveVersionId: 'version-1' })
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('dialog', { name: 'Discard unsaved changes?' })).toBeVisible();
    expect(onClose).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(screen.getByRole('textbox', { name: 'Template name' })).toHaveValue(
      'My unsaved template'
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('expands and focuses an invalid dependency before calculating', async () => {
    const user = userEvent.setup();
    mocks.template.editableVersion.rules[1] = {
      ...mocks.template.editableVersion.rules[1],
      semanticType: 'ORDINARY',
      formulaType: 'PERCENTAGE_OF_COMPONENT',
      value: 40,
      basisComponentId: null,
    };
    renderEditor(<SalaryTemplateEditor templateId="template-1" />);
    const list = screen.getByRole('region', { name: 'Earning components' });
    Object.defineProperties(list, { clientHeight: { value: 360 }, scrollHeight: { value: 900 } });
    const scrollList = vi.fn();
    list.scrollTo = scrollList;
    expect(screen.getByRole('button', { name: 'Expand Special Allowance' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Collapse Special Allowance' })).toHaveAttribute(
        'aria-expanded',
        'true'
      )
    );
    expect(screen.getByText('Choose a basis component.')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Salary preview' })).toBeVisible();
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Basis component' })).toHaveFocus()
    );
    expect(scrollList).toHaveBeenCalled();
    expect(mocks.calculate).not.toHaveBeenCalled();
  });

  it('keeps 15 components visible as compact rows and supports multiple expanded details', async () => {
    const user = userEvent.setup();
    for (let index = 2; index < 15; index += 1)
      mocks.template.editableVersion.rules.push({
        code:
          index === 14
            ? 'Additional voluntary staff contribution with a very long component name'
            : `Rule ${index}`,
        componentId: `rule-${index}`,
        lineKind: index < 8 ? 'EARNING' : 'DEDUCTION',
        semanticType: 'ORDINARY',
        formulaType: 'FIXED_AMOUNT',
        value: 0,
        displayOrder: index,
      });
    renderEditor(<SalaryTemplateEditor templateId="template-1" />);
    expect(screen.getAllByRole('button', { name: /^Expand / })).toHaveLength(15);
    expect(
      screen.getByRole('button', {
        name: 'Expand Additional voluntary staff contribution with a very long component name',
      })
    ).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Expand Basic Salary' }));
    await user.click(screen.getByRole('button', { name: 'Expand Special Allowance' }));
    expect(screen.getByRole('button', { name: 'Collapse Basic Salary' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Collapse Special Allowance' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Move Basic Salary down' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Move Basic Salary down' })).toHaveFocus()
    );
    expect(screen.getAllByRole('button', { name: /^Collapse / })[0]).toHaveAccessibleName(
      'Collapse Special Allowance'
    );
    await user.click(screen.getByRole('button', { name: 'Remove Basic Salary' }));
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    expect(
      screen.getAllByText('Choose Basic as the payroll purpose for exactly one earning.')[0]
    ).toBeVisible();
  }, 10000);

  it('denies create and direct detail access without their exact permissions', () => {
    mocks.permissions = new Set(['View']);
    renderEditor(<SalaryTemplateEditor mode="create" />);
    expect(
      screen.getByText('You do not have permission to create salary templates.')
    ).toBeVisible();
    cleanup();
    mocks.permissions = new Set(['Edit']);
    renderEditor(<SalaryTemplateEditor templateId="template-1" />);
    expect(screen.getByText('You do not have permission to view salary templates.')).toBeVisible();
    expect(screen.queryByRole('textbox', { name: 'Template name' })).not.toBeInTheDocument();
  });

  it('adds and focuses a new component, then previews and creates without an existing template', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    mocks.createTemplate.mockReturnValue({ unwrap: async () => mocks.template });
    renderEditor(<SalaryTemplateEditor mode="create" onSaved={onSaved} />);
    await user.click(screen.getByRole('textbox', { name: 'Template name' }));
    await user.paste('New template');
    await user.click(screen.getByRole('button', { name: 'Add Earning' }));
    expect(
      screen.queryByText('Complete the configuration before previewing:')
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: 'Payroll component' }));
    await user.click(screen.getByRole('option', { name: 'Basic Salary' }));
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Basic Salary amount' })).toHaveFocus()
    );
    await user.click(screen.getByRole('combobox', { name: 'Payroll purpose for Basic Salary' }));
    await user.click(screen.getByRole('option', { name: 'Basic' }));
    await user.clear(screen.getByRole('textbox', { name: 'Basic Salary amount' }));
    await user.type(screen.getByRole('textbox', { name: 'Basic Salary amount' }), '50000');
    expect(mocks.createTemplate).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Create Template' })).toBeEnabled()
    );
    expect(mocks.calculate).toHaveBeenCalledWith(
      expect.objectContaining({
        templateId: null,
        rules: expect.arrayContaining([
          expect.objectContaining({
            semanticType: 'BASIC',
            formulaType: 'FIXED_AMOUNT',
            value: 50000,
          }),
        ]),
      })
    );
    await user.click(screen.getByRole('button', { name: 'Create Template' }));
    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
    expect(mocks.createTemplate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'New template', previewToken: 'preview-proof' })
    );
    expect(
      screen.queryByRole('dialog', { name: 'Discard unsaved changes?' })
    ).not.toBeInTheDocument();
  }, 15000);

  it('explains a rejected duplicate name and creates after renaming without losing the preview', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    mocks.createTemplate
      .mockReturnValueOnce({
        unwrap: async () =>
          Promise.reject(
            Object.assign(new Error('Duplicate template name'), {
              status: 400,
              data: {
                errorCode: 'HR:Payroll:SalaryTemplateNameExists',
                detail: 'One or more business rules were violated.',
                data: { name: 'Existing template' },
              },
            })
          ),
      })
      .mockReturnValue({ unwrap: async () => mocks.template });
    renderEditor(<SalaryTemplateEditor mode="create" onSaved={onSaved} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Template name' }), {
      target: { value: 'Existing template' },
    });
    await user.click(screen.getByRole('button', { name: 'Add Earning' }));
    await user.click(screen.getByRole('combobox', { name: 'Payroll component' }));
    await user.click(screen.getByRole('option', { name: 'Basic Salary' }));
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await user.click(screen.getByRole('combobox', { name: 'Payroll purpose for Basic Salary' }));
    await user.click(screen.getByRole('option', { name: 'Basic' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Basic Salary amount' }), {
      target: { value: '50000' },
    });
    await user.click(screen.getByRole('button', { name: /Preview salary/ }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Create Template' })).toBeEnabled()
    );
    await user.click(screen.getByRole('button', { name: 'Create Template' }));
    expect(
      await screen.findByText(
        'A salary template already uses this name. Enter a different template name.'
      )
    ).toBeVisible();
    expect(onSaved).not.toHaveBeenCalled();
    expect(screen.queryByText(/Another administrator changed/)).not.toBeInTheDocument();
    expect(
      (screen.getByRole('textbox', { name: 'Basic Salary amount' }) as HTMLInputElement).value
    ).toContain('50,000');
    fireEvent.change(screen.getByRole('textbox', { name: 'Template name' }), {
      target: { value: 'Unique template' },
    });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Create Template' })).toBeEnabled()
    );
    await user.click(screen.getByRole('button', { name: 'Create Template' }));
    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
    expect(mocks.calculate).toHaveBeenCalledOnce();
    expect(mocks.createTemplate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        name: 'Unique template',
        previewToken: 'preview-proof',
      })
    );
  }, 15000);

  it('expires a preview and retains form values after a failed save with an idempotent retry', async () => {
    const user = userEvent.setup();
    mocks.updateTemplate.mockReturnValueOnce({
      unwrap: () =>
        Promise.reject(
          Object.assign(new Error('Temporarily unavailable.'), {
            status: 503,
            data: { detail: 'Temporarily unavailable.' },
          })
        ),
    });
    renderEditor(<SalaryTemplateEditor templateId="template-1" />);
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(await screen.findByText('Temporarily unavailable.')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(mocks.updateTemplate).toHaveBeenCalledTimes(2));
    expect(mocks.updateTemplate.mock.calls[1][0].body.idempotencyKey).toBe(
      mocks.updateTemplate.mock.calls[0][0].body.idempotencyKey
    );
    mocks.calculate.mockReturnValueOnce({
      unwrap: async () => ({
        previewToken: 'expiring',
        expiresAt: new Date(Date.now() + 100).toISOString(),
        calculation: {
          grossSalary: 20000,
          targetResult: { difference: 0, isExact: true },
          employeeStateInsurance: {
            managementMode: 'IN_PLATFORM',
            policyId: 'esi-policy-1',
            policyName: 'Standard ESIC',
            coverageDecision: 'NOT_APPLICABLE',
          },
          earnings: [],
          deductions: [],
          employerContributions: [],
          warnings: [],
        },
      }),
    });
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    expect(
      await screen.findByText('The salary preview expired. Refresh preview before saving.')
    ).toBeVisible();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled()
    );
  });
  it('keeps statutory guidance compact with keyboard-accessible details', async () => {
    const user = userEvent.setup();
    renderEditor(<SalaryTemplateEditor mode="create" />);
    expect(screen.getByText('Professional Tax uses effective statutory rules.')).toBeVisible();
    const summary = screen.getByText('How statutory rules apply');
    const details = summary.closest('details');
    expect(details).not.toHaveAttribute('open');
    await user.click(summary);
    expect(details).toHaveAttribute('open');
    expect(screen.getByText(/ESIC eligibility remains based on staff enrollment/)).toBeVisible();
    await user.click(summary);
    expect(details).not.toHaveAttribute('open');
  });

  it('separates earnings, deductions, statutory defaults, and sample calculation', () => {
    renderEditor(<SalaryTemplateEditor mode="create" />);
    const earnings = screen.getByRole('region', { name: 'Earnings' });
    const deductions = screen.getByRole('region', { name: 'Deductions' });
    expect(earnings).toContainElement(screen.getByRole('button', { name: 'Add Earning' }));
    expect(deductions).toContainElement(screen.getByRole('button', { name: 'Add Deduction' }));
    expect(deductions).not.toContainElement(
      screen.getByRole('region', { name: 'Statutory Defaults' })
    );
    expect(screen.getByRole('region', { name: 'Salary preview' })).toBeVisible();
    expect(screen.getByText('No earnings added')).toBeVisible();
    expect(screen.getByText('No deductions added')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Create Template' })).toBeDisabled();
  });

  it('focuses the template name before calculating an incomplete new template', async () => {
    const user = userEvent.setup();
    renderEditor(<SalaryTemplateEditor mode="create" />);
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Template name' })).toHaveFocus()
    );
    expect(screen.getByText('Template name is required.')).toBeVisible();
    expect(mocks.calculate).not.toHaveBeenCalled();
  });

  it('rejects an empty sample amount without calling the preview API', async () => {
    const user = userEvent.setup();
    renderEditor(<SalaryTemplateEditor templateId="template-1" />);
    await user.clear(screen.getByRole('textbox', { name: 'Monthly cost to school (CTC)' }));
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    expect(
      await screen.findByText(
        'Enter a sample amount greater than zero and a valid effective month.'
      )
    ).toBeVisible();
    expect(mocks.calculate).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
  });

  it('keeps edits after a conflict and requires a new preview', async () => {
    const user = userEvent.setup();
    mocks.updateTemplate.mockReturnValueOnce({
      unwrap: () =>
        Promise.reject(
          Object.assign(new Error('Conflict'), { status: 409, data: { detail: 'Conflict' } })
        ),
    });
    renderEditor(<SalaryTemplateEditor templateId="template-1" />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Template name' }), {
      target: { value: 'Flexible Salary revised' },
    });
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(await screen.findByText(/Another administrator changed this template/)).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Template name' })).toHaveValue(
      'Flexible Salary revised'
    );
    expect(screen.getByRole('button', { name: 'Reload' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
  });

  it('locks configuration and prevents a second save while the request is pending', async () => {
    const user = userEvent.setup();
    let rejectSave: (error: unknown) => void = () => undefined;
    mocks.updateTemplate.mockReturnValueOnce({
      unwrap: () =>
        new Promise((_, reject) => {
          rejectSave = reject;
        }),
    });
    renderEditor(<SalaryTemplateEditor templateId="template-1" />);
    await user.click(screen.getByRole('button', { name: /Preview salary|Refresh preview/ }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled());
    const save = screen.getByRole('button', { name: 'Save Changes' });
    await user.click(save);
    expect(save).toBeDisabled();
    fireEvent.click(save);
    await waitFor(() => expect(mocks.updateTemplate).toHaveBeenCalledOnce());
    expect(screen.getByRole('textbox', { name: 'Template name' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Preview salary|Refresh preview/ })).toBeDisabled();
    await act(async () => {
      rejectSave({ status: 503, data: { detail: 'Retry later.' } });
    });
    expect(await screen.findByText('Retry later.')).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Template name' })).toBeEnabled();
  });
});
