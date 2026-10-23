import type { ICustomizableTableProps } from 'src/components/customizabaleTable/types';

import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import AdmissionApplicationsScreen from './admission-applications';

const state = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  query: vi.fn(),
  refetch: vi.fn(),
  clear: vi.fn(),
  search: '',
  canView: true,
  canStart: false,
  academicYearId: 'year-1' as string | undefined,
  boardId: 'board-1',
  mediumId: 'medium-1',
  tableProps: undefined as ICustomizableTableProps | undefined,
  queryResult: {} as Record<string, unknown>,
}));
vi.mock('react-redux', () => ({
  useSelector: () => [
    { name: 'Students.Admissions.Applications.View', isGranted: state.canView },
    { name: 'Students.Admissions.Applications.Add', isGranted: state.canStart },
  ],
}));
vi.mock('next/navigation', () => ({
  usePathname: () => '/student/admissions/applications',
  useRouter: () => ({ push: state.push, replace: state.replace }),
  useSearchParams: () => new URLSearchParams(state.search),
}));
vi.mock('next/link', () => ({
  default: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ action }: { action?: React.ReactNode }) => (
    <>
      <h1>Applications</h1>
      {action}
    </>
  ),
}));
vi.mock('./admission-direct-registration-dialog', () => ({
  default: ({
    open,
    onClose,
    academicYearId,
  }: {
    open: boolean;
    onClose: () => void;
    academicYearId: string;
  }) =>
    open ? (
      <section aria-label="Special registration" data-year={academicYearId}>
        <button type="button" onClick={onClose}>
          Close registration
        </button>
      </section>
    ) : null,
}));
vi.mock('./admission-query-error', () => ({
  AdmissionQueryError: ({ onRetry }: { onRetry: () => void }) => (
    <div>
      Unable to load applications
      <button type="button" onClick={onRetry}>
        Retry
      </button>
    </div>
  ),
}));
vi.mock('src/components/three-dots-actions', () => ({
  default: ({ viewLabel, handleViewClick }: { viewLabel: string; handleViewClick: () => void }) => (
    <button type="button" onClick={handleViewClick}>
      {viewLabel}
    </button>
  ),
}));
vi.mock('./application-detail/application-workspace-redirect', () => ({
  ApplicationWorkspaceRedirect: ({
    applicationId,
    returnTo,
  }: {
    applicationId: string;
    returnTo: string;
  }) => <section aria-label={`Recover application ${applicationId}`} data-return-to={returnTo} />,
}));
vi.mock('./admission-academic-filters', () => ({
  AdmissionAcademicFilters: () => <div>Academic filters</div>,
  useAdmissionAcademicFilters: () => ({
    academicYearId: state.academicYearId,
    boardId: state.boardId,
    mediumId: state.mediumId,
    standardId: '',
    dashboardScope: new URLSearchParams(state.search).has('dashboard'),
    clear: state.clear,
    update: vi.fn(),
  }),
}));
vi.mock('src/redux/student/admissions/admission-applications-api', () => ({
  useGetAdmissionApplicationsQuery: (input: unknown, options: unknown) => {
    state.query(input, options);
    return { ...state.queryResult, refetch: state.refetch };
  },
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: (props: ICustomizableTableProps) => {
    state.tableProps = props;
    return (
      <section aria-label="Applications table">
        <input
          aria-label="Search Applications"
          value={props.searchTerm}
          onChange={(event) => props.onServerSearch?.(event.target.value)}
        />
        <button type="button" onClick={() => props.onServerPagination?.(3, 25)}>
          Page three
        </button>
        <button
          type="button"
          onClick={() =>
            props.onServerSort?.('applicantName', [{ column: 'applicantName', direction: 'desc' }])
          }
        >
          Sort applicant
        </button>
        {props.errorContent
          ? props.errorContent
          : props.data.length
            ? props.data.map((row) => (
                <div key={row.id}>
                  {props.columns.map((column) => (
                    <span key={column.id}>{column.render?.(row[column.id], row)}</span>
                  ))}
                </div>
              ))
            : props.noDataText}
      </section>
    );
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  state.search = 'board=board-1&medium=medium-1&page=2';
  state.canView = true;
  state.canStart = false;
  state.academicYearId = 'year-1';
  state.boardId = 'board-1';
  state.mediumId = 'medium-1';
  state.tableProps = undefined;
  state.queryResult = {
    currentData: {
      totalCount: 500,
      items: [
        {
          id: 'application-1',
          applicantId: 'applicant-1',
          applicationNumber: 'APP-2026-000001',
          applicantName: 'Parth Patel',
          status: 4,
          standardName: 'Class 6',
          contactPhone: '9876543210',
          contactEmail: 'parent@example.test',
        },
      ],
    },
    isLoading: false,
    isFetching: false,
    isError: false,
  };
});

describe('Applications decision workspace', () => {
  it('opens special registration only with the existing Start/Add permission and current academic year', () => {
    state.canStart = true;
    render(<AdmissionApplicationsScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Start special registration' }));
    expect(screen.getByLabelText('Special registration')).toHaveAttribute('data-year', 'year-1');
    fireEvent.click(screen.getByRole('button', { name: 'Close registration' }));
    expect(screen.queryByLabelText('Special registration')).not.toBeInTheDocument();
  });
  it('does not expose special-registration entry without Start/Add permission', () => {
    render(<AdmissionApplicationsScreen />);
    expect(
      screen.queryByRole('button', { name: 'Start special registration' })
    ).not.toBeInTheDocument();
  });
  it('disables special-registration entry when the academic year is missing', () => {
    state.canStart = true;
    state.academicYearId = undefined;
    render(<AdmissionApplicationsScreen />);
    expect(screen.getByRole('button', { name: 'Start special registration' })).toBeDisabled();
  });
  it('requests only the decision phase with correct server paging and counts', () => {
    render(<AdmissionApplicationsScreen />);
    expect(state.query).toHaveBeenCalledWith(
      expect.objectContaining({ decisionWorkspaceOnly: true, maxResultCount: 25, skipCount: 25 }),
      expect.objectContaining({ skip: false })
    );
    expect(state.tableProps).toMatchObject({
      serverSidePagination: true,
      serverSideSearch: true,
      serverSideSort: true,
      totalCount: 500,
      page: 1,
      rowsPerPage: 25,
      exportLabel: 'Export',
    });
    expect(screen.getByRole('heading', { name: 'Applications' })).toBeInTheDocument();
    expect(screen.getByText('Class 6')).toBeInTheDocument();
    expect(screen.getByText('In review')).toBeInTheDocument();
  });
  it('combines identity and preserves phase-aware full-page links and return context', () => {
    render(<AdmissionApplicationsScreen />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(state.tableProps?.columns.map((column) => column.id)).not.toContain('applicationNumber');
    expect(state.tableProps?.columns.map((column) => column.id)).not.toContain('offeringCode');
    expect(state.tableProps?.columns.map((column) => column.id)).not.toContain('currentStageName');
    links.forEach((link) => {
      const url = new URL(link.getAttribute('href')!, 'https://school.test');
      expect(url.pathname).toBe('/student/admissions/applications/application-1');
      expect(url.searchParams.get('returnTo')).toBe(
        '/student/admissions/applications?board=board-1&medium=medium-1&page=2'
      );
    });
    fireEvent.click(screen.getByRole('link', { name: 'Parth Patel' }), { button: 0 });
    expect(state.push).toHaveBeenCalledWith(links[0].getAttribute('href'), { scroll: false });
    fireEvent.click(screen.getByRole('button', { name: 'View APP-2026-000001 for Parth Patel' }));
    expect(state.push).toHaveBeenCalledTimes(2);
  });
  it.each([
    { ctrlKey: true },
    { metaKey: true },
    { shiftKey: true },
    { altKey: true },
    { button: 1 },
  ])('preserves native modified navigation %s', (modifier) => {
    render(<AdmissionApplicationsScreen />);
    expect(fireEvent.click(screen.getByRole('link', { name: 'Parth Patel' }), modifier)).toBe(true);
    expect(state.push).not.toHaveBeenCalled();
  });
  it('removes old invisible filters without applying them to the request', () => {
    state.search += '&counsellor=owner-1&status=4&stage=review';
    render(<AdmissionApplicationsScreen />);
    const [input] = state.query.mock.calls[0];
    expect(input).not.toHaveProperty('assignedCounsellorId');
    expect(input).not.toHaveProperty('status');
    expect(input).not.toHaveProperty('currentStageSearch');
    expect(state.replace).toHaveBeenCalledWith(
      '/student/admissions/applications?board=board-1&medium=medium-1&page=2',
      { scroll: false }
    );
  });
  it('resets page for search and sorting while pagination preserves the search', () => {
    state.search += '&search=Riya';
    render(<AdmissionApplicationsScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Page three' }));
    expect(state.replace).toHaveBeenLastCalledWith(
      '/student/admissions/applications?board=board-1&medium=medium-1&page=3&search=Riya&size=25',
      { scroll: false }
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'Search Applications' }), {
      target: { value: '9876' },
    });
    expect(state.replace).toHaveBeenLastCalledWith(
      '/student/admissions/applications?board=board-1&medium=medium-1&search=9876',
      { scroll: false }
    );
    fireEvent.click(screen.getByRole('button', { name: 'Sort applicant' }));
    expect(state.replace).toHaveBeenLastCalledWith(
      '/student/admissions/applications?board=board-1&medium=medium-1&search=Riya&sort=applicantName&direction=desc',
      { scroll: false }
    );
  });
  it('recovers old drawer bookmarks without showing the underlying table', () => {
    state.search += '&application=application-1';
    render(<AdmissionApplicationsScreen />);
    expect(screen.getByLabelText('Recover application application-1')).toHaveAttribute(
      'data-return-to',
      '/student/admissions/applications?board=board-1&medium=medium-1&page=2'
    );
    expect(screen.queryByLabelText('Applications table')).not.toBeInTheDocument();
  });
  it('retains safe current rows while a background refresh is labelled', () => {
    state.queryResult.isFetching = true;
    render(<AdmissionApplicationsScreen />);
    expect(
      screen.getByRole('progressbar', { name: 'Refreshing applications' })
    ).toBeInTheDocument();
    expect(screen.getByText('Parth Patel')).toBeInTheDocument();
    expect(state.tableProps?.isLoading).toBe(false);
  });
  it('shows an error and safe retry without presenting a successful empty result', () => {
    state.queryResult.isError = true;
    render(<AdmissionApplicationsScreen />);
    expect(screen.getByText('Unable to load applications')).toBeInTheDocument();
    expect(screen.queryByText(/No applications have reached/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(state.refetch).toHaveBeenCalledOnce();
  });
  it('does not fetch without View permission, and preserves the page heading', () => {
    state.canView = false;
    render(<AdmissionApplicationsScreen />);
    expect(screen.getByRole('heading', { name: 'Applications' })).toBeInTheDocument();
    expect(screen.getByText(/viewing permission is required/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Applications table')).not.toBeInTheDocument();
    expect(state.query).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ skip: true })
    );
  });
  it.each([
    ['active-applications', { activeOnly: true, decisionWorkspaceOnly: false }],
    ['admission-decisions', { pendingDecisionOnly: true, decisionWorkspaceOnly: true }],
  ])('keeps the %s dashboard population across all boards and mediums', (preset, expected) => {
    state.search = `dashboard=${preset}&year=year-1&division=division-a`;
    state.boardId = '';
    state.mediumId = '';
    render(<AdmissionApplicationsScreen />);
    expect(state.query).toHaveBeenCalledWith(
      expect.objectContaining({ ...expected, divisionId: 'division-a', academicYearId: 'year-1' }),
      expect.objectContaining({ skip: false })
    );
  });
  it('shows the correct prerequisite instead of cached rows without an academic year', () => {
    state.academicYearId = undefined;
    render(<AdmissionApplicationsScreen />);
    expect(screen.getByText('Select an academic year to view Applications')).toBeInTheDocument();
    expect(screen.queryByText('Parth Patel')).not.toBeInTheDocument();
    expect(state.tableProps?.totalCount).toBe(0);
    expect(state.tableProps?.isLoading).toBe(false);
  });
  it('distinguishes search-empty from an empty decision queue and clears search', () => {
    state.search += '&search=unknown';
    state.queryResult.currentData = { items: [], totalCount: 0 };
    render(<AdmissionApplicationsScreen />);
    expect(screen.getByText('No applications match your search')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(state.replace).toHaveBeenLastCalledWith(
      '/student/admissions/applications?board=board-1&medium=medium-1',
      { scroll: false }
    );
  });
});
