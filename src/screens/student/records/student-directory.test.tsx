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
  documentRequest: null as any,
  exportDirectory: vi.fn(),
}));
vi.mock('./use-student-directory-export', () => ({
  useStudentDirectoryExport: () => mocks.exportDirectory,
}));
vi.mock('./student-directory-documents', () => ({
  default: ({ request }: any) => {
    mocks.documentRequest = request;
    return null;
  },
}));
vi.mock('src/components/responsiveMultiSelect', () => ({
  ResponsiveMultiSelect: ({
    label,
    value,
    options,
    disabled,
    onChange,
    getOptionLabel,
    getOptionValue,
  }: any) => (
    <label htmlFor={`multi-${label}`}>
      {label}
      <select
        id={`multi-${label}`}
        multiple
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(Array.from(event.target.selectedOptions).map((item) => item.value))
        }
      >
        {options.map((item: any) => (
          <option key={getOptionValue(item)} value={getOptionValue(item)}>
            {getOptionLabel(item)}
          </option>
        ))}
      </select>
    </label>
  ),
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
        {props.isRefreshing && <progress aria-label="Refreshing student list" />}
        {props.columns.find((column: any) => column.id === 'selection')?.label}
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
                {props.columns.find((column: any) => column.id === 'selection')?.render(null, row)}
                {props.columns.find((column: any) => column.id === 'name').render(null, row)}
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
  mocks.documentRequest = null;
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
          standardId: 'class-1',
          divisionId: 'division-1',
          maskedFields: [],
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
    mocks.table.onServerPagination(2, 25);
    expect(pushedParams()).toMatchObject({
      dashboard: 'directory',
      year: 'year-2',
      board: 'board-1',
      class: 'class-1',
      division: 'division-1',
      page: '1',
    });
  });
  it('restores server table context and preserves it in the student-name profile link', () => {
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
    ['Riya Shah'].forEach((label) => {
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
        medium: 'medium-1',
        student: 'student-1',
      });
    });
    expect(
      screen.queryByRole('link', { name: 'View profile for Riya Shah' })
    ).not.toBeInTheDocument();
  });
  it('shows only academic selectors in the compact row and keeps description in the shared tooltip', () => {
    render(<StudentDirectory />);
    ['Board', 'Medium', 'Class', 'Division'].forEach((label) =>
      expect(screen.getByLabelText(label)).toBeVisible()
    );
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
  it('resets academic filters without losing the population, search, or sort', () => {
    mocks.params = new URLSearchParams(
      'population=Former&board=board-1&medium=medium-1&class=class-1&division=division-1&search=Shah&sort=name%20desc&page=2'
    );
    render(<StudentDirectory />);
    fireEvent.click(screen.getByRole('button', { name: 'Reset academic filters' }));
    expect(pushedParams()).toEqual({
      population: 'Former',
      board: 'board-1',
      medium: 'medium-1',
      search: 'Shah',
      sort: 'name desc',
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
    expect(pushedParams()).toEqual({
      population: 'Former',
      board: 'board-1',
      medium: 'medium-1',
      sort: 'name desc',
      page: '0',
    });
  });
  it('has compact core columns with sticky status/actions and derived class placement', () => {
    render(<StudentDirectory />);
    expect(
      mocks.table.columns
        .filter((column: any) => column.id !== 'selection')
        .map((column: any) => column.label)
    ).toEqual(['Student', 'GR number', 'Class / Division', 'Roll number', 'Status', 'Actions']);
    expect(
      mocks.table.columns.filter((column: any) => column.sticky).map((column: any) => column.id)
    ).toEqual(['status', 'actions']);
    expect(mocks.table.data[0].classDivision).toBe('Class 1 / A');
    expect(mocks.table.columns.every((column: any) => column.align === 'left')).toBe(true);
    expect(
      mocks.table.columns.filter((column: any) => column.isFilter).map((column: any) => column.id)
    ).toEqual(['name', 'grNumber', 'classDivision', 'rollNo', 'status']);
    expect(mocks.table.columns.at(-1)).toMatchObject({
      id: 'actions',
      isFilter: false,
      isSort: false,
      excludeFromExport: true,
    });
    expect(mocks.table.serverSideFilter).toBe(true);
  });

  it('restores column criteria and sends filter changes to the server without losing scope or search', () => {
    const filters = [{ column: 'rollNo', operator: 'between', min: 2, max: 7 }];
    mocks.params = new URLSearchParams({
      population: 'Former',
      board: 'board-1',
      search: 'Shah',
      sort: 'name desc',
      page: '2',
      columnFilters: JSON.stringify(filters),
    });
    render(<StudentDirectory />);
    expect(mocks.input.columnFilters).toEqual(filters);
    expect(mocks.table.filters[0]).toMatchObject({
      column: 'rollNo',
      type: 'between',
      value: { min: 2, max: 7 },
      valueType: 'number',
    });
    mocks.table.onServerFilter([
      ...mocks.table.filters,
      { column: 'status', type: 'equals', value: 8, valueType: 'enum' },
    ]);
    expect(pushedParams()).toMatchObject({
      population: 'Former',
      board: 'board-1',
      search: 'Shah',
      sort: 'name desc',
      page: '0',
    });
    expect(JSON.parse(pushedParams().columnFilters)).toEqual([
      ...filters,
      { column: 'status', operator: 'equals', value: '8' },
    ]);
    mocks.table.onServerFilter([]);
    expect(pushedParams()).toEqual({
      population: 'Former',
      board: 'board-1',
      search: 'Shah',
      sort: 'name desc',
      page: '0',
    });
    mocks.table.onClearCriteria();
    expect(pushedParams()).toEqual({
      population: 'Former',
      board: 'board-1',
      sort: 'name desc',
      page: '0',
    });
  });

  it('offers Active recovery from an empty Former view without clearing table sort', () => {
    mocks.params = new URLSearchParams('population=Former&sort=name%20desc');
    mocks.query.currentData = { totalCount: 0, items: [] };
    render(<StudentDirectory />);
    expect(screen.getByText('No former students in this academic year.')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Show active students' }));
    expect(pushedParams()).toEqual({ sort: 'name desc', page: '0' });
  });
  it('removes both header utilities even for historical-entry administrators', () => {
    mocks.permissions = [{ name: 'Students.Records.Overrides.View', isGranted: true }];
    render(<StudentDirectory />);
    expect(screen.queryByRole('button', { name: 'Historical entry' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Manage Roll Numbers' })).not.toBeInTheDocument();
  });
  it('allows filter options to retry while keeping table context intact', () => {
    mocks.options.isError = true;
    render(<StudentDirectory />);
    expect(screen.getByLabelText('Board')).toBeDisabled();
    expect(screen.getByRole('link', { name: 'Riya Shah' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Retry filters' }));
    expect(mocks.options.refetch).toHaveBeenCalledOnce();
  });

  it('uses single Board/Medium choices without All and multi-select Class/Division', () => {
    render(<StudentDirectory />);
    expect(screen.getByLabelText('Board')).toHaveValue('board-1');
    expect(screen.getByLabelText('Medium')).toHaveValue('medium-1');
    expect(screen.queryByRole('option', { name: 'All boards' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'All mediums' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Class')).toHaveAttribute('multiple');
    expect(screen.getByLabelText('Division')).toHaveAttribute('multiple');
    expect(mocks.input).toMatchObject({ boardId: 'board-1', mediumId: 'medium-1' });
  });

  it('exposes the common table tools and keyboard-accessible row profile action', () => {
    render(<StudentDirectory />);
    expect(mocks.table).toMatchObject({
      showColumns: true,
      showExport: true,
      showFullScreen: true,
      onExport: mocks.exportDirectory,
    });
    mocks.table.getRowAction(mocks.table.data[0], 0).onClick();
    expect(pushedParams()).toMatchObject({
      student: 'student-1',
      board: 'board-1',
      medium: 'medium-1',
    });
  });

  it('disables checkboxes without exactly one class and division, then hands selected students to documents', () => {
    mocks.permissions = [
      'Students.Records.StudentICard.View',
      'Students.Records.StudentICard.Add',
    ].map((name) => ({ name, isGranted: true }));
    const { rerender } = render(<StudentDirectory />);
    expect(screen.getByRole('checkbox', { name: 'Select Riya Shah' })).toBeDisabled();
    mocks.params = new URLSearchParams(
      'board=board-1&medium=medium-1&class=class-1&division=division-1'
    );
    rerender(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <StudentDirectory />
      </ThemeProvider>
    );
    const checkbox = screen.getByRole('checkbox', { name: 'Select Riya Shah' });
    expect(checkbox).toBeEnabled();
    fireEvent.click(checkbox);
    expect(screen.getByText('1 student selected')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Export selected' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Print I-cards' }));
    expect(mocks.documentRequest).toMatchObject({
      kind: 'id-card',
      academicYearId: 'year-1',
      students: [{ studentId: 'student-1' }],
      academicScope: {
        boardIds: ['board-1'],
        mediumIds: ['medium-1'],
        standardIds: ['class-1'],
        divisionIds: ['division-1'],
      },
      lockAcademicScope: true,
    });
  });

  it('clears selection immediately when the class/division scope becomes multiple', () => {
    mocks.permissions = [
      'Students.Records.Certificates.View',
      'Students.Records.Certificates.Add',
    ].map((name) => ({ name, isGranted: true }));
    mocks.options.currentData.standards.push({
      id: 'class-2',
      name: 'Class 2',
      parentId: 'medium-1',
    });
    mocks.params = new URLSearchParams(
      'board=board-1&medium=medium-1&class=class-1&division=division-1'
    );
    const { rerender } = render(<StudentDirectory />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Riya Shah' }));
    expect(screen.getByText('1 student selected')).toBeVisible();
    mocks.params.set('class', 'class-1,class-2');
    rerender(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <StudentDirectory />
      </ThemeProvider>
    );
    expect(screen.queryByText('1 student selected')).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Select Riya Shah' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Select Riya Shah' })).not.toBeChecked();
  });

  it('removes selected students if a same-scope refresh masks their identity', () => {
    mocks.permissions = [
      'Students.Records.Certificates.View',
      'Students.Records.Certificates.Add',
    ].map((name) => ({ name, isGranted: true }));
    mocks.params = new URLSearchParams(
      'board=board-1&medium=medium-1&class=class-1&division=division-1'
    );
    const { rerender } = render(<StudentDirectory />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Riya Shah' }));
    expect(screen.getByText('1 student selected')).toBeVisible();
    mocks.query.currentData = {
      totalCount: 1,
      items: [{ ...mocks.query.currentData.items[0], maskedFields: ['Identity'] }],
    };
    rerender(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <StudentDirectory />
      </ThemeProvider>
    );
    expect(screen.queryByText('1 student selected')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Generate certificates' })).not.toBeInTheDocument();
  });

  it('clears stale selections when a same-page refresh removes the selected student', () => {
    mocks.permissions = [
      'Students.Records.Certificates.View',
      'Students.Records.Certificates.Add',
    ].map((name) => ({ name, isGranted: true }));
    mocks.params = new URLSearchParams(
      'board=board-1&medium=medium-1&class=class-1&division=division-1'
    );
    const { rerender } = render(<StudentDirectory />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Riya Shah' }));
    expect(screen.getByText('1 student selected')).toBeVisible();
    mocks.query.currentData = { totalCount: 0, items: [] };
    rerender(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <StudentDirectory />
      </ThemeProvider>
    );
    expect(screen.queryByText('1 student selected')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Generate certificates' })).not.toBeInTheDocument();
  });

  it('does not revive selection after leaving a scope while its replacement is loading', () => {
    mocks.permissions = [
      'Students.Records.Certificates.View',
      'Students.Records.Certificates.Add',
    ].map((name) => ({ name, isGranted: true }));
    mocks.params = new URLSearchParams(
      'board=board-1&medium=medium-1&class=class-1&division=division-1'
    );
    const cached = mocks.query.currentData;
    const { rerender } = render(<StudentDirectory />);
    const refresh = () =>
      rerender(
        <ThemeProvider theme={createTheme(defaultSettings)}>
          <StudentDirectory />
        </ThemeProvider>
      );
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Riya Shah' }));
    mocks.params.delete('division');
    mocks.query.currentData = undefined;
    mocks.query.isFetching = true;
    refresh();
    mocks.params.set('division', 'division-1');
    mocks.query.currentData = cached;
    mocks.query.isFetching = false;
    refresh();
    expect(screen.queryByText('1 student selected')).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Select Riya Shah' })).not.toBeChecked();
  });

  it('retains valid selected students across pagination', () => {
    mocks.permissions = [
      'Students.Records.Certificates.View',
      'Students.Records.Certificates.Add',
    ].map((name) => ({ name, isGranted: true }));
    mocks.params = new URLSearchParams(
      'board=board-1&medium=medium-1&class=class-1&division=division-1'
    );
    const { rerender } = render(<StudentDirectory />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Riya Shah' }));
    mocks.params.set('page', '1');
    mocks.query.currentData = {
      totalCount: 26,
      items: [
        {
          ...mocks.query.currentData.items[0],
          id: 'student-2',
          studentId: 'student-2',
          firstName: 'Asha',
        },
      ],
    };
    rerender(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <StudentDirectory />
      </ThemeProvider>
    );
    expect(screen.getByText('1 student selected')).toBeVisible();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Asha Shah' }));
    expect(screen.getByText('2 students selected')).toBeVisible();
  });

  it('keeps the permitted certificate action direct without promoting unrelated overflow actions', () => {
    mocks.permissions = [
      'Students.Records.Certificates.View',
      'Students.Records.Certificates.Add',
    ].map((name) => ({ name, isGranted: true }));
    render(<StudentDirectory />);
    expect(screen.getByTestId('table-action-certificate')).toBeVisible();
    expect(screen.queryByTestId('menu-action-certificate')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'More actions for Riya Shah' })
    ).not.toBeInTheDocument();
  });
});
