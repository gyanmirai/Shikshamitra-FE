import type { SalaryTemplateRule } from 'src/redux/hr/salary-template-api';

import userEvent from '@testing-library/user-event';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';

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
        { componentId: 'deduction-1', name: 'Loan Recovery', lineKind: 'DEDUCTION' },
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

    await user.click(screen.getByRole('button', { name: 'Publish' }));

    await waitFor(() =>
      expect(mocks.publish).toHaveBeenCalledWith({
        templateId: 'template-1',
        versionId: 'version-1',
      })
    );
    expect(mocks.updateDraft).not.toHaveBeenCalled();
  });
});
