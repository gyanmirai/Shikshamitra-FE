import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import StudentDirectory from './student-directory';

const mocks = vi.hoisted(() => ({
  params: new URLSearchParams(),
  push: vi.fn(),
  query: {} as any,
  input: {} as any,
  table: {} as any,
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
  usePathname: () => '/student/records/directory',
  useSearchParams: () => mocks.params,
}));
vi.mock('react-redux', () => ({
  useSelector: (select: any) =>
    select({
      globalState: { currentYear: { id: 'year-1', name: '2026–27', boards: [] } },
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
  useGetStudentRecordsDirectoryOptionsQuery: () => ({
    currentData: {
      academicYears: [{ id: 'year-1', name: '2026–27' }],
      boards: [],
      mediums: [],
      standards: [],
      divisions: [],
    },
  }),
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
      academicYearId: undefined,
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
      '/student/records/directory?population=Former&year=all&board=board-1&page=0&search=Riya',
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
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(mocks.query.refetch).toHaveBeenCalledOnce();
  });
  it('uses table loading and prevents uncontrolled document scrolling', () => {
    mocks.query = { currentData: undefined, isError: false, isLoading: true, isFetching: true };
    const { container } = render(<StudentDirectory />);
    expect(mocks.table.isLoading).toBe(true);
    expect(mocks.table.wrapperProps.sx).toEqual({ height: 1 });
    expect(mocks.table.tableContainerProps.sx).toEqual({ height: 1 });
    expect(container.firstElementChild).toHaveStyle({
      display: 'flex',
      flexDirection: 'column',
      minHeight: '0',
    });
  });
});
