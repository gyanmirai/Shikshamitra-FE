import type { SalaryTemplate } from 'src/redux/hr/salary-template-api';

import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, cleanup, waitFor } from '@testing-library/react';

import SalaryTemplateEditor from './salary-template-editor';

const mocks = vi.hoisted(() => ({
  permissions: new Set(['View', 'Add', 'Edit']),
  updateTemplate: vi.fn(),
  createTemplate: vi.fn(),
  calculate: vi.fn(),
  refetch: vi.fn(),
  loading: false,
  catalogLoading: false,
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

vi.mock('react-redux', () => ({ useDispatch: () => vi.fn(), useSelector: () => [] }));
vi.mock('src/utils/permissions', () => ({
  hasGrantedPermission: (_permissions: unknown, permission: string) =>
    [...mocks.permissions].some((action) => permission.endsWith(`.${action}`)),
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
    data: mocks.catalogLoading
      ? undefined
      : {
          items: [
            { componentId: 'earning-1', name: 'Basic Salary', lineKind: 'EARNING' },
            { componentId: 'earning-2', name: 'Special Allowance', lineKind: 'EARNING' },
            { componentId: 'deduction-1', name: 'Loan Recovery', lineKind: 'DEDUCTION' },
          ],
        },
    isLoading: mocks.catalogLoading,
    isError: false,
  }),
  useCreateSalaryTemplateMutation: () => [mocks.createTemplate, { isLoading: false }],
  useUpdateSalaryTemplateMutation: () => [mocks.updateTemplate, { isLoading: false }],
  usePreviewSalaryTemplateMutation: () => [mocks.calculate, { isLoading: false }],
}));

const theme = createTheme(defaultSettings);
const renderEditor = (ui: React.ReactNode) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

const originalTemplate = structuredClone(mocks.template);

describe('SalaryTemplateEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.template = structuredClone(originalTemplate);
    mocks.permissions = new Set(['View', 'Add', 'Edit']);
    mocks.loading = false;
    mocks.catalogLoading = false;
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
          targetResult: { difference: 0 },
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
    expect(screen.getByRole('button', { name: 'Step 1: Configure' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Step 2: Review' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Review' })).toBeDisabled();
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
    expect(screen.queryByRole('status', { name: 'Loading salary template' })).not.toBeInTheDocument();
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

  it('supports keyboard navigation to the review step', async () => {
    const user = userEvent.setup();
    renderEditor(<SalaryTemplateEditor templateId="template-1" mode="edit" />);
    const review = screen.getByRole('button', { name: 'Step 2: Review' });
    act(() => review.focus());
    await user.keyboard('{Enter}');
    expect(screen.getByRole('heading', { name: 'Sample calculation' })).toBeVisible();
    expect(review).toHaveAttribute('aria-current', 'step');
  });

  it('opens an active template directly in edit mode and saves the next active version', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderEditor(<SalaryTemplateEditor templateId="template-1" mode="edit" onClose={onClose} />);

    expect(screen.getByRole('textbox', { name: 'Template name' })).toHaveValue('Flexible Salary');
    expect(screen.getByText(/existing employee salary revisions stay unchanged/i)).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Review' }));
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Calculate' }));
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

  it('preserves the expected version when repairing a migrated template that needs setup', async () => {
    const user = userEvent.setup();
    mocks.template.status = 'NEEDS_SETUP';
    renderEditor(<SalaryTemplateEditor templateId="template-1" mode="edit" />);

    await user.click(screen.getByRole('button', { name: 'Review' }));
    await user.click(screen.getByRole('button', { name: 'Calculate' }));
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

    await user.click(screen.getByRole('button', { name: 'Review' }));
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
    await user.click(screen.getByRole('button', { name: 'Review' }));
    await user.click(screen.getByRole('button', { name: 'Calculate' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Edit Earnings' }));
    const value = screen.getByRole('textbox', { name: 'Basic Salary percent' });
    await user.clear(value);
    await user.type(value, '10');
    await user.click(screen.getByRole('button', { name: 'Review' }));
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
    expect(screen.queryByText('Net salary')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Calculate' }));
    await waitFor(() =>
      expect(mocks.calculate).toHaveBeenLastCalledWith(
        expect.objectContaining({
          rules: expect.arrayContaining([
            expect.objectContaining({ semanticType: 'BASIC', value: 10 }),
          ]),
        })
      )
    );
    await user.clear(screen.getByRole('textbox', { name: 'Sample monthly amount' }));
    await user.type(screen.getByRole('textbox', { name: 'Sample monthly amount' }), '20000.01');
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
  });

  it('retains preview after a name edit and displays calculation errors inline', async () => {
    const user = userEvent.setup();
    renderEditor(<SalaryTemplateEditor templateId="template-1" mode="edit" />);
    await user.click(screen.getByRole('button', { name: 'Review' }));
    await user.click(screen.getByRole('button', { name: 'Calculate' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Edit Basic Information' }));
    await user.type(screen.getByRole('textbox', { name: 'Template name' }), ' revised');
    await user.click(screen.getByRole('button', { name: 'Review' }));
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled();
    mocks.calculate.mockReturnValueOnce({
      unwrap: () =>
        Promise.reject(
          Object.assign(new Error('Allocation failed'), {
            data: { detail: 'Gross is INR 20000; missing INR 8000.' },
          })
        ),
    });
    await user.click(screen.getByRole('button', { name: 'Calculate' }));
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
    await user.click(screen.getByRole('button', { name: 'Review' }));
    await user.click(screen.getByRole('button', { name: 'Calculate' }));
    await user.clear(screen.getByRole('textbox', { name: 'Sample monthly amount' }));
    await user.type(screen.getByRole('textbox', { name: 'Sample monthly amount' }), '10000');
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
    await user.clear(screen.getByRole('textbox', { name: 'Template name' }));
    await user.type(screen.getByRole('textbox', { name: 'Template name' }), 'My unsaved template');
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
    await user.click(screen.getByRole('button', { name: 'Review' }));
    await user.click(screen.getByRole('button', { name: 'Calculate' }));
    expect(mocks.calculate).toHaveBeenLastCalledWith(
      expect.objectContaining({ concurrencyStamp: 'stamp-1', expectedActiveVersionId: 'version-1' })
    );
    await user.click(screen.getByRole('button', { name: 'Edit Basic Information' }));
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

  it('expands an invalid dependency and keeps Configure active', async () => {
    const user = userEvent.setup();
    mocks.template.editableVersion.rules[1] = {
      ...mocks.template.editableVersion.rules[1],
      semanticType: 'ORDINARY',
      formulaType: 'PERCENTAGE_OF_COMPONENT',
      value: 40,
      basisComponentId: null,
    };
    renderEditor(<SalaryTemplateEditor templateId="template-1" />);
    expect(screen.getByRole('button', { name: 'Expand Special Allowance' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    await user.click(screen.getByRole('button', { name: 'Review' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Collapse Special Allowance' })).toHaveAttribute(
        'aria-expanded',
        'true'
      )
    );
    expect(screen.getByText('Choose a basis component.')).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Sample calculation' })).not.toBeInTheDocument();
  });

  it('keeps 15 components visible as compact rows and supports multiple expanded details', async () => {
    const user = userEvent.setup();
    for (let index = 2; index < 15; index += 1)
      mocks.template.editableVersion.rules.push({
        code: `Rule ${index}`,
        componentId: `rule-${index}`,
        lineKind: index < 8 ? 'EARNING' : 'DEDUCTION',
        semanticType: 'ORDINARY',
        formulaType: 'FIXED_AMOUNT',
        value: 0,
        displayOrder: index,
      });
    renderEditor(<SalaryTemplateEditor templateId="template-1" />);
    expect(screen.getAllByRole('button', { name: /^Expand / })).toHaveLength(15);
    await user.click(screen.getByRole('button', { name: 'Expand Basic Salary' }));
    await user.click(screen.getByRole('button', { name: 'Expand Special Allowance' }));
    expect(screen.getByRole('button', { name: 'Collapse Basic Salary' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Collapse Special Allowance' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Move Basic Salary down' }));
    expect(screen.getAllByRole('button', { name: /^Collapse / })[0]).toHaveAccessibleName(
      'Collapse Special Allowance'
    );
    await user.click(screen.getByRole('button', { name: 'Remove Basic Salary' }));
    await user.click(screen.getByRole('button', { name: 'Review' }));
    expect(screen.getByText('Add exactly one Basic earning.')).toBeVisible();
  });

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
    await user.type(screen.getByRole('textbox', { name: 'Template name' }), 'New template');
    await user.click(screen.getByRole('button', { name: 'Add Earning' }));
    expect(screen.queryByText('Add exactly one Basic earning.')).not.toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: 'Payroll component' }));
    await user.click(screen.getByRole('option', { name: 'Basic Salary' }));
    await user.click(screen.getByRole('button', { name: 'Add Component' }));
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Basic Salary amount' })).toHaveFocus()
    );
    await user.click(screen.getByRole('combobox', { name: /Purpose/ }));
    await user.click(screen.getByRole('option', { name: 'Basic' }));
    await user.clear(screen.getByRole('textbox', { name: 'Basic Salary percent' }));
    await user.type(screen.getByRole('textbox', { name: 'Basic Salary percent' }), '100');
    await user.click(screen.getByRole('button', { name: 'Review' }));
    expect(mocks.createTemplate).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Calculate' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Create Template' })).toBeEnabled()
    );
    expect(mocks.calculate).toHaveBeenCalledWith(
      expect.objectContaining({
        templateId: null,
        rules: expect.arrayContaining([
          expect.objectContaining({ semanticType: 'BASIC', value: 100 }),
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
  });

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
    await user.click(screen.getByRole('button', { name: 'Review' }));
    await user.click(screen.getByRole('button', { name: 'Calculate' }));
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
          targetResult: { difference: 0 },
          earnings: [],
          deductions: [],
          employerContributions: [],
          warnings: [],
        },
      }),
    });
    await user.click(screen.getByRole('button', { name: 'Calculate' }));
    expect(
      await screen.findByText('The sample preview expired. Calculate again before saving.')
    ).toBeVisible();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled()
    );
  });
});
