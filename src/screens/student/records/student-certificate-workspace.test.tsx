import { vi, it, expect, beforeEach } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';

import StudentCertificateWorkspace from './student-certificate-workspace';

const state = vi.hoisted(() => ({
  params: '',
  year: 'year-1',
  canView: true,
  canIssue: true,
  deferNavigation: false,
  nextUrl: '',
  rosterQuery: vi.fn(),
  selectionQuery: vi.fn(),
  rosterFetching: false,
  rosterError: false,
  optionsLoading: false,
  optionsError: false,
  masked: false,
  isCurrentAcademicYear: undefined as boolean | undefined,
  student: {
    id: 'ravi',
    studentId: 'ravi',
    firstName: 'Ravi',
    lastName: 'Shah',
    grNumber: 'GR-123',
    academicYearId: 'year-1',
    standardName: 'Class 5',
    divisionName: 'A',
    maskedFields: [],
  },
}));

vi.mock('next/navigation', () => {
  const navigate = (url: string) => {
    state.nextUrl = url;
    if (!state.deferNavigation) state.params = url.split('?')[1] ?? '';
  };
  return {
    usePathname: () => '/student/certificates',
    useSearchParams: () => new URLSearchParams(state.params),
    useRouter: () => ({ push: navigate, replace: navigate }),
  };
});
vi.mock('react-redux', () => ({
  useSelector: (select: any) =>
    select({
      globalState: { currentYear: { id: state.year } },
      auth: {
        permissions: [
          { name: 'Students.Records.Certificates.View', isGranted: state.canView },
          { name: 'Students.Records.Certificates.Add', isGranted: state.canIssue },
        ],
      },
    }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading, action }: any) => (
    <header>
      <h1>{heading}</h1>
      {action}
    </header>
  ),
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, value, options, onChange, disabled }: any) => (
    <select
      aria-label={label}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option: any) => (
        <option value={option.id} key={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  ),
}));
vi.mock('src/components/adaptive-three-dots-actions', () => ({
  default: ({ actions }: any) =>
    actions.map((action: any) =>
      action.href ? (
        <a key={action.id} href={action.href} aria-label={action.ariaLabel ?? action.label}>
          <span aria-hidden />
        </a>
      ) : (
        <button
          key={action.id}
          aria-label={action.ariaLabel ?? action.label}
          type="button"
          disabled={action.disabled}
          onClick={action.onClick}
        >
          <span aria-hidden />
        </button>
      )
    ),
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({
    data,
    columns,
    isLoading,
    isSearch,
    searchTerm,
    searchFieldProps,
    onServerSearch,
    noDataText,
    errorContent,
    onServerPagination,
  }: any) => (
    <section aria-label="Student roster">
      {isSearch && (
        <input
          {...searchFieldProps.inputProps}
          value={searchTerm}
          onChange={(event) => onServerSearch(event.target.value)}
        />
      )}
      <button onClick={() => onServerPagination(2, 25)} type="button">
        Next page
      </button>
      {errorContent ||
        (isLoading ? (
          <div>Loading students</div>
        ) : data.length ? (
          data.map((row: any) => (
            <div key={row.studentId}>
              {columns.map((column: any) => (
                <div key={column.id}>{column.render?.(row[column.id], row) ?? row[column.id]}</div>
              ))}
            </div>
          ))
        ) : (
          noDataText
        ))}
    </section>
  ),
}));
vi.mock('src/components/student-feedback', () => ({
  StudentFeedback: ({ presentation, children }: any) => (
    <div role={presentation === 'toast' ? 'alert' : 'status'}>{children}</div>
  ),
}));
vi.mock('./components/certificate-history-table', () => ({
  default: ({ studentId }: any) => <div>History for {studentId}</div>,
}));
vi.mock('./components/certificate-generation-drawer', () => ({
  default: ({ students }: any) => (
    <div role="dialog" aria-label="Generate Certificate">
      Generating for {students[0].firstName}
    </div>
  ),
}));
vi.mock('src/redux/student/records/student-records-api', () => ({
  useGetStudentRecordsDirectoryOptionsQuery: (_input: any, { skip }: any = {}) => ({
    currentData:
      skip || state.optionsLoading || state.optionsError
        ? undefined
        : {
            boards: [
              { id: 'board-1', name: 'CBSE' },
              { id: 'board-2', name: 'State board' },
            ],
            mediums: [
              { id: 'medium-1', name: 'English', parentId: 'board-1' },
              { id: 'medium-2', name: 'Gujarati', parentId: 'board-2' },
            ],
            standards: [{ id: 'class-5', name: 'Class 5', parentId: 'medium-1' }],
            divisions: [{ id: 'division-a', name: 'A', parentId: 'class-5' }],
          },
    isLoading: state.optionsLoading,
    isError: state.optionsError,
    refetch: vi.fn(),
  }),
  useGetStudentRecordsDirectoryQuery: (input: any, options: any) => {
    const isLookup = Object.hasOwn(input, 'studentId');
    (isLookup ? state.selectionQuery : state.rosterQuery)(input, options);
    const scopedStudent = { ...state.student, isCurrentAcademicYear: state.isCurrentAcademicYear };
    const student = state.masked
      ? {
          ...scopedStudent,
          firstName: undefined,
          lastName: undefined,
          grNumber: undefined,
          maskedFields: ['Identity'],
        }
      : scopedStudent;
    return {
      currentData:
        options.skip || (!isLookup && state.rosterFetching)
          ? undefined
          : {
              items: !isLookup || input.studentId === student.studentId ? [student] : [],
              totalCount: 1,
            },
      isFetching: !isLookup && state.rosterFetching,
      isError: !isLookup && state.rosterError,
      refetch: vi.fn(),
    };
  },
}));

beforeEach(() => {
  state.params = '';
  state.year = 'year-1';
  state.canView = true;
  state.canIssue = true;
  state.deferNavigation = false;
  state.nextUrl = '';
  state.rosterFetching = false;
  state.rosterError = false;
  state.optionsLoading = false;
  state.optionsError = false;
  state.masked = false;
  state.isCurrentAcademicYear = undefined;
  state.rosterQuery.mockClear();
  state.selectionQuery.mockClear();
});

it('shows table search, dependent academic filters and icon-only student actions', () => {
  render(<StudentCertificateWorkspace />);
  expect(
    within(screen.getByRole('region', { name: 'Student roster' })).getByRole('textbox', {
      name: 'Search certificate students',
    })
  ).toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: 'Board' })).toHaveValue('board-1');
  expect(screen.getByRole('combobox', { name: 'Medium' })).toHaveValue('medium-1');
  expect(screen.getByRole('combobox', { name: 'Class' })).toBeEnabled();
  expect(screen.getByRole('combobox', { name: 'Division' })).toBeDisabled();
  expect(screen.getByText('Ravi Shah')).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Generate certificate for Ravi Shah' })
  ).toHaveTextContent('');
  expect(
    screen.getByRole('link', { name: 'View certificate history for Ravi Shah' })
  ).toHaveTextContent('');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.queryByText(/History for/)).not.toBeInTheDocument();
});

it('searches within the selected academic scope and returns to the first page', () => {
  state.params = 'board=board-1&medium=medium-1&class=class-5&division=division-a&page=2';
  const view = render(<StudentCertificateWorkspace />);
  const search = screen.getByRole('textbox', { name: 'Search certificate students' });

  fireEvent.change(search, { target: { value: 'Ravi Shah' } });
  view.rerender(<StudentCertificateWorkspace />);
  const academicScope = {
    boardId: 'board-1',
    mediumId: 'medium-1',
    standardId: 'class-5',
    divisionId: 'division-a',
  };
  expect(state.rosterQuery).toHaveBeenLastCalledWith(
    expect.objectContaining({ ...academicScope, search: 'Ravi Shah', skipCount: 0 }),
    { skip: false }
  );
  const history = screen.getByRole('link', { name: 'View certificate history for Ravi Shah' });
  expect(new URLSearchParams(history.getAttribute('href')?.split('?')[1]).get('search')).toBe(
    'Ravi Shah'
  );

  fireEvent.change(search, { target: { value: '' } });
  view.rerender(<StudentCertificateWorkspace />);
  expect(new URLSearchParams(state.params).has('search')).toBe(false);
  expect(state.rosterQuery).toHaveBeenLastCalledWith(
    expect.objectContaining({ ...academicScope, search: undefined, skipCount: 0 }),
    { skip: false }
  );
});

it('scopes and pages the roster on the server and clears descendants when board changes', () => {
  state.params = 'board=board-1&medium=medium-1&class=class-5&division=division-a&page=2';
  const view = render(<StudentCertificateWorkspace />);
  expect(state.rosterQuery).toHaveBeenLastCalledWith(
    expect.objectContaining({
      academicYearId: 'year-1',
      boardId: 'board-1',
      mediumId: 'medium-1',
      standardId: 'class-5',
      divisionId: 'division-a',
      population: 'All',
      includeActiveStudentList: true,
      skipCount: 50,
      maxResultCount: 25,
    }),
    { skip: false }
  );
  fireEvent.change(screen.getByRole('combobox', { name: 'Board' }), {
    target: { value: 'board-2' },
  });
  view.rerender(<StudentCertificateWorkspace />);
  expect(state.params).not.toMatch(/medium=|class=|division=/);
  expect(state.rosterQuery).toHaveBeenLastCalledWith(
    expect.objectContaining({
      boardId: 'board-2',
      mediumId: 'medium-2',
      standardId: undefined,
      divisionId: undefined,
      skipCount: 0,
    }),
    { skip: false }
  );
  fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
  view.rerender(<StudentCertificateWorkspace />);
  expect(state.rosterQuery).toHaveBeenLastCalledWith(expect.objectContaining({ skipCount: 25 }), {
    skip: false,
  });
});

it('opens generation only for the row whose icon was clicked', () => {
  render(<StudentCertificateWorkspace />);
  fireEvent.click(screen.getByRole('button', { name: 'Generate certificate for Ravi Shah' }));
  expect(screen.getByRole('dialog')).toHaveTextContent('Generating for Ravi');
  expect(screen.queryByText(/History for/)).not.toBeInTheDocument();
});

it('preserves the roster filters when returning from an existing history deep link', () => {
  state.params = 'student=ravi&year=year-1&class=class-5&division=division-a&page=2&type=Bonafide';
  state.deferNavigation = true;
  const view = render(<StudentCertificateWorkspace />);
  expect(screen.getByText('History for ravi')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Back to students' }));
  expect(state.nextUrl).toMatch(/class=class-5&division=division-a&page=2$/);
  state.params = state.nextUrl.split('?')[1];
  view.rerender(<StudentCertificateWorkspace />);
  expect(screen.queryByText('History for ravi')).not.toBeInTheDocument();
  expect(screen.getByRole('region', { name: 'Student roster' })).toBeInTheDocument();
});

it('supports view-only history while withholding issuance and clearing selection on year change', () => {
  state.canIssue = false;
  const view = render(<StudentCertificateWorkspace />);
  expect(screen.queryByRole('button', { name: /Generate certificate/ })).not.toBeInTheDocument();
  const link = screen.getByRole('link', { name: 'View certificate history for Ravi Shah' });
  expect(link).toHaveAttribute('href', '/student/certificates?student=ravi&year=year-1');
  expect(screen.queryByText('History for ravi')).not.toBeInTheDocument();
  state.params = link.getAttribute('href')!.split('?')[1];
  view.rerender(<StudentCertificateWorkspace />);
  expect(screen.getByText('History for ravi')).toBeInTheDocument();
  state.year = 'year-2';
  view.rerender(<StudentCertificateWorkspace />);
  expect(screen.queryByText('History for ravi')).not.toBeInTheDocument();
});

it('keeps history available for a historical placement without allowing a new certificate', () => {
  state.params = 'class=class-5&division=division-a&page=2';
  state.isCurrentAcademicYear = false;
  const view = render(<StudentCertificateWorkspace />);
  expect(screen.getByText('Ravi Shah')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Generate certificate/ })).not.toBeInTheDocument();
  const link = screen.getByRole('link', { name: 'View certificate history for Ravi Shah' });
  expect(link).toHaveAttribute(
    'href',
    '/student/certificates?class=class-5&division=division-a&page=2&student=ravi&year=year-1'
  );
  state.params = link.getAttribute('href')!.split('?')[1];
  view.rerender(<StudentCertificateWorkspace />);
  expect(screen.getByText('History for ravi')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Generate certificate/ })).not.toBeInTheDocument();
});

it('blocks roster actions for masked identities and skips requests if the view grant is absent', () => {
  state.masked = true;
  const view = render(<StudentCertificateWorkspace />);
  const roster = screen.getByRole('region', { name: 'Student roster' });
  expect(within(roster).getByText('Restricted identity')).toBeInTheDocument();
  expect(
    within(roster).queryByRole('button', { name: /Generate certificate/ })
  ).not.toBeInTheDocument();
  expect(
    within(roster).queryByRole('link', { name: /View certificate history/ })
  ).not.toBeInTheDocument();
  state.canView = false;
  view.rerender(<StudentCertificateWorkspace />);
  expect(screen.queryByRole('region', { name: 'Student roster' })).not.toBeInTheDocument();
  expect(screen.getByText('You do not have access to certificates.')).toBeInTheDocument();
});

it('withholds rows during loading, invalid scope and request failure', () => {
  state.optionsLoading = true;
  const view = render(<StudentCertificateWorkspace />);
  expect(screen.getByText('Loading students')).toBeInTheDocument();
  expect(state.rosterQuery).toHaveBeenLastCalledWith(expect.anything(), { skip: true });
  state.optionsLoading = false;
  state.params = 'class=stale-class';
  view.rerender(<StudentCertificateWorkspace />);
  expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument();
  expect(state.rosterQuery).toHaveBeenLastCalledWith(expect.anything(), { skip: true });
  state.params = '';
  state.rosterError = true;
  view.rerender(<StudentCertificateWorkspace />);
  expect(screen.getByRole('alert')).toHaveTextContent('The student roster could not be loaded.');
  expect(screen.queryByText('Ravi Shah')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Generate certificate/ })).not.toBeInTheDocument();
});
