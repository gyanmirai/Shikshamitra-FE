import type { ReportTemplate } from 'src/redux/hr/hrReportingWorkspaceApi';

import { vi, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

import ReportsScreen from '.';

const mocks = vi.hoisted(() => ({
  query: new URLSearchParams(),
  permissions: { canView: true, canBuild: true, canManageTemplates: false },
  catalogue: vi.fn(),
  library: vi.fn(),
  push: vi.fn(),
  published: {
    id: 'school',
    revision: 2,
    publishedRevision: 2,
    canEdit: true,
    definition: { dataSource: 'attendance' },
  },
  draft: {
    id: 'school',
    revision: 3,
    publishedRevision: 2,
    canEdit: true,
    definition: { dataSource: 'attendance' },
  },
}));
vi.mock('next/navigation', () => ({ useSearchParams: () => mocks.query }));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock('./hooks/useHrReportPermissions', () => ({
  useHrReportPermissions: () => mocks.permissions,
}));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading, action }: any) => (
    <header>
      <h1>{heading}</h1>
      {action}
    </header>
  ),
}));
vi.mock('./workspace/ReportLibrary', () => ({
  ReportLibrary: ({ purpose }: any) => <div data-testid="library">{purpose}</div>,
}));
vi.mock('next/dynamic', () => ({
  default: (loader: () => unknown) => {
    const name =
      ['ReportHistory', 'ReportGenerate', 'ReportDesigner', 'ReportRunResult'].find((value) =>
        loader.toString().includes(value)
      ) || 'unknown';
    return (props: { template?: ReportTemplate; backHref?: string }) => (
      <div data-testid={name} data-revision={props.template?.revision} data-back={props.backHref} />
    );
  },
}));
vi.mock('src/redux/hr/hrReportingWorkspaceApi', () => ({
  useGetReportingCatalogueQuery: (...args: unknown[]) => {
    mocks.catalogue(...args);
    return { currentData: [{ id: 'attendance', fields: [] }], isFetching: false };
  },
  useGetReportingLibraryQuery: (params: { edit: boolean }, options: unknown) => {
    mocks.library(params, options);
    return { currentData: [params.edit ? mocks.draft : mocks.published], isFetching: false };
  },
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  mocks.query = new URLSearchParams();
  mocks.permissions = { canView: true, canBuild: true, canManageTemplates: false };
});

it('opens Reports by default without requesting template or designer data', () => {
  render(<ReportsScreen />);
  expect(screen.getByRole('heading', { name: 'Reports' })).toBeVisible();
  expect(screen.getByRole('link', { name: 'Generate report' })).toHaveAttribute(
    'href',
    '/hr/reports/generate'
  );
  expect(screen.getByTestId('ReportHistory')).toBeVisible();
  expect(mocks.catalogue).toHaveBeenCalledWith(undefined, { skip: true });
  expect(mocks.library).toHaveBeenCalledWith({ edit: false }, { skip: true });
});
it('loads editable definitions only for template management', () => {
  render(<ReportsScreen view="templates" />);
  expect(screen.getByTestId('library')).toHaveTextContent('manage');
  expect(screen.getByRole('link', { name: 'Create template' })).toHaveAttribute(
    'href',
    '/hr/reports/templates/new'
  );
  expect(mocks.catalogue).toHaveBeenCalledWith(undefined, { skip: true });
  expect(mocks.library).toHaveBeenCalledWith({ edit: true }, { skip: false });
});
it('chooses from published templates without designer metadata or editing controls', () => {
  render(<ReportsScreen view="choose" />);
  expect(screen.getByTestId('library')).toHaveTextContent('choose');
  expect(screen.queryByRole('link', { name: 'Create template' })).not.toBeInTheDocument();
  expect(mocks.catalogue).toHaveBeenCalledWith(undefined, { skip: true });
  expect(mocks.library).toHaveBeenCalledWith({ edit: false }, { skip: false });
});
it('runs the published revision and preserves chooser context for Back', () => {
  mocks.query = new URLSearchParams('category=Attendance&search=staff&pageSize=25');
  render(<ReportsScreen view="generate" templateId="school" />);
  const form = screen.getByTestId('ReportGenerate');
  expect(form).toHaveAttribute('data-revision', '2');
  expect(form).toHaveAttribute(
    'data-back',
    '/hr/reports/generate?category=Attendance&search=staff&pageSize=25'
  );
});
it('blocks requests and actions when report View is missing', () => {
  mocks.permissions.canView = false;
  render(<ReportsScreen />);
  expect(screen.getByRole('alert')).toHaveTextContent('Report access is required');
  expect(screen.queryByRole('link', { name: 'Generate report' })).not.toBeInTheDocument();
  expect(mocks.library).toHaveBeenCalledWith({ edit: false }, { skip: true });
});
it('keeps View-only users able to generate while hiding template creation', () => {
  mocks.permissions.canBuild = false;
  render(<ReportsScreen view="templates" />);
  expect(screen.queryByRole('link', { name: 'Create template' })).not.toBeInTheDocument();
});
it('provides recovery for an unavailable template', () => {
  render(<ReportsScreen view="generate" templateId="removed" />);
  expect(screen.getByRole('alert')).toHaveTextContent('This template is unavailable');
  expect(screen.getByRole('link', { name: 'Choose another template' })).toHaveAttribute(
    'href',
    '/hr/reports/generate'
  );
});
it('opens a captured result without waiting for the library or catalogue', () => {
  render(<ReportsScreen view="result" runId="captured" />);
  expect(screen.getByTestId('ReportRunResult')).toBeVisible();
  expect(mocks.catalogue).toHaveBeenCalledWith(undefined, { skip: true });
  expect(mocks.library).toHaveBeenCalledWith({ edit: false }, { skip: true });
});

it('decodes a template segment on a hard reload before library lookup', () => {
  render(<ReportsScreen view="generate" templateId="%73chool" />);
  expect(screen.getByTestId('ReportGenerate')).toHaveAttribute('data-revision', '2');
});
it('rejects a malformed template segment instead of opening a new designer', () => {
  render(<ReportsScreen view="design" templateId="%broken" />);
  expect(screen.getByRole('alert')).toHaveTextContent('This template is unavailable');
  expect(screen.queryByTestId('ReportDesigner')).not.toBeInTheDocument();
});
