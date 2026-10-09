import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import AdmissionInquiryPipelineScreen from '../admission-inquiry-pipeline';

const context = vi.hoisted(() => ({
  params: new URLSearchParams(),
  year: 'year-1',
  canView: true,
  replace: vi.fn(),
  push: vi.fn(),
  list: vi.fn(),
  options: vi.fn(),
  data: { items: [{ id: 'app-1', applicationNumber: 'APP-1' }], totalCount: 31 },
  error: false,
  fetching: false,
  table: {} as Record<string, any>,
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
        ],
      },
    }),
}));
vi.mock('../admission-academic-filters', () => ({
  useAdmissionAcademicFilters: () => ({
    academicYearId: context.year,
    boardId: 'board-1',
    mediumId: 'medium-1',
    standardId: '',
    update: vi.fn(),
    clear: vi.fn(),
  }),
  AdmissionAcademicFilters: () => null,
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
        <button type="button" onClick={() => props.handleRowClick(props.data[0])}>
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
      currentData: context.data,
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
  beforeEach(() => {
    vi.clearAllMocks();
    context.params = new URLSearchParams();
    context.year = 'year-1';
    context.canView = true;
    context.error = false;
    context.fetching = false;
    context.data = { items: [{ id: 'app-1', applicationNumber: 'APP-1' }], totalCount: 31 };
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
    expect(
      new URL(context.push.mock.calls[0][0], 'https://school.test').searchParams.get('returnTo')
    ).toBe('/student/admissions/pipeline?page=2&size=10&search=Jay&sort=enteredAt&direction=desc');
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
  it('withholds stale rows on query failure and marks refresh busy', () => {
    context.error = true;
    const rendered = render(<AdmissionInquiryPipelineScreen />);
    expect(screen.getByText('Query failed')).toBeInTheDocument();
    expect(screen.queryByText('Open row')).not.toBeInTheDocument();
    context.error = false;
    context.fetching = true;
    rendered.rerender(<AdmissionInquiryPipelineScreen />);
    expect(context.table.isLoading).toBe(true);
  });
  it('waits for refreshed totals before changing a retained page', () => {
    context.params = new URLSearchParams('page=4&size=10');
    context.data = { items: [], totalCount: 21 };
    context.fetching = true;
    render(<AdmissionInquiryPipelineScreen />);
    expect(context.replace).not.toHaveBeenCalled();
  });
});
