import type { SalaryTemplateRule } from 'src/redux/hr/salary-template-api';

import userEvent from '@testing-library/user-event';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { render, screen, within, waitFor, cleanup } from '@testing-library/react';

import SalaryTemplateEditor from './salary-template-editor';

const mocks = vi.hoisted(() => ({
  canEdit: true,
  canPublish: true,
  push: vi.fn(),
  updateDraft: vi.fn(),
  publish: vi.fn(),
  template: {
    id: 'template-1',
    name: 'Flexible Salary',
    description: 'Tenant template',
    status: 'DRAFT',
    isDefault: false,
    latestVersion: 1,
    publishedVersion: null,
    latest: {
      id: 'version-1',
      versionNumber: 1,
      status: 'DRAFT',
      defaultSalaryBasis: 'EMPLOYER_COST' as const,
      defaultProtectionPolicy: 'PROTECT_EMPLOYER_COST' as const,
      rules: [] as SalaryTemplateRule[],
    },
  },
}));

vi.mock('react-redux', () => ({ useSelector: () => [], useDispatch: () => vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock('src/utils/permissions', () => ({
  hasGrantedPermission: (_permissions: unknown, permission: string) =>
    permission.endsWith('.Edit')
      ? mocks.canEdit
      : permission.endsWith('.Publish') && mocks.canPublish,
}));
vi.mock('src/redux/hr/salary-template-api', () => ({
  useGetSalaryTemplateQuery: () => ({
    data: mocks.template,
    isLoading: false,
    isError: false,
  }),
  useGetSalaryTemplateComponentCatalogQuery: () => ({
    data: {
      items: [
        { componentId: 'earning-1', name: 'Basic Salary', lineKind: 'EARNING' },
        { componentId: 'earning-2', name: 'Special Allowance', lineKind: 'EARNING' },
        { componentId: 'deduction-1', name: 'Loan Recovery', lineKind: 'DEDUCTION' },
        { componentId: 'deduction-2', name: 'Professional Tax', lineKind: 'DEDUCTION' },
      ],
    },
    isLoading: false,
    isError: false,
  }),
  useUpdateSalaryTemplateDraftMutation: () => [mocks.updateDraft, { isLoading: false }],
  usePublishSalaryTemplateMutation: () => [mocks.publish, { isLoading: false }],
}));

describe('SalaryTemplateEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.canEdit = true;
    mocks.canPublish = true;
    mocks.template.status = 'DRAFT';
    mocks.template.latest.status = 'DRAFT';
    mocks.template.latest.rules = [];
    mocks.updateDraft.mockReturnValue({ unwrap: vi.fn().mockResolvedValue(mocks.template) });
    mocks.publish.mockReturnValue({ unwrap: vi.fn().mockResolvedValue(mocks.template) });
  });

  afterEach(cleanup);

  it('shows a blank editable composer and persists an incomplete draft', async () => {
    const user = userEvent.setup();
    render(<SalaryTemplateEditor templateId="template-1" versionId="version-1" />);

    expect(screen.getByText('Earnings')).toBeVisible();
    expect(screen.getByText('Deductions')).toBeVisible();
    expect(screen.queryByText(/Formulas configured here override/i)).not.toBeInTheDocument();
    expect(screen.getByText('Add exactly one Basic earning.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Add earning' })).toBeEnabled();

    await user.click(screen.getAllByRole('button', { name: 'Save draft' })[0]);

    await waitFor(() =>
      expect(mocks.updateDraft).toHaveBeenCalledWith({
        templateId: 'template-1',
        versionId: 'version-1',
        name: 'Flexible Salary',
        description: 'Tenant template',
        defaultSalaryBasis: 'EMPLOYER_COST',
        defaultProtectionPolicy: 'PROTECT_EMPLOYER_COST',
        rules: [],
      })
    );
  });

  it('lets a Publish-only user review and publish a complete draft without editing it', async () => {
    const user = userEvent.setup();
    mocks.canEdit = false;
    mocks.template.latest.rules = [
      {
        code: 'BASIC',
        componentId: 'earning-1',
        lineKind: 'EARNING',
        semanticType: 'BASIC',
        formulaType: 'PERCENTAGE_OF_GROSS',
        value: 60,
        displayOrder: 0,
      },
      {
        code: 'BALANCE',
        componentId: 'earning-2',
        lineKind: 'EARNING',
        semanticType: 'BALANCING_EARNING',
        formulaType: 'REMAINDER_OF_GROSS',
        value: null,
        displayOrder: 1,
      },
    ];

    render(<SalaryTemplateEditor templateId="template-1" versionId="version-1" />);

    expect(screen.queryByRole('button', { name: 'Add earning' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save draft' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Publish' })).toBeEnabled();
    expect(screen.getByText(/This draft is ready to publish\. A balancing earning is optional\./)).toBeVisible();
    expect(screen.queryByText(/Formulas configured here override/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Publish' }));

    await waitFor(() =>
      expect(mocks.publish).toHaveBeenCalledWith({
        templateId: 'template-1',
        versionId: 'version-1',
      })
    );
    expect(mocks.updateDraft).not.toHaveBeenCalled();
  });

  it('changes automatic earning and deduction rules to editable fixed values and preserves them after save', async () => {
    const user = userEvent.setup();
    mocks.template.latest.rules = [
      {
        code: 'SPECIAL_ALLOWANCE',
        componentId: 'earning-2',
        lineKind: 'EARNING',
        semanticType: 'BALANCING_EARNING',
        formulaType: 'REMAINDER_OF_GROSS',
        value: null,
        displayOrder: 0,
      },
      {
        code: 'PROFESSIONAL_TAX',
        componentId: 'deduction-2',
        lineKind: 'DEDUCTION',
        semanticType: 'PROFESSIONAL_TAX',
        formulaType: 'PROFESSIONAL_TAX',
        value: null,
        displayOrder: 1,
      },
    ];
    mocks.updateDraft.mockImplementation((request: { rules: SalaryTemplateRule[] }) => ({
      unwrap: vi.fn().mockResolvedValue({
        ...mocks.template,
        latest: { ...mocks.template.latest, rules: request.rules },
      }),
    }));

    render(<SalaryTemplateEditor templateId="template-1" versionId="version-1" />);

    const specialAllowanceRow = screen
      .getByRole('heading', { name: 'Special Allowance' })
      .closest<HTMLElement>('.MuiCard-root');
    const professionalTaxRow = screen
      .getByRole('heading', { name: 'Professional Tax' })
      .closest<HTMLElement>('.MuiCard-root');

    expect(specialAllowanceRow).not.toBeNull();
    expect(professionalTaxRow).not.toBeNull();
    expect(
      within(specialAllowanceRow!).getByRole('spinbutton', { name: 'Calculated automatically' })
    ).toBeDisabled();
    expect(
      within(professionalTaxRow!).getByRole('spinbutton', { name: 'Calculated automatically' })
    ).toBeDisabled();

    await user.click(within(specialAllowanceRow!).getByRole('combobox', { name: 'Calculation' }));
    await user.click(screen.getByRole('option', { name: 'Fixed Amount' }));
    await user.clear(within(specialAllowanceRow!).getByRole('spinbutton', { name: 'Amount' }));
    await user.type(
      within(specialAllowanceRow!).getByRole('spinbutton', { name: 'Amount' }),
      '12000'
    );

    await user.click(within(professionalTaxRow!).getByRole('combobox', { name: 'Calculation' }));
    await user.click(screen.getByRole('option', { name: 'Fixed Amount' }));
    await user.clear(within(professionalTaxRow!).getByRole('spinbutton', { name: 'Amount' }));
    await user.type(within(professionalTaxRow!).getByRole('spinbutton', { name: 'Amount' }), '200');

    await user.click(screen.getAllByRole('button', { name: 'Save draft' })[0]);

    await waitFor(() =>
      expect(mocks.updateDraft).toHaveBeenCalledWith(
        expect.objectContaining({
          rules: [
            expect.objectContaining({
              componentId: 'earning-2',
              semanticType: 'ORDINARY',
              formulaType: 'FIXED_AMOUNT',
              value: 12000,
            }),
            expect.objectContaining({
              componentId: 'deduction-2',
              semanticType: 'ORDINARY',
              formulaType: 'FIXED_AMOUNT',
              value: 200,
            }),
          ],
        })
      )
    );
    expect(within(specialAllowanceRow!).getByRole('spinbutton', { name: 'Amount' })).toBeEnabled();
    expect(within(professionalTaxRow!).getByRole('spinbutton', { name: 'Amount' })).toBeEnabled();
  });

  it.each(['PUBLISHED', 'ARCHIVED'])('hides publish guidance for %s templates', (status) => {
    mocks.template.status = status;
    mocks.template.latest.status = 'PUBLISHED';

    render(<SalaryTemplateEditor templateId="template-1" versionId="version-1" />);

    expect(screen.queryByText(/Formulas configured here override/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Complete these items before publishing:')).not.toBeInTheDocument();
    expect(screen.queryByText('This draft is ready to publish.')).not.toBeInTheDocument();
  });
});
