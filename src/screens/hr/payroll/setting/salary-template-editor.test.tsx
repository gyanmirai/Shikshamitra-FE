import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import SalaryTemplateEditor from './salary-template-editor';

const mocks = vi.hoisted(() => ({
  permissions: new Set(['Add', 'Edit']),
  updateTemplate: vi.fn(),
  createTemplate: vi.fn(),
  calculate: vi.fn(),
  refetch: vi.fn(),
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
const renderEditor = (ui: React.ReactNode) => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('SalaryTemplateEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.permissions = new Set(['Add', 'Edit']);
    mocks.template.status = 'ACTIVE';
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
    const onClose = vi.fn();
    renderEditor(<SalaryTemplateEditor templateId="template-1" mode="edit" onClose={onClose} />);

    expect(screen.getByRole('textbox', { name: 'Template name' })).toHaveValue('Flexible Salary');
    expect(screen.getByText(/existing employee salary revisions stay unchanged/i)).toBeVisible();

    await user.click(screen.getByText('Review'));
    expect(screen.getByText('This template is ready to save as the active version.')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

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

    await user.click(screen.getByText('Review'));
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

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

    await user.click(screen.getByText('Review'));
    expect(screen.getByText('Version history')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('uses view mode when the user lacks edit permission', () => {
    mocks.permissions = new Set();
    renderEditor(<SalaryTemplateEditor templateId="template-1" mode="view" />);

    expect(screen.getByText('Read only')).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Template name' })).toBeDisabled();
  });
});
