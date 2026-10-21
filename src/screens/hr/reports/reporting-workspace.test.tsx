import type { ReportTemplate } from 'src/redux/hr/hrReportingWorkspaceApi';

import { vi, it, expect, afterEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { renderWithProviders } from 'src/test/test-utils';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import { ReportLibrary } from './workspace/ReportLibrary';
import { ReportGenerate } from './workspace/ReportGenerate';
import {
  displayReportValue,
  reportListPagination,
  defaultReportParameters,
} from './reporting-workspace-utils';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  generate: vi.fn(),
  archive: vi.fn(),
  query: new URLSearchParams(),
  canBuild: true,
  canDelete: true,
}));
vi.mock('next/navigation', () => ({
  useSearchParams: () => mocks.query,
  useRouter: () => ({ push: mocks.push, replace: mocks.push }),
  usePathname: () => '/hr/reports/templates',
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock('./hooks/useHrReportPermissions', () => ({
  useHrReportPermissions: () => ({
    canBuild: mocks.canBuild,
    canDelete: mocks.canDelete,
    canView: true,
  }),
}));
vi.mock('src/redux/hr/hrReportingWorkspaceApi', () => ({
  useArchiveReportingTemplateMutation: () => [mocks.archive, { isLoading: false }],
  useCreateReportingRunMutation: () => [mocks.generate, { isLoading: false }],
  useGetReportingOptionsQuery: () => ({
    data: {
      departments: [],
      staff: [],
      sections: [],
      staffGroups: [],
      academicYears: [],
      cycles: [],
    },
  }),
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  mocks.query = new URLSearchParams();
  mocks.canBuild = true;
  mocks.canDelete = true;
});
const template: ReportTemplate = {
  id: 'builtin:in-out',
  name: 'Staff in/out register',
  description: 'Daily staff punches',
  category: 'Attendance',
  visibility: 'builtin',
  status: 'Published',
  revision: 1,
  publishedRevision: 1,
  isBuiltIn: true,
  canEdit: false,
  definition: {
    version: 2,
    dataSource: 'attendance',
    layout: 'detail',
    columns: [{ field: 'employeeCode', label: '', format: 'auto' }],
    filters: { match: 'all', conditions: [], groups: [] },
    sorts: [],
    groups: [],
    summaries: [],
    parameters: ['period'],
    defaultPeriod: 'thisMonth',
    dateField: '',
    paperSize: 'A4',
    orientation: 'landscape',
  },
};
function render(component: React.ReactNode) {
  return renderWithProviders(
    <ThemeProvider theme={createTheme(defaultSettings)}>{component}</ThemeProvider>
  );
}

it('keeps template configuration separate from report generation', () => {
  render(<ReportLibrary templates={[template]} />);
  expect(screen.getByRole('textbox', { name: 'Search report templates' })).toBeVisible();
  expect(screen.getByRole('combobox', { name: 'Category' })).toBeVisible();
  expect(screen.queryByRole('button', { name: /^Generate$/ })).not.toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: 'Customize a copy of Staff in/out register' })
  ).toHaveAttribute('href', '/hr/reports/templates/new?copyFrom=builtin%3Ain-out');
  expect(
    screen.queryByRole('link', { name: 'Edit Staff in/out register' })
  ).not.toBeInTheDocument();
  expect(screen.getByText('Published')).toBeVisible();
});

it('offers only published templates in the chooser and carries URL filters into options', () => {
  mocks.query = new URLSearchParams('category=Attendance&search=Staff&pageSize=25');
  render(
    <ReportLibrary
      purpose="choose"
      templates={[
        template,
        { ...template, id: 'draft', name: 'Draft staff report', publishedRevision: 0 },
      ]}
    />
  );
  expect(screen.getByRole('link', { name: 'Choose Staff in/out register' })).toHaveAttribute(
    'href',
    '/hr/reports/generate/builtin%3Ain-out?category=Attendance&search=Staff&pageSize=25'
  );
  expect(screen.queryByText('Draft staff report')).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /Customize/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('columnheader', { name: 'Status' })).not.toBeInTheDocument();
});

it('hides design actions without Build and retains owned edits independently', () => {
  mocks.canBuild = false;
  render(
    <ReportLibrary
      templates={[
        template,
        { ...template, id: 'school', name: 'School report', canEdit: true, isBuiltIn: false },
      ]}
    />
  );
  expect(screen.queryByRole('link', { name: /Customize/ })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Edit School report' })).toHaveAttribute(
    'href',
    '/hr/reports/templates/school/edit'
  );
});

it('restores category, library, search and page size from the URL', () => {
  mocks.query = new URLSearchParams(
    'category=Attendance&library=builtin&search=punches&pageSize=25'
  );
  render(
    <ReportLibrary
      templates={[
        template,
        { ...template, id: 'salary', name: 'Salary register', category: 'Payroll' },
      ]}
    />
  );
  expect(screen.getByRole('textbox', { name: 'Search report templates' })).toHaveValue('punches');
  expect(screen.getByText('Staff in/out register')).toBeVisible();
  expect(screen.queryByText('Salary register')).not.toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: /Rows per page/ })).toHaveTextContent('25');
});

it('validates URL pagination before using it for a server request', () => {
  expect(reportListPagination(new URLSearchParams('page=2&pageSize=25'))).toEqual({
    page: 2,
    pageSize: 25,
  });
  ['-1', 'NaN', 'Infinity', '1.5', '99999999999999'].forEach((value) => {
    expect(reportListPagination(new URLSearchParams(`page=${value}&pageSize=999`))).toEqual({
      page: 0,
      pageSize: 50,
    });
  });
});

it('filters templates by purpose without changing definitions', () => {
  render(
    <ReportLibrary
      templates={[
        template,
        {
          ...template,
          id: 'builtin:salary',
          name: 'Salary register',
          category: 'Payroll',
          description: 'Saved payroll evidence',
        },
      ]}
    />
  );
  fireEvent.change(screen.getByRole('textbox', { name: 'Search report templates' }), {
    target: { value: 'payroll evidence' },
  });
  expect(screen.getByText('Salary register')).toBeVisible();
  expect(screen.queryByText('Staff in/out register')).not.toBeInTheDocument();
});

it('generates two periods from the same revision without sending or mutating its definition', async () => {
  const before = JSON.stringify(template.definition);
  mocks.generate.mockImplementation(() => ({ unwrap: async () => ({ id: 'captured-run' }) }));
  render(<ReportGenerate template={template} />);
  expect(screen.queryByRole('textbox', { name: 'Template name' })).not.toBeInTheDocument();
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Reporting period' }));
  fireEvent.click(screen.getByRole('option', { name: 'Choose month' }));
  fireEvent.change(screen.getByLabelText('Month'), { target: { value: '2026-09' } });
  fireEvent.click(screen.getByRole('button', { name: 'Generate report' }));
  await waitFor(() => expect(mocks.generate).toHaveBeenCalledTimes(1));
  fireEvent.change(screen.getByLabelText('Month'), { target: { value: '2026-10' } });
  fireEvent.click(screen.getByRole('button', { name: 'Generate report' }));
  await waitFor(() => expect(mocks.generate).toHaveBeenCalledTimes(2));
  expect(mocks.generate.mock.calls.map(([input]) => input.parameters.month)).toEqual([
    '2026-09',
    '2026-10',
  ]);
  expect(mocks.generate.mock.calls[0][0]).toEqual({
    templateId: template.id,
    revision: 1,
    parameters: expect.objectContaining({ period: 'month' }),
  });
  expect(mocks.generate.mock.calls[0][0]).not.toHaveProperty('definition');
  expect(JSON.stringify(template.definition)).toBe(before);
});

it('shows actionable generation failures without losing the chosen parameters', async () => {
  mocks.generate.mockImplementation(() => ({
    unwrap: async () => {
      throw Object.assign(new Error('Generation failed'), {
        data: { error: { data: { errors: 'Choose exactly one staff member.' } } },
      });
    },
  }));
  render(<ReportGenerate template={template} />);
  fireEvent.click(screen.getByRole('button', { name: 'Generate report' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Choose exactly one staff member.');
  expect(screen.getByRole('combobox', { name: 'Reporting period' })).toHaveTextContent(
    'This month'
  );
});

it('keeps missing, zero and false values distinct', () => {
  expect(displayReportValue(null, 'money')).toBe('Unavailable');
  expect(displayReportValue(0, 'money')).toBe('0.00');
  expect(displayReportValue(false, 'boolean')).toBe('No');
  expect(displayReportValue('false', 'boolean')).toBe('No');
  expect(defaultReportParameters('lastMonth').period).toBe('lastMonth');
});

it('offers complete months for a monthly register', () => {
  render(
    <ReportGenerate
      template={{ ...template, definition: { ...template.definition, layout: 'attendanceMatrix' } }}
    />
  );
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Reporting period' }));
  expect(screen.getByRole('option', { name: 'Choose month' })).toBeVisible();
  expect(screen.queryByRole('option', { name: /^Today$/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('option', { name: 'Custom dates' })).not.toBeInTheDocument();
});

it('uses month boundaries for a salary statement range', async () => {
  render(
    <ReportGenerate
      template={{
        ...template,
        definition: { ...template.definition, dataSource: 'payroll_statement' },
      }}
    />
  );
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Reporting period' }));
  expect(screen.queryByRole('option', { name: /^Today$/ })).not.toBeInTheDocument();
  await act(async () => {
    fireEvent.click(screen.getByRole('option', { name: 'Custom months' }));
  });
  await act(async () => {
    fireEvent.change(screen.getByLabelText('From month'), { target: { value: '2026-08' } });
  });
  await act(async () => {
    fireEvent.change(screen.getByLabelText('To month'), { target: { value: '2026-10' } });
  });
  expect(screen.getByLabelText('From month')).toHaveValue('2026-08');
  expect(screen.getByLabelText('To month')).toHaveValue('2026-10');
});

it('surfaces archive failures on the management page instead of behind the dialog', async () => {
  mocks.canBuild = false;
  mocks.archive.mockImplementation(() => ({
    unwrap: async () => {
      throw Object.assign(new Error('Archive failed'), {
        data: { error: { message: 'This template changed. Reload and try again.' } },
      });
    },
  }));
  render(
    <ReportLibrary
      templates={[
        { ...template, id: 'owned', name: 'Owned template', canEdit: true, isBuiltIn: false },
      ]}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Archive Owned template' }));
  fireEvent.click(screen.getByRole('button', { name: /^Archive template$/ }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(screen.getByRole('alert')).toHaveTextContent(
    'This template changed. Reload and try again.'
  );
});
