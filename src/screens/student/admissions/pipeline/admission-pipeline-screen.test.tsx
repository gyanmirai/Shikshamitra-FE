import { useEffect } from 'react';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import AdmissionInquiryPipelineScreen from '../admission-inquiry-pipeline';

const context = vi.hoisted(() => ({
  params: new URLSearchParams(),
  year: 'year-1',
  canView: true,
  canAssign: false,
  bulkBusy: false,
  bulkInput: {} as Record<string, any>,
  filterProps: {} as Record<string, any>,
  academicUpdate: vi.fn(),
  replace: vi.fn(),
  push: vi.fn(),
  list: vi.fn(),
  options: vi.fn(),
  data: {
    items: [{ id: 'app-1', applicationNumber: 'APP-1', applicantName: 'QA Applicant', status: 0 }],
    totalCount: 31,
  },
  error: false,
  fetching: false,
  scopeLoading: false,
  board: 'board-1',
  medium: 'medium-1',
  initialLoading: false,
  table: {} as Record<string, any>,
}));
vi.mock('../admission-application-detail', () => ({
  default: ({ applicationId, presentation, onClose }: any) => (
    <div role="dialog" aria-label="Applicant workspace" data-presentation={presentation}>
      <span>{applicationId}</span>
      <button type="button" onClick={onClose}>
        Close applicant
      </button>
    </div>
  ),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: context.replace, push: context.push }),
  useSearchParams: () => context.params,
}));
vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({
      auth: {
        permissions: [
          { name: 'Students.Admissions.Applications.View', isGranted: context.canView },
          { name: 'Students.Admissions.Applications.Add', isGranted: context.canAssign },
        ],
        user: { sub: 'operator-1' },
        sessionContext: { tenantId: 'tenant-1' },
      },
    }),
}));
vi.mock('../admission-academic-filters', () => ({
  useAdmissionAcademicFilters: () => ({
    academicYearId: context.year,
    boardId: context.board,
    mediumId: context.medium,
    standardId: '',
    update: context.academicUpdate,
    clear: vi.fn(),
  }),
  AdmissionAcademicFilters: function Filters({
    filterAction,
    onChange,
    disabled,
    onLoadingChange,
  }: any) {
    useEffect(() => {
      onLoadingChange?.(context.scopeLoading);
    }, [onLoadingChange]);
    return (
      <div data-testid="academic-filter-row">
        <button type="button" disabled={disabled} onClick={() => onChange('board', 'board-2')}>
          Change board
        </button>
        {filterAction}
      </div>
    );
  },
}));
vi.mock('./use-bulk-pipeline-counsellor', () => ({
  useBulkPipelineCounsellor: (input: any) => {
    context.bulkInput = input;
    return {
      selectedIds: [],
      eligibleIds: input.canAssign ? input.rows.map((row: any) => row.id) : [],
      busy: context.bulkBusy,
      toggleSelection: vi.fn(),
      toggleAll: vi.fn(),
    };
  },
}));
vi.mock('./bulk-pipeline-counsellor', () => ({ BulkPipelineCounsellor: () => null }));
vi.mock('./admission-pipeline-more-filters', () => ({
  AdmissionPipelineMoreFilters: (props: any) => {
    context.filterProps = props;
    const { disabled, onApply } = props;
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => onApply({ queue: 'all', counsellor: 'staff-1', stage: 'exam', status: '1' })}
      >
        Apply operational filters
      </button>
    );
  },
}));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ action }: any) => <div>{action}</div>,
}));
vi.mock('src/components/custom-select', () => ({ default: () => null }));
vi.mock('../admission-query-error', () => ({ AdmissionQueryError: () => <div>Query failed</div> }));
vi.mock('src/components/customizabaleTable', () => ({
  default: (props: any) => {
    context.table = props;
    return (
      <div>
        <button
          type="button"
          data-application-id={props.data[0]?.id}
          onClick={() => props.handleRowClick(props.data[0])}
        >
          Open row
        </button>
        <span>{props.noDataText}</span>
      </div>
    );
  },
}));
vi.mock('src/redux/student/admissions/admission-pipeline-api', () => ({
  useGetAdmissionPipelineQuery: (input: unknown, options: unknown) => {
    context.list(input, options);
    return {
      currentData: context.initialLoading ? undefined : context.data,
      isLoading: false,
      isFetching: context.fetching,
      isError: context.error,
      refetch: vi.fn(),
    };
  },
  useGetAdmissionPipelineOptionsQuery: (input: unknown, options: unknown) => {
    context.options(input, options);
    return {
      currentData: { defaultMyCases: false, counsellors: [], stages: [] },
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    };
  },
}));

describe('Pipeline worklist', () => {
  it('keeps the scoped worklist mounted below the drawer and closes without losing list filters', async () => {
    context.params = new URLSearchParams(
      'board=board-1&medium=medium-1&page=2&search=Jay&application=app-1'
    );
    const view = render(<AdmissionInquiryPipelineScreen />);
    expect(screen.getByRole('dialog', { name: 'Applicant workspace' })).toHaveAttribute(
      'data-presentation',
      'drawer'
    );
    expect(context.table.data).toEqual(context.data.items);
    expect(context.list).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ skip: false })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Close applicant' }));
    expect(context.replace).toHaveBeenCalledWith(
      '/student/admissions/pipeline?board=board-1&medium=medium-1&page=2&search=Jay',
      { scroll: false }
    );
    context.params.delete('application');
    view.rerender(<AdmissionInquiryPipelineScreen />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Open row' })).toHaveFocus());
  });

  beforeEach(() => {
    vi.clearAllMocks();
    context.params = new URLSearchParams();
    context.year = 'year-1';
    context.canView = true;
    context.canAssign = false;
    context.bulkBusy = false;
    context.error = false;
    context.fetching = false;
    context.scopeLoading = false;
    context.board = 'board-1';
    context.medium = 'medium-1';
    context.initialLoading = false;
    context.data = {
      items: [
        { id: 'app-1', applicationNumber: 'APP-1', applicantName: 'QA Applicant', status: 0 },
      ],
      totalCount: 31,
    };
  });
  it('uses backend default queue and scoped server paging, rather than inquiry rows', () => {
    context.params = new URLSearchParams('page=2&size=10&search=Jay&sort=enteredAt&direction=desc');
    render(<AdmissionInquiryPipelineScreen />);
    expect(context.list).toHaveBeenCalledWith(
      expect.objectContaining({
        academicYearId: 'year-1',
        boardId: 'board-1',
        myCases: undefined,
        skipCount: 10,
        maxResultCount: 10,
        search: 'Jay',
        sorting: 'enteredAt desc',
      }),
      expect.objectContaining({ skip: false, refetchOnMountOrArgChange: true })
    );
    expect(context.table.exportLabel).toBe('Export current page');
    expect(context.table.isFilter).toBe(true);
    fireEvent.click(screen.getByText('Open row'));
    expect(context.push).toHaveBeenCalledWith(
      '/student/admissions/pipeline?page=2&size=10&search=Jay&sort=enteredAt&direction=desc&application=app-1',
      { scroll: false }
    );
  });
  it('shows skeletons while the default scope is restored, rather than a false empty result', () => {
    context.scopeLoading = true;
    context.board = '';
    context.medium = '';
    render(<AdmissionInquiryPipelineScreen />);
    expect(context.table.isLoading).toBe(true);
    expect(context.table.data).toEqual([]);
    expect(context.list).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ skip: true })
    );
  });
  it('keeps skeletons for the first scoped response and preserves safe rows on refetch', () => {
    context.initialLoading = true;
    const view = render(<AdmissionInquiryPipelineScreen />);
    expect(context.table.isLoading).toBe(true);
    context.initialLoading = false;
    context.fetching = true;
    view.rerender(<AdmissionInquiryPipelineScreen />);
    expect(context.table.isLoading).toBe(false);
    expect(context.table.data).toEqual(context.data.items);
    expect(screen.getByRole('progressbar', { name: 'Refreshing Pipeline' })).toBeInTheDocument();
  });
  it('skips both reads and hides case navigation without Application View', () => {
    context.canView = false;
    render(<AdmissionInquiryPipelineScreen />);
    expect(context.list).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ skip: true })
    );
    expect(context.options).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ skip: true })
    );
    expect(screen.queryByText('Open row')).not.toBeInTheDocument();
    expect(screen.getByText(/viewing permission is required/)).toBeInTheDocument();
  });
  it('resets pagination and hierarchy after changing global academic year', () => {
    context.params = new URLSearchParams(
      'board=board-1&medium=medium-1&class=class-1&page=4&search=Jay&queue=my'
    );
    const rendered = render(<AdmissionInquiryPipelineScreen />);
    context.replace.mockClear();
    context.year = 'year-2';
    rendered.rerender(<AdmissionInquiryPipelineScreen />);
    expect(context.replace).toHaveBeenCalledWith(
      '/student/admissions/pipeline?search=Jay&queue=my',
      { scroll: false }
    );
    expect(context.replace).toHaveBeenCalledTimes(1);
  });
  it('clamps an empty final page after a case leaves the active queue', () => {
    context.params = new URLSearchParams('page=4&size=10');
    context.data = { items: [], totalCount: 21 };
    render(<AdmissionInquiryPipelineScreen />);
    expect(context.replace).toHaveBeenCalledWith('/student/admissions/pipeline?page=3&size=10', {
      scroll: false,
    });
  });
  it('withholds rows on failure and labels background refresh without hiding safe rows', () => {
    context.error = true;
    const rendered = render(<AdmissionInquiryPipelineScreen />);
    expect(screen.getByText('Query failed')).toBeInTheDocument();
    expect(screen.queryByText('Open row')).not.toBeInTheDocument();
    context.error = false;
    context.fetching = true;
    rendered.rerender(<AdmissionInquiryPipelineScreen />);
    expect(context.table.isLoading).toBe(false);
    expect(screen.getByRole('progressbar', { name: 'Refreshing Pipeline' })).toBeInTheDocument();
  });
  it('waits for refreshed totals before changing a retained page', () => {
    context.params = new URLSearchParams('page=4&size=10');
    context.data = { items: [], totalCount: 21 };
    context.fetching = true;
    render(<AdmissionInquiryPipelineScreen />);
    expect(context.replace).not.toHaveBeenCalled();
  });

  it('adds checkbox selection only with exact Applications View and Add grants', () => {
    const rendered = render(<AdmissionInquiryPipelineScreen />);
    expect(context.table.columns.some((column: any) => column.id === 'pipeline-selection')).toBe(
      false
    );
    context.canAssign = true;
    rendered.rerender(<AdmissionInquiryPipelineScreen />);
    expect(context.table.columns[0].id).toBe('pipeline-selection');
    expect(context.bulkInput.canAssign).toBe(true);
    context.canView = false;
    rendered.rerender(<AdmissionInquiryPipelineScreen />);
    expect(context.bulkInput.canAssign).toBe(false);
  });

  it('places operational filters in the academic row and applies them in one URL update', () => {
    context.params = new URLSearchParams(
      'board=board-1&medium=medium-1&class=class-1&search=QA&page=3&size=10'
    );
    render(<AdmissionInquiryPipelineScreen />);
    expect(screen.getByTestId('academic-filter-row')).toContainElement(
      screen.getByText('Apply operational filters')
    );
    fireEvent.click(screen.getByText('Apply operational filters'));
    expect(context.replace).toHaveBeenCalledTimes(1);
    const params = new URL(context.replace.mock.calls[0][0], 'https://school.test').searchParams;
    expect(Object.fromEntries(params.entries())).toEqual({
      board: 'board-1',
      medium: 'medium-1',
      class: 'class-1',
      search: 'QA',
      size: '10',
      queue: 'all',
      counsellor: 'staff-1',
      stage: 'exam',
      status: '1',
    });
  });

  it('forwards the shared academic filter key and value without changing its contract', () => {
    render(<AdmissionInquiryPipelineScreen />);
    fireEvent.click(screen.getByText('Change board'));
    expect(context.academicUpdate).toHaveBeenCalledWith('board', 'board-2');
  });

  it('includes actor, academic scope and page filters in the selection boundary', () => {
    context.canAssign = true;
    context.params = new URLSearchParams('page=2&size=10&queue=my&search=QA');
    const rendered = render(<AdmissionInquiryPipelineScreen />);
    const initialScope = context.bulkInput.scopeKey;
    expect(JSON.parse(initialScope)).toEqual([
      'tenant-1',
      'operator-1',
      { academicYearId: 'year-1', boardId: 'board-1', mediumId: 'medium-1' },
      'page=2&size=10&queue=my&search=QA',
      true,
    ]);
    context.params = new URLSearchParams('page=3&size=10&queue=my&search=QA');
    rendered.rerender(<AdmissionInquiryPipelineScreen />);
    expect(context.bulkInput.scopeKey).not.toBe(initialScope);
  });

  it('blocks row navigation and filter/search/page changes while assignment runs', () => {
    context.canAssign = true;
    context.bulkBusy = true;
    render(<AdmissionInquiryPipelineScreen />);
    expect(screen.getByRole('link', { name: 'Open Applications' })).toHaveClass('Mui-disabled');
    expect(screen.getByText('Change board')).toBeDisabled();
    expect(screen.getByText('Apply operational filters')).toBeDisabled();
    fireEvent.click(screen.getByText('Open row'));
    context.table.onServerSearch('other');
    context.table.onServerPagination(2, 10);
    context.filterProps.onApply({ queue: 'my' });
    expect(context.push).not.toHaveBeenCalled();
    expect(context.replace).not.toHaveBeenCalled();
    expect(context.academicUpdate).not.toHaveBeenCalled();
  });
});
