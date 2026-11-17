import type { ICustomizableTableProps } from 'src/components/customizabaleTable/types';

import { it, vi, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import StudentRecordDocuments from './student-record-documents';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  query: 'view=issued',
  ids: vi.fn(),
  issued: vi.fn(),
  options: vi.fn(),
  certificates: vi.fn(),
  download: vi.fn(),
  realTable: false,
  state: {
    globalState: { currentYear: { id: 'year-1' } as { id: string } | undefined },
    auth: {
      permissions: ['View', 'Add'].map((action) => ({
        name: `Students.Records.StudentICard.${action}`,
        isGranted: true,
      })),
    },
  },
}));
vi.mock('react-redux', () => ({
  useSelector: (select: (state: unknown) => unknown) => select(mocks.state),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push, replace: vi.fn() }),
  usePathname: () => '/student/student-i-card',
  useSearchParams: () => new URLSearchParams(mocks.query),
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/custom-select', () => ({
  default: ({
    label,
    value,
    options,
    onChange,
    disabled,
    labelKey,
    valueKey,
  }: {
    label: string;
    value: string;
    options: Record<string, string>[];
    onChange: (value: string) => void;
    disabled: boolean;
    labelKey: string;
    valueKey: string;
  }) => (
    <label htmlFor={`issued-filter-${label}`}>
      {label}
      <select
        id={`issued-filter-${label}`}
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option[valueKey]} value={option[valueKey]}>
            {option[labelKey]}
          </option>
        ))}
      </select>
    </label>
  ),
}));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ action }: { action?: React.ReactNode }) => <>{action}</>,
}));
vi.mock('src/components/student-feedback', () => ({
  StudentScopedFeedback: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  StudentFeedback: ({
    children,
    action,
    toastAction,
    presentation,
  }: {
    children: React.ReactNode;
    action?: React.ReactNode;
    toastAction?: React.ReactNode;
    presentation?: string;
  }) => (
    <div role="alert">
      {children}
      {presentation === 'toast' ? toastAction : action}
    </div>
  ),
}));
vi.mock('src/components/customizabaleTable', async (importOriginal) => {
  const { default: RealTable } =
    await importOriginal<typeof import('src/components/customizabaleTable')>();
  return {
    default: (props: ICustomizableTableProps) => {
      if (mocks.realTable) return <RealTable {...props} />;
      const { noDataText, tableTitle, isLoading, data, columns } = props;
      return (
        <div
          role="table"
          aria-label={typeof tableTitle === 'string' ? tableTitle : undefined}
          aria-busy={isLoading}
        >
          <button type="button" onClick={() => props.onServerPagination?.(2, 25)}>
            Next page
          </button>
          <button type="button" onClick={() => props.onServerSearch?.('Riya')}>
            Search Riya
          </button>
          <button
            type="button"
            onClick={() =>
              props.onServerSort?.('studentName', [{ column: 'studentName', direction: 'asc' }])
            }
          >
            Sort students
          </button>
          {isLoading
            ? 'Loading issued cards'
            : data.length
              ? data.map((row) => (
                  <div key={row.id}>
                    {row.number}
                    {row.studentName}
                    {row.grNumber}
                    {row.classDivision}
                    {columns.find((column) => column.id === 'actions')?.render?.('', row)}
                  </div>
                ))
              : noDataText}
        </div>
      );
    },
  };
});
vi.mock('./records-student-picker', () => ({
  default: ({
    onSelect,
    selectedId,
  }: {
    onSelect: (student: { studentId: string } | null) => void;
    selectedId: string;
  }) => (
    <div data-testid="history-student" data-selected={selectedId}>
      <button type="button" onClick={() => onSelect({ studentId: 'student-2' })}>
        Select student
      </button>
      <button type="button" onClick={() => onSelect(null)}>
        Clear student
      </button>
    </div>
  ),
}));
vi.mock('src/components/customDialog', () => ({
  default: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <section role="dialog">{children}</section> : null,
  DialogScrollContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('./student-icard-builder', () => ({
  default: ({
    academicYearId,
    contextInvalid,
  }: {
    academicYearId?: string;
    contextInvalid?: boolean;
  }) => (
    <div
      data-testid="legacy-builder"
      data-year={academicYearId}
      data-invalid={String(Boolean(contextInvalid))}
    >
      <input aria-label="Retained builder draft" defaultValue="Draft" />
    </div>
  ),
}));
vi.mock('./record-document-templates', () => ({ default: () => null }));
vi.mock('./components/record-document-filters', () => ({ default: () => null }));
vi.mock('./student-certificate-workspace', () => ({ default: () => null }));
vi.mock('src/redux/student/records/student-record-transitions-api', () => ({
  useGetStudentRecordTransitionsQuery: () => ({ currentData: { items: [] } }),
}));
vi.mock('src/redux/student/records/student-record-documents-api', () => ({
  useGetRecordIdHistoryQuery: mocks.ids,
  useGetRecordIssuedIdsQuery: mocks.issued,
  useGetRecordCertificateHistoryQuery: mocks.certificates,
  useIssueRecordIdsMutation: () => [vi.fn(), {}],
  usePreviewRecordIdsMutation: () => [vi.fn(), {}],
  useVoidRecordDocumentMutation: () => [vi.fn(), {}],
  useReprintRecordDocumentMutation: () => [vi.fn(), {}],
  useIssueRecordCertificateMutation: () => [vi.fn(), {}],
  useDownloadRecordDocumentMutation: () => [mocks.download, {}],
  usePreviewRecordCertificateMutation: () => [vi.fn(), {}],
  useDuplicateRecordCertificateMutation: () => [vi.fn(), {}],
  downloadRecordPdf: vi.fn(),
}));
vi.mock('src/redux/student/records/student-records-api', () => ({
  useGetStudentRecordsDirectoryOptionsQuery: mocks.options,
}));

const academicOptions = {
  academicYears: [{ id: 'year-1', name: '2026–27' }],
  boards: [
    { id: 'board-1', name: 'Board One' },
    { id: 'board-2', name: 'Board Two' },
  ],
  mediums: [
    { id: 'medium-1', name: 'English', parentId: 'board-1' },
    { id: 'medium-2', name: 'Hindi', parentId: 'board-1' },
    { id: 'medium-3', name: 'Gujarati', parentId: 'board-2' },
  ],
  standards: [
    { id: 'class-1', name: 'Class One', parentId: 'medium-1' },
    { id: 'class-2', name: 'Class Two', parentId: 'medium-1' },
  ],
  divisions: [
    { id: 'div-1', name: 'A', parentId: 'class-1' },
    { id: 'div-2', name: 'B', parentId: 'class-2' },
  ],
};

const card = (overrides = {}) => ({
  id: 'card-1',
  studentId: 'student-1',
  studentName: 'Riya Patel',
  grNumber: 'GR-001',
  standardName: 'Class One',
  divisionName: 'A',
  cardNumber: 'ID-0001',
  status: 'Issued',
  issuedAt: '2026-11-16T10:00:00Z',
  ...overrides,
});

const pushedParams = () =>
  new URL(mocks.push.mock.calls.at(-1)![0], 'http://localhost').searchParams;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.query = 'view=issued';
  mocks.realTable = false;
  mocks.state.auth.permissions = ['View', 'Add'].map((action) => ({
    name: `Students.Records.StudentICard.${action}`,
    isGranted: true,
  }));
  mocks.ids.mockReturnValue({ currentData: [] });
  mocks.issued.mockReturnValue({ currentData: { items: [], totalCount: 0 } });
  mocks.options.mockReturnValue({ currentData: academicOptions });
  mocks.certificates.mockReturnValue({ currentData: [] });
  mocks.download.mockReturnValue({ unwrap: async () => new Blob() });
  mocks.state.globalState.currentYear = { id: 'year-1' };
});

const history = () =>
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentRecordDocuments fixedKind="ids" />
    </ThemeProvider>
  );

it('shows all issued cards with academic filters and ignores the legacy student parameter', () => {
  mocks.query = 'view=issued&student=student-1';
  mocks.issued.mockReturnValue({ currentData: { items: [card()], totalCount: 1 } });
  history();
  expect(screen.queryByTestId('history-student')).not.toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: 'Board' })).toHaveValue('board-1');
  expect(screen.getByRole('combobox', { name: 'Medium' })).toHaveValue('medium-1');
  expect(screen.getByRole('combobox', { name: 'Class' })).toHaveValue('all');
  expect(screen.getByRole('combobox', { name: 'Division' })).toHaveValue('all');
  expect(screen.getByRole('combobox', { name: 'Division' })).toBeDisabled();
  expect(screen.getByText(/Riya Patel/)).toBeVisible();
  expect(screen.getByText(/GR-001/)).toBeVisible();
  expect(screen.getByText(/Class One.*A/)).toBeVisible();
  expect(screen.getByRole('link', { name: 'View templates' })).toHaveAttribute(
    'href',
    '/student/student-i-card'
  );
  expect(screen.queryByRole('tab', { name: 'Certificates' })).not.toBeInTheDocument();
  expect(mocks.options).toHaveBeenCalledWith({ academicYearId: 'year-1' }, { skip: false });
  expect(mocks.issued).toHaveBeenLastCalledWith(
    expect.objectContaining({
      academicYearId: 'year-1',
      boardId: 'board-1',
      mediumId: 'medium-1',
      skipCount: 0,
      maxResultCount: 25,
      sorting: 'issuedAt desc',
    }),
    { skip: false }
  );
  expect(mocks.ids).toHaveBeenCalledWith('student-1', { skip: true });
  expect(mocks.certificates).toHaveBeenCalledWith('student-1', { skip: true });
});

it('waits for academic options instead of making an unscoped issued-card request', () => {
  mocks.options.mockReturnValue({ isLoading: true, isFetching: true });
  history();
  expect(mocks.issued).toHaveBeenLastCalledWith(expect.anything(), { skip: true });
  expect(screen.queryByText('Select a student to see issued cards.')).not.toBeInTheDocument();
});

it('clears descendant filters and resets pagination when a parent changes', () => {
  mocks.query =
    'view=issued&board=board-1&medium=medium-1&class=class-1&division=div-1&page=3&student=student-1';
  history();
  expect(screen.getByRole('combobox', { name: 'Division' })).toBeEnabled();
  expect(screen.queryByRole('option', { name: 'B' })).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole('combobox', { name: 'Class' }), {
    target: { value: 'class-2' },
  });
  expect(pushedParams().get('class')).toBe('class-2');
  expect(pushedParams().has('division')).toBe(false);
  expect(pushedParams().get('page') ?? '0').toBe('0');
  expect(pushedParams().has('student')).toBe(false);
  fireEvent.change(screen.getByRole('combobox', { name: 'Medium' }), {
    target: { value: 'medium-2' },
  });
  expect(pushedParams().has('class')).toBe(false);
  expect(pushedParams().has('division')).toBe(false);
  fireEvent.change(screen.getByRole('combobox', { name: 'Board' }), {
    target: { value: 'board-2' },
  });
  expect(pushedParams().has('medium')).toBe(false);
  expect(pushedParams().has('class')).toBe(false);
  expect(pushedParams().has('division')).toBe(false);
});

it('passes URL pagination, search, sorting, class and division into the issued-card query', () => {
  mocks.query =
    'view=issued&board=board-1&medium=medium-1&class=class-1&division=div-1&page=2&pageSize=50&search=Riya&sort=studentName%20asc';
  history();
  expect(mocks.issued).toHaveBeenLastCalledWith(
    expect.objectContaining({
      academicYearId: 'year-1',
      boardId: 'board-1',
      mediumId: 'medium-1',
      standardId: 'class-1',
      divisionId: 'div-1',
      search: 'Riya',
      sorting: 'studentName asc',
      skipCount: 100,
      maxResultCount: 50,
    }),
    { skip: false }
  );
});

it('uses server callbacks for pagination, search and sorting', () => {
  mocks.query = 'view=issued&page=3&student=student-1';
  history();
  fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
  expect(pushedParams().get('page')).toBe('1');
  expect(pushedParams().get('pageSize')).toBe('25');
  expect(pushedParams().has('student')).toBe(false);
  fireEvent.click(screen.getByRole('button', { name: 'Search Riya' }));
  expect(pushedParams().get('search')).toBe('Riya');
  expect(pushedParams().get('page') ?? '0').toBe('0');
  fireEvent.click(screen.getByRole('button', { name: 'Sort students' }));
  expect(pushedParams().get('sort')).toBe('studentName asc');
  expect(pushedParams().get('page') ?? '0').toBe('0');
});

it('does not request cards for a missing academic year', () => {
  mocks.state.globalState.currentYear = { id: '' };
  history();
  expect(mocks.options).toHaveBeenLastCalledWith({ academicYearId: '' }, { skip: true });
  expect(mocks.issued).toHaveBeenLastCalledWith(expect.anything(), { skip: true });
});

it('does not request cards for an invalid academic scope', () => {
  mocks.query = 'view=issued&class=class-2&division=div-1';
  history();
  expect(mocks.issued).toHaveBeenLastCalledWith(expect.anything(), { skip: true });
});

it('loads a cached academic year when resetting scope leaves the URL unchanged', async () => {
  mocks.query = 'view=issued&page=0';
  const view = history();
  mocks.state.globalState.currentYear = { id: 'year-2' };
  mocks.options.mockReturnValue({
    currentData: {
      ...academicOptions,
      academicYears: [{ id: 'year-2', name: '2027–28' }],
    },
  });
  view.rerender(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentRecordDocuments fixedKind="ids" />
    </ThemeProvider>
  );
  await waitFor(() =>
    expect(mocks.issued).toHaveBeenLastCalledWith(
      expect.objectContaining({ academicYearId: 'year-2', skipCount: 0 }),
      { skip: false }
    )
  );
  expect(mocks.push).not.toHaveBeenCalled();
});

it('preserves academic deep links when the global year first hydrates', async () => {
  mocks.state.globalState.currentYear = undefined;
  mocks.query = 'view=issued&board=board-1&medium=medium-1&class=class-1&division=div-1';
  mocks.options.mockReturnValue({});
  const view = history();
  expect(mocks.issued).toHaveBeenLastCalledWith(expect.anything(), { skip: true });
  mocks.state.globalState.currentYear = { id: 'year-1' };
  mocks.options.mockReturnValue({ currentData: academicOptions });
  view.rerender(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentRecordDocuments fixedKind="ids" />
    </ThemeProvider>
  );
  await waitFor(() =>
    expect(mocks.issued).toHaveBeenLastCalledWith(
      expect.objectContaining({
        academicYearId: 'year-1',
        standardId: 'class-1',
        divisionId: 'div-1',
      }),
      { skip: false }
    )
  );
  expect(screen.getByRole('combobox', { name: 'Class' })).toHaveValue('class-1');
  expect(screen.getByRole('combobox', { name: 'Division' })).toHaveValue('div-1');
  expect(mocks.push).not.toHaveBeenCalled();
});

it('preserves the real table page across server pagination and resets it for a new scope', () => {
  mocks.realTable = true;
  mocks.issued.mockReturnValue({
    currentData: {
      items: Array.from({ length: 25 }, (_, index) =>
        card({ id: `card-${index}`, cardNumber: `ID-${index}` })
      ),
      totalCount: 26,
    },
  });
  const view = history();
  fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
  expect(pushedParams().get('page')).toBe('1');
  mocks.query = 'view=issued&page=1&pageSize=25';
  mocks.issued.mockReturnValue({
    currentData: { items: [card({ cardNumber: 'PAGE-TWO' })], totalCount: 26 },
  });
  view.rerender(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentRecordDocuments fixedKind="ids" />
    </ThemeProvider>
  );
  expect(screen.getByText('PAGE-TWO')).toBeVisible();
  expect(screen.getByText('26–26 of 26')).toBeVisible();
  mocks.query = 'view=issued&class=class-2';
  mocks.issued.mockReturnValue({
    currentData: { items: [card({ cardNumber: 'CLASS-TWO' })], totalCount: 1 },
  });
  view.rerender(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentRecordDocuments fixedKind="ids" />
    </ThemeProvider>
  );
  expect(screen.getByText('CLASS-TWO')).toBeVisible();
  expect(screen.getByText('1–1 of 1')).toBeVisible();
});

it('keeps issued-card history available with View access without offering issuance', () => {
  mocks.state.auth.permissions = [{ name: 'Students.Records.StudentICard.View', isGranted: true }];
  history();
  expect(screen.getByRole('combobox', { name: 'Board' })).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Create I-Card' })).not.toBeInTheDocument();
});

it('does not load or show card history without the existing I-Card View grant', () => {
  mocks.state.auth.permissions = [];
  mocks.query = 'view=issued&student=student-1';
  history();
  expect(mocks.issued).toHaveBeenLastCalledWith(expect.anything(), { skip: true });
  expect(screen.queryByTestId('history-student')).not.toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent('You do not have permission');
});

it('shows loading for a new academic scope without leaking previous scope cards', () => {
  mocks.query = 'view=issued&class=class-2';
  mocks.issued.mockReturnValue({
    data: { items: [card({ cardNumber: 'OLD-001' })], totalCount: 1 },
    isFetching: true,
  });
  history();
  expect(screen.getByRole('table', { name: 'Issued cards' })).toHaveAttribute('aria-busy', 'true');
  expect(screen.queryByText('OLD-001')).not.toBeInTheDocument();
  expect(
    screen.queryByText('No issued cards match your search or academic filters.')
  ).not.toBeInTheDocument();
});

it('distinguishes a failed history request from successful empty history and offers Retry', () => {
  const refetch = vi.fn();
  mocks.query = 'view=issued&student=student-1';
  mocks.issued.mockReturnValue({ isError: true, refetch });
  history();
  expect(
    screen.queryByText('No issued cards match your search or academic filters.')
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(refetch).toHaveBeenCalledOnce();
});

it('shows successful empty history for the selected academic scope', () => {
  mocks.query = 'view=issued&student=student-1';
  history();
  expect(screen.getByText('No issued cards match your search or academic filters.')).toBeVisible();
});

it('keeps download and reason-required Reprint/Void actions on the existing ID endpoints', async () => {
  mocks.query = 'view=issued&student=student-1';
  mocks.issued.mockReturnValue({ currentData: { items: [card()], totalCount: 1 } });
  history();
  expect(screen.getByRole('button', { name: 'Reprint ID-0001' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Void ID-0001' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Download ID-0001' }));
  await waitFor(() => expect(mocks.download).toHaveBeenCalledWith({ kind: 'ids', id: 'card-1' }));
  fireEvent.click(screen.getByRole('button', { name: 'Reprint ID-0001' }));
  expect(screen.getByRole('dialog')).toBeVisible();
  expect(screen.getByRole('textbox', { name: 'Reason' })).toBeRequired();
});

it('disables all actions for a voided card', () => {
  mocks.query = 'view=issued&student=student-1';
  mocks.issued.mockReturnValue({
    currentData: { items: [card({ status: 'Voided' })], totalCount: 1 },
  });
  history();
  ['Download', 'Reprint', 'Void'].forEach((action) => {
    expect(screen.getByRole('button', { name: `${action} ID-0001` })).toBeDisabled();
  });
});

it('captures the global year for the retained history builder and keeps its draft on context changes', () => {
  const view = render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentRecordDocuments fixedKind="ids" />
    </ThemeProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'Create I-Card' }));
  expect(screen.getByTestId('legacy-builder')).toHaveAttribute('data-year', 'year-1');
  fireEvent.change(screen.getByRole('textbox', { name: 'Retained builder draft' }), {
    target: { value: 'Still editing' },
  });
  mocks.state.globalState.currentYear = { id: 'year-2' };
  view.rerender(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentRecordDocuments fixedKind="ids" />
    </ThemeProvider>
  );
  expect(screen.getByTestId('legacy-builder')).toHaveAttribute('data-year', 'year-1');
  expect(screen.getByTestId('legacy-builder')).toHaveAttribute('data-invalid', 'true');
  expect(screen.getByRole('textbox', { name: 'Retained builder draft' })).toHaveValue(
    'Still editing'
  );
});
