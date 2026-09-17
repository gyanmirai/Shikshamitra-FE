import type { SalaryTemplate } from 'src/redux/hr/salary-template-api';

import userEvent from '@testing-library/user-event';
import { vi, it, expect, describe, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

import SalaryTemplateSettings from './salary-templates';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  permissions: new Set(['View', 'Add', 'Edit', 'SetDefault', 'Archive']),
  refetch: vi.fn(),
  setDefault: vi.fn(),
  archive: vi.fn(),
  template: {
    id: 'template-1',
    name: 'Flexible Salary',
    description: 'A reusable salary template.',
    status: 'ACTIVE' as 'ACTIVE' | 'NEEDS_SETUP' | 'ARCHIVED',
    isDefault: true,
    activeVersion: 2,
    versionCount: 2,
    updatedAt: '2026-09-15T00:00:00.000Z',
    concurrencyStamp: 'stamp-2',
    editableVersion: {
      id: 'version-2',
      versionNumber: 2,
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
      ],
    },
  } satisfies SalaryTemplate,
}));

vi.mock('react-redux', () => ({ useSelector: () => [], useDispatch: () => vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
}));
vi.mock('src/routes/components', () => ({
  RouterLink: ({ children, ...props }: React.ComponentProps<'a'>) => <a {...props}>{children}</a>,
}));
vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));
vi.mock('src/utils/permissions', () => ({
  hasGrantedPermission: (_permissions: unknown, permission: string) =>
    [...mocks.permissions].some((action) => permission.endsWith(`.${action}`)),
}));
vi.mock('src/components/three-dots-actions', () => ({
  default: ({
    showViewIcon,
    showEditIcon,
    viewLabel,
    editLabel,
    handleViewClick,
    handleEditClick,
  }: any) => (
    <div>
      {showViewIcon ? (
        <button type="button" aria-label={viewLabel} onClick={handleViewClick}>
          View
        </button>
      ) : null}
      {showEditIcon ? (
        <button type="button" aria-label={editLabel} onClick={handleEditClick}>
          Edit
        </button>
      ) : null}
    </div>
  ),
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ tableId, tableTitle, columns, data, rowProps, isLoading }: any) => (
    <section data-testid={tableId} aria-label={tableTitle} data-loading={String(isLoading)}>
      <div data-testid="salary-template-columns">
        {columns.map((column: any) => (
          <span key={column.id}>{column.label}</span>
        ))}
      </div>
      {data.map((row: SalaryTemplate, index: number) => {
        const configuredRowProps = rowProps?.(row, index) || {};
        return (
          <div key={row.id} data-testid={`salary-template-row-${row.id}`} {...configuredRowProps}>
            {columns.map((column: any) => (
              <div key={column.id}>
                {column.render
                  ? column.render((row as any)[column.id], row)
                  : (row as any)[column.id]}
              </div>
            ))}
          </div>
        );
      })}
    </section>
  ),
}));
vi.mock('src/redux/hr/salary-template-api', () => ({
  useGetSalaryTemplatesQuery: () => ({
    data: { items: [mocks.template] },
    isLoading: false,
    isError: false,
    refetch: mocks.refetch,
  }),
  useSetDefaultSalaryTemplateMutation: () => [mocks.setDefault, { isLoading: false }],
  useArchiveSalaryTemplateMutation: () => [mocks.archive, { isLoading: false }],
}));

const editorPath = `/hr/payroll/setting/salary-templates/${mocks.template.id}`;

describe('SalaryTemplateSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.permissions = new Set(['View', 'Add', 'Edit', 'SetDefault', 'Archive']);
    mocks.template.status = 'ACTIVE';
    mocks.template.isDefault = true;
  });

  afterEach(cleanup);

  it('renders one full workspace table with the active-version contract', () => {
    render(<SalaryTemplateSettings />);

    expect(screen.getByTestId('salary-template-table')).toBeVisible();
    expect(screen.getByTestId('salary-template-columns')).toHaveTextContent(
      'TemplateDefaultActive versionComponentsLast updatedStatusActions'
    );
    expect(screen.getByRole('link', { name: 'Flexible Salary' })).toHaveAttribute(
      'href',
      editorPath
    );
    expect(screen.getByText('Active')).toBeVisible();
  });

  it('opens row and Edit actions directly in URL-backed edit mode', async () => {
    const user = userEvent.setup();
    render(<SalaryTemplateSettings />);

    await user.click(screen.getByTestId('salary-template-row-template-1'));
    expect(mocks.push).toHaveBeenLastCalledWith(editorPath);

    mocks.push.mockClear();
    screen.getByTestId('salary-template-row-template-1').focus();
    await user.keyboard('{Enter}');
    expect(mocks.push).toHaveBeenCalledTimes(1);
    expect(mocks.push).toHaveBeenCalledWith(editorPath);

    mocks.push.mockClear();
    await user.click(screen.getByRole('button', { name: 'Edit Flexible Salary' }));
    expect(mocks.push).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('link', { name: 'Flexible Salary' }), { ctrlKey: true });
    expect(mocks.push).toHaveBeenCalledTimes(1);
  });

  it('opens archived and unauthorized templates in read-only mode', async () => {
    const user = userEvent.setup();
    mocks.template.status = 'ARCHIVED';
    render(<SalaryTemplateSettings />);

    await user.click(screen.getByTestId('salary-template-row-template-1'));
    expect(mocks.push).toHaveBeenCalledWith(editorPath);
    expect(screen.getByRole('button', { name: 'View Flexible Salary' })).toBeVisible();

    cleanup();
    mocks.push.mockClear();
    mocks.template.status = 'ACTIVE';
    mocks.permissions = new Set(['View']);
    render(<SalaryTemplateSettings />);
    await user.click(screen.getByTestId('salary-template-row-template-1'));
    expect(mocks.push).toHaveBeenCalledWith(editorPath);
    expect(screen.queryByRole('button', { name: 'Create template' })).not.toBeInTheDocument();
  });

  it('links template creation to the dedicated full-page route', () => {
    render(<SalaryTemplateSettings />);

    expect(screen.getByRole('link', { name: 'Create template' })).toHaveAttribute(
      'href',
      '/hr/payroll/setting/salary-templates/new'
    );
    expect(screen.queryByTestId('salary-template-editor')).not.toBeInTheDocument();
  });
});
