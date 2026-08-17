import type { SalaryTemplate } from 'src/redux/hr/salary-template-api';

import { hrPaths } from 'src/constants/hr-menus';
import userEvent from '@testing-library/user-event';
import { vi, it, expect, describe, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import SalaryTemplateSettings from './salary-templates';

const mocks = vi.hoisted(() => ({
  query: '',
  pathname: '/hr/payroll/setting/salary-templates/',
  push: vi.fn(),
  permissions: new Set(['View', 'Add', 'Edit', 'Publish', 'SetDefault', 'Archive']),
  refetch: vi.fn(),
  setDefault: vi.fn(),
  archive: vi.fn(),
  clone: vi.fn(),
  createTemplate: vi.fn(),
  createVersion: vi.fn(),
  template: {
    id: 'template-1',
    name: 'Flexible Salary',
    description: 'A configurable tenant salary template.',
    status: 'PUBLISHED',
    isDefault: true,
    latestVersion: 1,
    publishedVersion: 1,
    latest: {
      id: 'version-1',
      versionNumber: 1,
      status: 'PUBLISHED',
      rules: [
        {
          code: 'BASIC',
          componentId: 'earning-1',
          lineKind: 'EARNING',
          semanticType: 'BASIC',
          formulaType: 'PERCENTAGE_OF_GROSS',
          value: 60,
          displayOrder: 0,
        },
      ],
    },
    published: null,
  } as SalaryTemplate,
}));

vi.mock('react-redux', () => ({ useSelector: () => [], useDispatch: () => vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
  usePathname: () => mocks.pathname,
  useSearchParams: () => new URLSearchParams(mocks.query),
}));
vi.mock('src/routes/components', () => ({
  RouterLink: ({ children, ...props }: React.ComponentProps<'a'>) => <a {...props}>{children}</a>,
}));
vi.mock('src/utils/permissions', () => ({
  hasGrantedPermission: (_permissions: unknown, permission: string) =>
    [...mocks.permissions].some((action) => permission.endsWith(`.${action}`)),
}));
vi.mock('src/components/three-dots-actions', () => ({
  default: ({
    showViewIcon,
    showEditIcon,
    showThreeDots,
    viewLabel,
    editLabel,
    moreLabel,
    handleViewClick,
    handleEditClick,
  }: any) => (
    <div>
      {showViewIcon ? (
        <button
          type="button"
          aria-label={viewLabel}
          onClick={(event) => {
            event.stopPropagation();
            handleViewClick(event);
          }}
        >
          View
        </button>
      ) : null}
      {showEditIcon ? (
        <button
          type="button"
          aria-label={editLabel}
          onClick={(event) => {
            event.stopPropagation();
            handleEditClick(event);
          }}
        >
          Edit
        </button>
      ) : null}
      {showThreeDots ? (
        <button type="button" aria-label={moreLabel} onClick={(event) => event.stopPropagation()}>
          More
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
  useCloneSalaryTemplateMutation: () => [mocks.clone, { isLoading: false }],
  useCreateSalaryTemplateMutation: () => [mocks.createTemplate, { isLoading: false }],
  useCreateSalaryTemplateVersionMutation: () => [mocks.createVersion, { isLoading: false }],
}));

const editorPath = () =>
  hrPaths.payroll.settings.salaryTemplateEditor(mocks.template.id, mocks.template.latest.id);

describe('SalaryTemplateSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.query = '';
    mocks.permissions = new Set(['View', 'Add', 'Edit', 'Publish', 'SetDefault', 'Archive']);
    mocks.template.status = 'PUBLISHED';
    mocks.template.isDefault = true;
    mocks.template.latest.status = 'PUBLISHED';
    mocks.createVersion.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue(mocks.template),
    });
  });

  afterEach(cleanup);

  it('defaults invalid or missing view state to the standard table', () => {
    render(<SalaryTemplateSettings />);

    expect(screen.queryByText(/Build templates from your active earning/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Template' })).toBeVisible();
    expect(screen.getByTestId('salary-template-table')).toBeVisible();
    expect(screen.getByTestId('salary-template-columns')).toHaveTextContent(
      'TemplateDescriptionLatest VersionComponentsStatusActions'
    );
    expect(screen.getByRole('link', { name: 'Flexible Salary' })).toHaveAttribute(
      'href',
      editorPath()
    );

    cleanup();
    mocks.query = 'view=unknown';
    render(<SalaryTemplateSettings />);

    expect(screen.getByTestId('salary-template-table')).toBeVisible();
  });

  it('updates URL-backed view state while preserving other query parameters', async () => {
    const user = userEvent.setup();
    mocks.query = 'scope=active';
    const { unmount } = render(<SalaryTemplateSettings />);

    await user.click(screen.getByRole('button', { name: 'Card view' }));
    expect(mocks.push).toHaveBeenCalledWith(
      '/hr/payroll/setting/salary-templates/?scope=active&view=cards'
    );

    unmount();
    mocks.push.mockClear();
    mocks.query = 'scope=active&view=cards';
    render(<SalaryTemplateSettings />);

    await user.click(screen.getByRole('button', { name: 'Table view' }));
    expect(mocks.push).toHaveBeenCalledWith('/hr/payroll/setting/salary-templates/?scope=active');
  });

  it('opens details from table rows and view actions without double navigation', async () => {
    const user = userEvent.setup();
    render(<SalaryTemplateSettings />);

    await user.click(screen.getByTestId('salary-template-row-template-1'));
    expect(mocks.push).toHaveBeenCalledTimes(1);
    expect(mocks.push).toHaveBeenCalledWith(editorPath());

    mocks.push.mockClear();
    screen.getByTestId('salary-template-row-template-1').focus();
    await user.keyboard('{Enter}');
    expect(mocks.push).toHaveBeenCalledTimes(1);
    expect(mocks.push).toHaveBeenCalledWith(editorPath());

    mocks.push.mockClear();
    await user.click(screen.getByRole('button', { name: 'View Flexible Salary' }));
    expect(mocks.push).toHaveBeenCalledTimes(1);
    expect(mocks.push).toHaveBeenCalledWith(editorPath());

    mocks.push.mockClear();
    fireEvent.click(screen.getByRole('link', { name: 'Flexible Salary' }), { ctrlKey: true });
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it('renders a keyboard-accessible card link and keeps card actions separate', async () => {
    const user = userEvent.setup();
    mocks.query = 'view=cards';
    mocks.template.status = 'DRAFT';
    mocks.template.isDefault = false;
    mocks.template.latest.status = 'DRAFT';
    render(<SalaryTemplateSettings />);

    expect(screen.queryByTestId('salary-template-table')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open Flexible Salary' })).toHaveAttribute(
      'href',
      editorPath()
    );

    await user.click(screen.getByRole('button', { name: 'Edit draft' }));
    expect(mocks.push).toHaveBeenCalledTimes(1);
    expect(mocks.push).toHaveBeenCalledWith(editorPath());
  });

  it('preserves New draft navigation and Clone dialog defaults in Card view', async () => {
    const user = userEvent.setup();
    mocks.query = 'view=cards';
    render(<SalaryTemplateSettings />);

    await user.click(screen.getByRole('button', { name: 'New draft' }));
    await waitFor(() => expect(mocks.createVersion).toHaveBeenCalledWith('template-1'));
    expect(mocks.push).toHaveBeenCalledWith(editorPath());

    await user.click(screen.getByRole('button', { name: 'Clone' }));
    expect(screen.getByRole('textbox', { name: 'Template name' })).toHaveValue(
      'Flexible Salary Copy'
    );
  });

  it('keeps mutation controls hidden for View-only users', () => {
    mocks.query = 'view=cards';
    mocks.permissions = new Set(['View']);
    mocks.template.status = 'DRAFT';
    mocks.template.isDefault = false;
    mocks.template.latest.status = 'DRAFT';
    render(<SalaryTemplateSettings />);

    expect(screen.getByRole('link', { name: 'Open Flexible Salary' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Create Template' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit draft' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Review draft' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clone' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Archive' })).not.toBeInTheDocument();
  });

  it('lets a Publish-only user review a draft without exposing edit actions', () => {
    mocks.query = 'view=cards';
    mocks.permissions = new Set(['View', 'Publish']);
    mocks.template.status = 'DRAFT';
    mocks.template.isDefault = false;
    mocks.template.latest.status = 'DRAFT';
    render(<SalaryTemplateSettings />);

    expect(screen.getByRole('button', { name: 'Review draft' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Edit draft' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Create Template' })).not.toBeInTheDocument();
  });
});
