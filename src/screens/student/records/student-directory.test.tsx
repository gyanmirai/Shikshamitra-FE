import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { screen, within, fireEvent, render as renderComponent } from '@testing-library/react';

import StudentDirectory from './student-directory';

const render = (element: React.ReactElement) =>
  renderComponent(<ThemeProvider theme={createTheme(defaultSettings)}>{element}</ThemeProvider>);

vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));

const mocks = vi.hoisted(() => ({
  params: new URLSearchParams(),
  push: vi.fn(),
  query: {} as any,
  input: {} as any,
  table: {} as any,
  currentYear: 'year-1',
  optionsInput: {} as any,
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
  usePathname: () => '/student/records/directory',
  useSearchParams: () => mocks.params,
}));
vi.mock('react-redux', () => ({
  useSelector: (select: any) =>
    select({
      globalState: { currentYear: { id: mocks.currentYear, name: '2026–27', boards: [] } },
      auth: { permissions: [] },
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
  CustomBreadcrumbs: ({ heading, action }: any) => (
    <header>
      <h1>{heading}</h1>
      {action}
    </header>
  ),
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, value, options, onChange, labelKey = 'label', valueKey = 'value' }: any) => (
    <label htmlFor={label}>
      {label}
      <select
        id={label}
        aria-label={label}
        value={value}
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
vi.mock('./legacy-record-entry', () => ({ default: () => <div>Historical entry</div> }));
vi.mock('src/redux/student/records/student-records-api', () => ({
  useGetStudentRecordsDirectoryOptionsQuery: (input: any) => {
    mocks.optionsInput = input;
    return {
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
    };
  },
  useGetStudentRecordsDirectoryQuery: (input: any) => {
    mocks.input = input;
    return mocks.query;
  },
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: (props: any) => {
    mocks.table = props;
    return (
      <section aria-label="Directory table">
        <button type="button" onClick={() => props.onServerSearch('Riya')}>
          Search Riya
        </button>
        <button type="button" onClick={() => props.onServerPagination(2, 25)}>
          Next page
        </button>
        <button type="button" onClick={() => props.onServerSort('name', [])}>
          Clear sorting
        </button>
        {props.data.map((row: any) => (
          <div key={row.studentId}>{props.columns[0].render(null, row)}</div>
        ))}
        {props.noDataText}
      </section>
    );
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.params = new URLSearchParams();
  mocks.currentYear = 'year-1';
  mocks.query = {
    currentData: {
      totalCount: 1,
      items: [
        { id: 'student-1', studentId: 'student-1', firstName: 'Riya', lastName: 'Shah', status: 6 },
      ],
    },
    isError: false,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  };
});
describe('Student Directory', () => {
  it('restores shareable filters and uses paged server requests', () => {
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
      serverSidePagination: true,
      serverSideSearch: true,
      serverSideSort: true,
      page: 2,
      rowsPerPage: 25,
    });
    expect(screen.getByRole('link', { name: 'Riya Shah' })).toHaveAttribute(
      'href',
      '/student/profile?student=student-1'
    );
  });
  it('updates search without dropping the selected population or scope', () => {
    mocks.params = new URLSearchParams('population=Former&year=all&board=board-1&page=2');
    render(<StudentDirectory />);
    fireEvent.click(screen.getByRole('button', { name: 'Search Riya' }));
    expect(mocks.push).toHaveBeenCalledWith(
      '/student/records/directory?population=Former&board=board-1&page=0&search=Riya',
      { scroll: false }
    );
  });
  it('keeps the header and filters available when the request fails', () => {
    mocks.query = {
      currentData: undefined,
      isError: true,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    };
    render(<StudentDirectory />);
    expect(screen.getByRole('heading', { name: 'Student Directory' })).toBeVisible();
    expect(screen.getByLabelText('Students')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: /^Filters/ }));
    expect(screen.queryByLabelText('Academic year')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Board')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(mocks.query.refetch).toHaveBeenCalledOnce();
  });
  it('uses table loading and prevents uncontrolled document scrolling', () => {
    mocks.query = { currentData: undefined, isError: false, isLoading: true, isFetching: true };
    const { container } = render(<StudentDirectory />);
    expect(mocks.table.isLoading).toBe(true);
    expect(mocks.table.sorts).toEqual([]);
    expect(mocks.input.sorting).toBeUndefined();
    expect(mocks.table.wrapperProps.sx).toEqual({ height: 1 });
    expect(mocks.table.tableContainerProps.sx).toEqual({ height: 1 });
    expect(container.firstElementChild).toHaveStyle({
      display: 'flex',
      flexDirection: 'column',
      minHeight: '0',
    });
  });
  it('keeps filters separate and applies the draft together while preserving search and sort', () => {
    mocks.params = new URLSearchParams('population=Former&search=Shah&sort=grNumber%20desc&page=2');
    render(<StudentDirectory />);
    expect(screen.getByLabelText('Students')).toBeVisible();
    expect(screen.queryByLabelText('Board')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^Filters/ }));
    const panel = screen.getByRole('dialog', { name: 'Filter students' });
    expect(panel).toBeVisible();
    expect(within(panel).queryByLabelText('Students')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Board'), { target: { value: 'board-1' } });
    expect(mocks.push).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Apply Filters' }));
    const url = new URL(mocks.push.mock.calls[0][0], 'http://localhost');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      search: 'Shah',
      sort: 'grNumber desc',
      page: '0',
      population: 'Former',
      board: 'board-1',
    });
    expect(screen.getByLabelText('Students')).toBeVisible();
  });
  it('discards canceled changes and clears dependent draft selections when board changes', () => {
    mocks.params = new URLSearchParams(
      'board=board-1&medium=medium-1&class=class-1&division=division-1'
    );
    render(<StudentDirectory />);
    fireEvent.click(screen.getByRole('button', { name: /^Filters/ }));
    fireEvent.change(screen.getByLabelText('Board'), { target: { value: 'board-2' } });
    expect(screen.getByLabelText('Medium')).toHaveValue('all');
    expect(screen.getByLabelText('Class')).toHaveValue('all');
    expect(screen.getByLabelText('Division')).toHaveValue('all');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mocks.push).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /^Filters/ }));
    expect(screen.getByLabelText('Board')).toHaveValue('board-1');
    expect(screen.getByLabelText('Division')).toHaveValue('division-1');
  });
  it('resets academic filters without changing the selected student population', () => {
    mocks.params = new URLSearchParams('population=Former&year=all&board=board-1');
    render(<StudentDirectory />);
    fireEvent.click(screen.getByRole('button', { name: /^Filters/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Reset Defaults' }));
    expect(screen.getByLabelText('Students')).toHaveValue('Former');
    expect(screen.queryByLabelText('Academic year')).not.toBeInTheDocument();
    expect(mocks.optionsInput.academicYearId).toBe('year-1');
    expect(screen.getByLabelText('Board')).toHaveValue('all');
    expect(mocks.push).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Apply Filters' }));
    expect(mocks.push).toHaveBeenCalledWith('/student/records/directory?population=Former&page=0', {
      scroll: false,
    });
  });
  it('changes Students immediately while keeping academic filters and search', () => {
    mocks.params = new URLSearchParams('board=board-1&year=all&search=Shah&page=2');
    render(<StudentDirectory />);
    fireEvent.change(screen.getByLabelText('Students'), { target: { value: 'Former' } });
    expect(mocks.push).toHaveBeenCalledWith(
      '/student/records/directory?board=board-1&search=Shah&page=0&population=Former',
      { scroll: false }
    );
  });
  it('uses the global year for rows and filter choices even when an old URL overrides it', () => {
    mocks.params = new URLSearchParams('year=old-year');
    const { rerender } = render(<StudentDirectory />);
    fireEvent.click(screen.getByRole('button', { name: /^Filters/ }));
    expect(screen.queryByLabelText('Academic year')).not.toBeInTheDocument();
    expect(mocks.input.academicYearId).toBe('year-1');
    expect(mocks.optionsInput.academicYearId).toBe('year-1');
    mocks.currentYear = 'year-2';
    rerender(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <StudentDirectory />
      </ThemeProvider>
    );
    expect(mocks.input.academicYearId).toBe('year-2');
    expect(mocks.optionsInput.academicYearId).toBe('year-2');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('button', { name: /^Filters/ })).toHaveTextContent('Filters');
    expect(screen.getByRole('button', { name: /^Filters/ })).not.toHaveTextContent('1');
  });
  it('keeps an explicit sort and clears it without restoring the initial ascending order', () => {
    mocks.params = new URLSearchParams('sort=name%20desc&page=2&search=Shah');
    render(<StudentDirectory />);
    expect(mocks.table.sorts).toEqual([{ column: 'name', direction: 'desc' }]);
    expect(mocks.input.sorting).toBe('name desc');
    fireEvent.click(screen.getByRole('button', { name: 'Clear sorting' }));
    expect(mocks.push).toHaveBeenCalledWith('/student/records/directory?page=0&search=Shah', {
      scroll: false,
    });
  });
});
