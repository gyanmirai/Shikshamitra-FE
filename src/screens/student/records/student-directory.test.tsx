import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { screen, within, fireEvent, render as renderComponent } from '@testing-library/react';

import StudentDirectory from './student-directory';

const render = (element: React.ReactElement) =>
  renderComponent(<ThemeProvider theme={createTheme(defaultSettings)}>{element}</ThemeProvider>);

const mocks = vi.hoisted(() => ({
  params: new URLSearchParams(),
  push: vi.fn(),
  query: {} as any,
  input: {} as any,
  table: {} as any,
  header: {} as any,
  currentYear: 'year-1',
  permissions: [] as { name: string; isGranted: boolean }[],
  optionsInput: {} as any,
  queryOptions: {} as any,
  optionsQueryOptions: {} as any,
  options: {} as any,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
  usePathname: () => '/student/records/directory',
  useSearchParams: () => mocks.params,
}));
vi.mock('react-redux', () => ({
  useSelector: (select: any) =>
    select({
      globalState: {
        currentYear: mocks.currentYear
          ? { id: mocks.currentYear, name: '2026–27', boards: [] }
          : null,
      },
      auth: { permissions: mocks.permissions },
    }),
}));
vi.mock('src/routes/components', () => ({
  RouterLink: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: (props: any) => {
    mocks.header = props;
    const { heading, action } = props;
    return (
      <header>
        <h1>{heading}</h1>
        {action}
      </header>
    );
  },
}));
vi.mock('src/components/custom-select', () => ({
  default: ({
    label,
    value,
    options,
    onChange,
    labelKey = 'label',
    valueKey = 'value',
    disabled,
  }: any) => (
    <label htmlFor={label}>
      {label}
      <select
        id={label}
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option: any) => (
          <option key={option[valueKey]} value={option[valueKey]}>
            {option[labelKey]}
          </option>
        ))}
      </select>
    </label>
  ),
}));
vi.mock('./legacy-record-entry', () => ({
  default: () => (
    <div role="dialog" aria-label="Historical entry">
      Historical entry
    </div>
  ),
}));
vi.mock('src/redux/student/records/student-records-api', () => ({
  useGetStudentRecordsDirectoryOptionsQuery: (input: any, options: any) => {
    mocks.optionsInput = input;
    mocks.optionsQueryOptions = options;
    return mocks.options;
  },
  useGetStudentRecordsDirectoryQuery: (input: any, options: any) => {
    mocks.input = input;
    mocks.queryOptions = options;
    return mocks.query;
  },
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: (props: any) => {
    mocks.table = props;
    return (
      <section aria-label="Student List table">
        <button type="button" onClick={() => props.onServerSearch('Riya')}>
          Search Riya
        </button>
        <button type="button" onClick={() => props.onServerPagination(2, 25)}>
          Next page
        </button>
        <button type="button" onClick={() => props.onServerPagination(2, 50)}>
          Change page size
        </button>
        <button type="button" onClick={() => props.onServerSort('name', [])}>
          Clear sorting
        </button>
        {props.errorContent ||
          (props.isLoading ? (
            <span>Loading student rows</span>
          ) : props.data.length ? (
            props.data.map((row: any) => (
              <div key={row.studentId}>
                {props.columns[0].render(null, row)}
                {props.columns.at(-1).render(null, row)}
              </div>
            ))
          ) : (
            props.noDataText
          ))}
      </section>
    );
  },
}));

const pushedParams = () =>
  Object.fromEntries(new URL(mocks.push.mock.calls.at(-1)![0], 'http://localhost').searchParams);

beforeEach(() => {
  vi.clearAllMocks();
  mocks.params = new URLSearchParams();
  mocks.currentYear = 'year-1';
  mocks.permissions = [];
  mocks.query = {
    currentData: {
      totalCount: 1,
      items: [
        {
          id: 'student-1',
          studentId: 'student-1',
          firstName: 'Riya',
          lastName: 'Shah',
          status: 6,
          standardName: 'Class 1',
          divisionName: 'A',
        },
      ],
    },
    isError: false,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  };
  mocks.options = {
    currentData: {
      academicYears: [{ id: 'year-1', name: '2026–27' }],
      boards: [
        { id: 'board-1', name: 'CBSE' },
        { id: 'board-2', name: 'State board' },
      ],
      mediums: [{ id: 'medium-1', name: 'English', parentId: 'board-1' }],
      standards: [{ id: 'class-1', name: 'Class 1', parentId: 'medium-1' }],
      divisions: [{ id: 'division-1', name: 'A', parentId: 'class-1' }],
    },
    isError: false,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  };
});

describe('Student List workspace', () => {
  it('restores the dashboard year and preserves it while paging the exact scoped population', () => {
    mocks.params = new URLSearchParams(
      'dashboard=directory&year=year-2&board=board-1&class=class-1&division=division-1'
    );
    render(<StudentDirectory />);
    expect(mocks.input).toMatchObject({
      academicYearId: 'year-2',
      boardId: 'board-1',
      standardId: 'class-1',
      divisionId: 'division-1',
    });
    expect(mocks.optionsInput).toEqual({ academicYearId: 'year-2' });
    mocks.table.onServerPagination(1, 25);
    expect(pushedParams()).toMatchObject({
      dashboard: 'directory',
      year: 'year-2',
      board: 'board-1',
      class: 'class-1',
      division: 'division-1',
      page: '1',
    });
  });
  it('restores server table context and preserves it in both native profile links', () => {
    mocks.params = new URLSearchParams(
      'population=Former&year=all&page=2&pageSize=25&search=Shah&sort=grNumber%20desc&board=board-1'
    );
    render(<StudentDirectory />);
    expect(mocks.input).toMatchObject({
      population: 'Former',
      academicYearId: 'year-1',
      skipCount: 50,
      maxResultCount: 25,
      search: 'Shah',
      sorting: 'grNumber desc',
      boardId: 'board-1',
    });
    expect(mocks.table).toMatchObject({
      tableTitle: 'Student List',
      serverSidePagination: true,
      serverSideSearch: true,
      serverSideSort: true,
      page: 2,
      rowsPerPage: 25,
    });
    ['Riya Shah', 'View profile for Riya Shah'].forEach((label) => {
      const url = new URL(
        screen.getByRole('link', { name: label }).getAttribute('href')!,
        'http://localhost'
      );
      expect(url.pathname).toBe('/student/profile');
      expect(Object.fromEntries(url.searchParams)).toEqual({
        population: 'Former',
        page: '2',
        pageSize: '25',
        search: 'Shah',
        sort: 'grNumber desc',
        board: 'board-1',
        student: 'student-1',
      });
    });
  });
  it('shows only academic selectors in the compact row and keeps description in the shared tooltip', () => {
    render(<StudentDirectory />);
    expect(screen.getAllByRole('combobox').map((item) => item.getAttribute('aria-label'))).toEqual([
      'Board',
      'Medium',
      'Class',
      'Division',
    ]);
    expect(screen.queryByLabelText('Students')).not.toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(mocks.header.descriptionDisplay).toBe('tooltip');
    expect(screen.queryByText(mocks.header.description)).not.toBeInTheDocument();
  });
  it('keeps Active/Former inside Filters and applies the population draft without dropping context', () => {
    mocks.params = new URLSearchParams('board=board-1&search=Shah&sort=grNumber%20desc&page=2');
    render(<StudentDirectory />);
    fireEvent.click(screen.getByRole('button', { name: /^Filters/ }));
    const panel = screen.getByRole('dialog', { name: 'Filter students' });
    expect(within(panel).getByLabelText('Students')).toHaveValue('Active');
    expect(within(panel).queryByLabelText('Board')).not.toBeInTheDocument();
    fireEvent.change(within(panel).getByLabelText('Students'), { target: { value: 'Former' } });
    expect(mocks.push).not.toHaveBeenCalled();
    fireEvent.click(within(panel).getByRole('button', { name: 'Apply filters' }));
    expect(pushedParams()).toEqual({
      board: 'board-1',
      search: 'Shah',
      sort: 'grNumber desc',
      page: '0',
      population: 'Former',
    });
  });
  it('discards canceled population edits and resets only population to Active', () => {
    mocks.params = new URLSearchParams('population=Former&board=board-1&search=Shah');
    render(<StudentDirectory />);
    fireEvent.click(screen.getByRole('button', { name: /^Filters/ }));
    fireEvent.change(screen.getByLabelText('Students'), { target: { value: 'Active' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mocks.push).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /^Filters/ }));
    expect(screen.getByLabelText('Students')).toHaveValue('Former');
    fireEvent.click(screen.getByRole('button', { name: 'Reset defaults' }));
    expect(screen.getByLabelText('Students')).toHaveValue('Active');
    fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));
    expect(pushedParams()).toEqual({ board: 'board-1', search: 'Shah', page: '0' });
  });
  it('changes academic scope immediately and clears dependent choices while preserving population and search', () => {
    mocks.params = new URLSearchParams(
      'population=Former&board=board-1&medium=medium-1&class=class-1&division=division-1&search=Shah&page=2'
    );
    render(<StudentDirectory />);
    fireEvent.change(screen.getByLabelText('Board'), { target: { value: 'board-2' } });
    expect(pushedParams()).toEqual({
      population: 'Former',
      board: 'board-2',
      search: 'Shah',
      page: '0',
    });
  });
  it('keeps pagination, search and sort server-backed and resets page only when needed', () => {
    mocks.params = new URLSearchParams(
      'population=Former&board=board-1&year=all&page=2&sort=name%20desc'
    );
    render(<StudentDirectory />);
    expect(mocks.table.sorts).toEqual([{ column: 'name', direction: 'desc' }]);
    fireEvent.click(screen.getByRole('button', { name: 'Search Riya' }));
    expect(pushedParams()).toEqual({
      population: 'Former',
      board: 'board-1',
      page: '0',
      sort: 'name desc',
      search: 'Riya',
    });
    fireEvent.click(screen.getByRole('button', { name: 'Change page size' }));
    expect(pushedParams()).toEqual({
      population: 'Former',
      board: 'board-1',
      page: '0',
      sort: 'name desc',
      pageSize: '50',
    });
    fireEvent.click(screen.getByRole('button', { name: 'Clear sorting' }));
    expect(pushedParams()).toEqual({ population: 'Former', board: 'board-1', page: '0' });
  });
  it('uses the global year for both queries and skips incomplete context', () => {
    mocks.params = new URLSearchParams('year=old-year');
    const { rerender } = render(<StudentDirectory />);
    expect(mocks.input.academicYearId).toBe('year-1');
    expect(mocks.optionsInput.academicYearId).toBe('year-1');
    expect(screen.queryByLabelText('Academic year')).not.toBeInTheDocument();
    mocks.currentYear = '';
    rerender(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <StudentDirectory />
      </ThemeProvider>
    );
    expect(mocks.queryOptions.skip).toBe(true);
    expect(mocks.optionsQueryOptions.skip).toBe(true);
    expect(screen.getByText('Select an academic year to view students.')).toBeVisible();
    expect(mocks.table.data).toEqual([]);
    expect(screen.getByLabelText('Board')).toBeDisabled();
  });
  it('preserves safe current rows during refetch and uses table-shaped initial loading', () => {
    mocks.query.isFetching = true;
    const { container, rerender } = render(<StudentDirectory />);
    expect(screen.getByRole('link', { name: 'Riya Shah' })).toBeVisible();
    expect(screen.getByRole('progressbar', { name: 'Refreshing student list' })).toBeVisible();
    expect(mocks.table.isLoading).toBe(false);
    mocks.query = { isLoading: true, isFetching: true };
    rerender(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <StudentDirectory />
      </ThemeProvider>
    );
    expect(mocks.table.isLoading).toBe(true);
    expect(mocks.table.wrapperProps.sx).toEqual({ height: 1 });
    expect(mocks.table.tableContainerProps.sx).toEqual({ height: 1 });
    expect(container.firstElementChild).toHaveStyle({
      display: 'flex',
      flexDirection: 'column',
      minHeight: '0',
    });
  });
  it('shows an exclusive recoverable error with header and filters retained', () => {
    mocks.query.isError = true;
    render(<StudentDirectory />);
    expect(screen.getByRole('heading', { name: 'Student List' })).toBeVisible();
    expect(screen.getByLabelText('Board')).toBeVisible();
    expect(screen.queryByRole('link', { name: 'Riya Shah' })).not.toBeInTheDocument();
    expect(screen.queryByText(/No active students/)).not.toBeInTheDocument();
    expect(mocks.table.data).toEqual([]);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(mocks.query.refetch).toHaveBeenCalledOnce();
  });
  it('does not expose cached rows or offer mutation actions when access is denied', () => {
    mocks.query.isError = true;
    mocks.query.error = { status: 403 };
    render(<StudentDirectory />);
    expect(screen.getByText('You do not have access to these student records.')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    expect(mocks.table.data).toEqual([]);
  });
  it('provides a filtered-empty recovery action without changing population or sorting', () => {
    mocks.params = new URLSearchParams(
      'population=Former&board=board-1&medium=medium-1&search=NoMatch&sort=name%20desc&page=2'
    );
    mocks.query.currentData = { totalCount: 0, items: [] };
    render(<StudentDirectory />);
    expect(screen.getByText('No students match your search or filters.')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(pushedParams()).toEqual({ population: 'Former', sort: 'name desc', page: '0' });
  });
  it('has compact core columns with sticky status/actions and derived class placement', () => {
    render(<StudentDirectory />);
    expect(mocks.table.columns.map((column: any) => column.label)).toEqual([
      'Student',
      'GR number',
      'Class / Division',
      'Roll number',
      'Status',
      'Actions',
    ]);
    expect(
      mocks.table.columns.filter((column: any) => column.sticky).map((column: any) => column.id)
    ).toEqual(['status', 'actions']);
    expect(mocks.table.data[0].classDivision).toBe('Class 1 / A');
  });

  it('offers Active recovery from an empty Former view without clearing table sort', () => {
    mocks.params = new URLSearchParams('population=Former&sort=name%20desc');
    mocks.query.currentData = { totalCount: 0, items: [] };
    render(<StudentDirectory />);
    expect(screen.getByText('No former students in this academic year.')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Show active students' }));
    expect(pushedParams()).toEqual({ sort: 'name desc', page: '0' });
  });
  it('preserves the approved historical-entry permission and dialog path', () => {
    const { rerender } = render(<StudentDirectory />);
    expect(screen.queryByRole('button', { name: 'Historical entry' })).not.toBeInTheDocument();
    mocks.permissions = [{ name: 'Students.Records.Overrides.Request', isGranted: true }];
    rerender(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <StudentDirectory />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Historical entry' }));
    expect(screen.getByRole('dialog', { name: 'Historical entry' })).toBeVisible();
  });
  it('allows filter options to retry while keeping table context intact', () => {
    mocks.options.isError = true;
    render(<StudentDirectory />);
    expect(screen.getByLabelText('Board')).toBeDisabled();
    expect(screen.getByRole('link', { name: 'Riya Shah' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Retry filters' }));
    expect(mocks.options.refetch).toHaveBeenCalledOnce();
  });
});
