import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, cleanup, waitFor } from '@testing-library/react';

import SalaryTemplateEditor from './salary-template-editor';

const mocks = vi.hoisted(() => ({
  permissions: new Set(['Add', 'Edit']),
  push: vi.fn(),
  replace: vi.fn(),
  updateTemplate: vi.fn(),
  createTemplate: vi.fn(),
  calculate: vi.fn(),
  refetch: vi.fn(),
  toastInfo: vi.fn(),
  toastSuccess: vi.fn(),
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
  },
}));

vi.mock('react-redux', () => ({ useDispatch: () => vi.fn(), useSelector: () => [] }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push, replace: mocks.replace }),
}));
vi.mock('src/routes/components', () => ({
  RouterLink: ({ children, ...props }: React.ComponentProps<'a'>) => <a {...props}>{children}</a>,
}));
vi.mock('sonner', () => ({
  toast: {
    info: mocks.toastInfo,
    success: mocks.toastSuccess,
  },
}));
vi.mock('src/utils/permissions', () => ({
  hasGrantedPermission: (_permissions: unknown, permission: string) =>
    [...mocks.permissions].some((action) => permission.endsWith(`.${action}`)),
}));
vi.mock('src/redux/PF/PFApi', () => ({
  useGetPFQuery: () => ({ data: { items: [] }, isError: false }),
}));
vi.mock('src/redux/hr/salary-template-api', () => ({
  useGetSalaryTemplateQuery: () => ({
    data: mocks.template,
    isLoading: false,
    isError: false,
    refetch: mocks.refetch,
  }),
  useGetSalaryTemplateVersionsQuery: () => ({
    data: { items: [mocks.template.editableVersion] },
  }),
  useGetSalaryTemplateComponentCatalogQuery: () => ({
    data: {
      items: [
        { componentId: 'earning-1', name: 'Basic Salary', lineKind: 'EARNING' },
        { componentId: 'earning-2', name: 'Special Allowance', lineKind: 'EARNING' },
        { componentId: 'deduction-1', name: 'Loan Recovery', lineKind: 'DEDUCTION' },
      ],
    },
    isLoading: false,
    isError: false,
  }),
  useCreateSalaryTemplateMutation: () => [mocks.createTemplate, { isLoading: false }],
  useUpdateSalaryTemplateMutation: () => [mocks.updateTemplate, { isLoading: false }],
  useCalculateSalaryTemplateMutation: () => [mocks.calculate, { isLoading: false }],
}));

const theme = createTheme(defaultSettings);
const renderEditor = (ui: React.ReactNode) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('SalaryTemplateEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.permissions = new Set(['Add', 'Edit']);
    mocks.template.status = 'ACTIVE';
    mocks.template.isDefault = true;
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

  it('opens an active template directly in edit mode and saves the next active version', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    renderEditor(<SalaryTemplateEditor templateId="template-1" mode="edit" onSaved={onSaved} />);

    expect(screen.getByRole('textbox', { name: 'Template Name' })).toHaveValue('Flexible Salary');
    expect(screen.getByText(/existing employee salary revisions remain unchanged/i)).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Earnings' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Deductions' })).toBeVisible();

    expect(screen.getByText('This template is ready to save as the active version.')).toBeVisible();
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
    expect(onSaved).toHaveBeenCalledTimes(1);
  });

  it('preserves the expected version when repairing a migrated template that needs setup', async () => {
    const user = userEvent.setup();
    mocks.template.status = 'NEEDS_SETUP';
    renderEditor(<SalaryTemplateEditor templateId="template-1" mode="edit" />);

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

    expect(screen.getByText('Read Only')).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Template Name' })).toBeDisabled();

    expect(screen.getByText('Version History')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Save Changes' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Back to Templates' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('uses view mode when the user lacks edit permission', () => {
    mocks.permissions = new Set();
    renderEditor(<SalaryTemplateEditor templateId="template-1" mode="view" />);

    expect(screen.getByText('Read Only')).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Template Name' })).toBeDisabled();
  });

  it('expands one component at a time and exposes locked calculations as guidance', async () => {
    const user = userEvent.setup();
    renderEditor(<SalaryTemplateEditor templateId="template-1" mode="edit" />);

    const basicRow = screen.getByRole('button', { name: /Basic Salary/i });
    const balancingRow = screen.getByRole('button', { name: /Special Allowance/i });

    await user.click(basicRow);
    expect(basicRow).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('combobox', { name: /Purpose for Basic Salary/i })).toBeVisible();

    await user.click(balancingRow);
    expect(basicRow).toHaveAttribute('aria-expanded', 'false');
    expect(balancingRow).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/automatically balances the remaining gross salary/i)).toBeVisible();
  });

  it('adds a deduction inline and opens it for editing', async () => {
    const user = userEvent.setup();
    renderEditor(<SalaryTemplateEditor templateId="template-1" mode="edit" />);

    await user.click(screen.getByRole('button', { name: 'Add Deduction' }));
    const picker = screen.getByRole('combobox', { name: 'Select Deduction Component' });
    await user.click(picker);
    await user.click(screen.getByRole('option', { name: 'Loan Recovery' }));

    const row = screen.getByRole('button', { name: /Loan Recovery/i });
    expect(row).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('combobox', { name: /Purpose for Loan Recovery/i })).toBeVisible();
  });

  it('offers undo after removing a component', async () => {
    const user = userEvent.setup();
    renderEditor(<SalaryTemplateEditor templateId="template-1" mode="edit" />);

    await user.click(screen.getByRole('button', { name: /Basic Salary/i }));
    await user.click(screen.getByRole('button', { name: 'Remove Component' }));
    expect(screen.queryByRole('button', { name: /Basic Salary/i })).not.toBeInTheDocument();
    expect(mocks.toastInfo).toHaveBeenCalledWith(
      'Basic Salary removed.',
      expect.objectContaining({ action: expect.objectContaining({ label: 'Undo' }) })
    );

    const toastOptions = mocks.toastInfo.mock.calls[0][1];
    act(() => toastOptions.action.onClick());
    expect(await screen.findByRole('button', { name: /Basic Salary/i })).toBeVisible();
  });

  it('guards page navigation when template details are dirty', async () => {
    const user = userEvent.setup();
    renderEditor(<SalaryTemplateEditor templateId="template-1" mode="edit" />);

    await user.type(screen.getByRole('textbox', { name: 'Template Name' }), ' Updated');
    await user.click(screen.getByRole('button', { name: 'Back to Templates' }));

    expect(screen.getByRole('dialog', { name: 'Discard unsaved changes?' })).toBeVisible();
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
