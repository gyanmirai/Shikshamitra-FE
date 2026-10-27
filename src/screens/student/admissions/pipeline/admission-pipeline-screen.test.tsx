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
  optionsError: false,
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
      isError: context.optionsError,
      refetch: vi.fn(),
    };
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  context.params = new URLSearchParams();
  context.year = 'year-1';
  context.canView = true;
  context.canAssign = false;
  context.bulkBusy = false;
  context.error = false;
  context.optionsError = false;
  context.fetching = false;
  context.scopeLoading = false;
  context.board = 'board-1';
  context.medium = 'medium-1';
  context.initialLoading = false;
  context.data = {
    items: [{ id: 'app-1', applicationNumber: 'APP-1', applicantName: 'QA Applicant', status: 0 }],
    totalCount: 31,
  };
});

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

  it('uses backend default queue and scoped server paging, rather than inquiry rows', () => {
    context.params = new URLSearchParams('page=2&size=10&search=Jay&sort=enteredAt&direction=desc');
    render(<AdmissionInquiryPipelineScreen />);
    expect(context.list).toHaveBeenCalledWith(
      expect.objectContaining({
        academicYearId: 'year-1',
        boardId: 'board-1',
        myCases: false,
        skipCount: 10,
        maxResultCount: 10,
        search: 'Jay',
        sorting: 'enteredAt desc',
      }),
      expect.objectContaining({ skip: false, refetchOnMountOrArgChange: true })
    );
    expect(context.table.exportLabel).toBe('Export');
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
    expect(context.table.isRefreshing).toBe(true);
  });
  it('keeps cached Pipeline rows without a competing refresh bar behind an application drawer', () => {
    context.fetching = true;
    context.params.set('application', 'app-1');
    render(<AdmissionInquiryPipelineScreen />);
    expect(context.table.isLoading).toBe(false);
    expect(context.table.data).toEqual(context.data.items);
    expect(
      screen.queryByRole('progressbar', { name: 'Refreshing Pipeline' })
    ).not.toBeInTheDocument();
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
  it('preserves safe rows on failure and labels background refresh', () => {
    context.error = true;
    const rendered = render(<AdmissionInquiryPipelineScreen />);
    expect(screen.getByText('Query failed')).toBeInTheDocument();
    expect(screen.getByText('Open row')).toBeInTheDocument();
    context.error = false;
    context.fetching = true;
    rendered.rerender(<AdmissionInquiryPipelineScreen />);
    expect(context.table.isLoading).toBe(false);
    expect(context.table.isRefreshing).toBe(true);
  });
  it('waits for refreshed totals before changing a retained page', () => {
    context.params = new URLSearchParams('page=4&size=10');
    context.data = { items: [], totalCount: 21 };
    context.fetching = true;
    render(<AdmissionInquiryPipelineScreen />);
    expect(context.replace).not.toHaveBeenCalled();
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

  it('does not mount retired bulk assignment or ownership selection even for managers', () => {
    context.canAssign = true;
    render(<AdmissionInquiryPipelineScreen />);
    expect(context.table.columns.some((column: any) => column.id === 'pipeline-selection')).toBe(
      false
    );
    expect(context.bulkInput).toEqual({});
  });
});

it('preserves the current Pipeline worklist on a failed refresh', () => {
  context.error = true;
  render(<AdmissionInquiryPipelineScreen />);
  expect(context.table.data).toEqual(context.data.items);
  expect(screen.getByText('Open row')).toBeInTheDocument();
  expect(context.table.errorContent).toBeUndefined();
});

it('shares the status criterion with top filters and sends only scalar column predicates to the server', () => {
  const filters = [
    { column: 'contactPhone', type: 'startsWith', value: '987', valueType: 'string' },
  ];
  context.params = new URLSearchParams({
    board: 'board-1',
    medium: 'medium-1',
    status: '0',
    filters: JSON.stringify(filters),
    page: '3',
  });
  render(<AdmissionInquiryPipelineScreen />);
  expect(context.list).toHaveBeenLastCalledWith(
    expect.objectContaining({ status: 0, columnFilters: JSON.stringify(filters), skipCount: 50 }),
    expect.objectContaining({ skip: false })
  );
  expect(context.filterProps.values.status).toBe(0);
  expect(context.table.filters).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ column: 'status', value: 0, displayValue: 'Draft' }),
    ])
  );
  context.table.onServerFilter([{ column: 'status', type: 'equals', value: 4, valueType: 'enum' }]);
  const target = new URL(context.replace.mock.calls.at(-1)![0], 'https://school.test');
  expect(target.searchParams.get('status')).toBe('4');
  expect(target.searchParams.has('page')).toBe(false);
  expect(target.searchParams.has('filters')).toBe(false);
});
it('keeps a successful empty list available when only operational options fail', () => {
  context.optionsError = true;
  context.data = { items: [], totalCount: 0 };
  render(<AdmissionInquiryPipelineScreen />);
  expect(context.table.data).toEqual([]);
  expect(context.table.errorContent).toBeUndefined();
  expect(context.table.isLoading).toBe(false);
  expect(screen.getByText('Query failed')).toBeInTheDocument();
});
