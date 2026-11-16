import { useEffect } from 'react';
import { it, vi, expect, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';

import AdmissionInquiriesScreen from './admission-inquiries';
import { loadInquiryOverviewForm } from './inquiry-management/inquiry-overview-loader';
import { preloadInquiryWorkspace } from './inquiry-management/preload-inquiry-workspace';

const state = vi.hoisted(() => ({
  params: '',
  canView: false,
  linked: undefined as { id: string; applicantName: string } | undefined,
  linkedFetching: false,
  board: '',
  medium: '',
  scopeLoading: true,
  fetching: false,
  error: false,
  moving: false,
  data: undefined as
    { items: { id: string; applicantName: string }[]; totalCount: number } | undefined,
  query: vi.fn(),
  table: {} as Record<string, unknown>,
  push: vi.fn(),
  academicYearId: 'year' as string | undefined,
  updateAcademic: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push: state.push }),
  useSearchParams: () => new URLSearchParams(state.params),
}));
vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: (select: (value: unknown) => unknown) =>
    select({
      auth: {
        permissions: [{ name: 'Students.Admissions.Inquiries.View', isGranted: state.canView }],
        user: {},
      },
    }),
}));
vi.mock('./inquiry-management/inquiry-overview-loader', () => ({
  loadInquiryOverviewForm: vi.fn(async () => undefined),
}));
vi.mock('./inquiry-management/preload-inquiry-workspace', () => ({
  preloadInquiryWorkspace: vi.fn(),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: () => <h1>Admission inquiries</h1>,
}));
vi.mock('./admission-academic-filters', () => ({
  useAdmissionAcademicFilters: () => ({
    academicYearId: state.academicYearId,
    boardId: state.board,
    mediumId: state.medium,
    standardId: '',
    dashboardScope: false,
    update: state.updateAcademic,
  }),
  AdmissionAcademicFilters: function Filters({
    onLoadingChange,
  }: {
    onLoadingChange: (value: boolean) => void;
  }) {
    const loading = state.scopeLoading;
    useEffect(() => onLoadingChange(loading), [loading, onLoadingChange]);
    return <div>Academic filters</div>;
  },
}));
vi.mock('./inquiry-management/use-inquiry-handoff', () => ({
  useInquiryHandoff: () => ({ moving: state.moving, canMove: true, move: vi.fn() }),
}));
vi.mock('./inquiry-management/inquiry-follow-up-dialog', () => ({
  InquiryFollowUpDialog: () => null,
}));
vi.mock('./inquiry-management/admission-inquiry-management-page', () => ({
  AdmissionInquiryManagementPage: ({
    inquiry,
    onClose,
  }: {
    inquiry: { applicantName: string };
    onClose: () => void;
  }) => (
    <div>
      Editing {inquiry.applicantName}
      <button type="button" onClick={onClose}>
        Back to inquiries
      </button>
    </div>
  ),
}));
vi.mock('./inquiry-management/admission-inquiry-columns', () => ({
  buildAdmissionInquiryColumns: () => [],
}));
vi.mock('./admission-query-error', () => ({
  AdmissionQueryError: () => <div role="alert">Could not load inquiries</div>,
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: (props: {
    isLoading: boolean;
    data: { applicantName: string }[];
    noDataText: string;
    errorContent?: React.ReactNode;
  }) => {
    state.table = props;
    if (props.errorContent) return props.errorContent;
    if (props.isLoading) return <div role="status">Inquiry skeleton</div>;
    return props.data.length ? (
      <div>{props.data[0].applicantName}</div>
    ) : (
      <div>{props.noDataText}</div>
    );
  },
}));
vi.mock('src/redux/student/admissions/admission-inquiries-api', () => ({
  useGetAdmissionInquiriesQuery: (_input: unknown, options: unknown) => {
    state.query(options);
    return {
      currentData: state.data,
      isLoading: false,
      isFetching: state.fetching,
      isError: state.error,
    };
  },
  useGetAdmissionInquiryQuery: () => ({
    currentData: state.linked,
    data: state.linked,
    isFetching: state.linkedFetching,
  }),
}));
beforeEach(() => {
  vi.clearAllMocks();
  window.history.replaceState(null, '', '/student/admissions/inquiries');
  Object.assign(state, {
    params: '',
    academicYearId: 'year',
    canView: false,
    linked: undefined,
    linkedFetching: false,
    board: '',
    medium: '',
    scopeLoading: true,
    fetching: false,
    error: false,
    moving: false,
    data: undefined,
  });
});

it('does not clear the linked inquiry scope when the initial academic year is restored', () => {
  Object.assign(state, {
    academicYearId: undefined,
    params: 'board=board&medium=medium&inquiryId=a',
    linked: { id: 'a', applicantName: 'A' },
  });
  const view = render(<AdmissionInquiriesScreen />);
  state.academicYearId = 'year';
  view.rerender(<AdmissionInquiriesScreen />);
  expect(screen.getByText('Editing A')).toBeInTheDocument();
  expect(state.updateAcademic).not.toHaveBeenCalled();
});

it('still clears dependent academic scope when an already selected year changes', () => {
  const view = render(<AdmissionInquiriesScreen />);
  state.academicYearId = 'next-year';
  view.rerender(<AdmissionInquiriesScreen />);
  expect(state.updateAcademic).toHaveBeenCalledExactlyOnceWith('board', '');
});

it('starts the list read on initial year restoration even when scope is already resolved', () => {
  Object.assign(state, {
    academicYearId: undefined,
    board: 'board',
    medium: 'medium',
    scopeLoading: false,
  });
  const view = render(<AdmissionInquiriesScreen />);
  expect(state.query).toHaveBeenLastCalledWith({ skip: true });
  state.academicYearId = 'year';
  view.rerender(<AdmissionInquiriesScreen />);
  expect(state.query).toHaveBeenLastCalledWith({ skip: false });
  expect(state.updateAcademic).not.toHaveBeenCalled();
});

it.each(['', '/school'])(
  'preserves scope, filters, hash and base path %s without a server navigation',
  (basePath) => {
    const filters = 'board=board&medium=medium&search=QA&status=1&dashboard=inquiry-followups';
    const pathname = `${basePath}/student/admissions/inquiries`;
    window.history.replaceState(null, '', `${pathname}?${filters}#worklist`);
    Object.assign(state, {
      params: filters,
      board: 'board',
      medium: 'medium',
      scopeLoading: false,
      data: { items: [{ id: 'a', applicantName: 'A' }], totalCount: 1 },
    });
    const view = render(<AdmissionInquiriesScreen />);
    act(() =>
      (state.table.handleRowClick as (row: unknown) => void)({ id: 'a', applicantName: 'A' })
    );
    expect(window.location.pathname).toBe(pathname);
    expect(window.location.search).toBe(`?${filters}&inquiryId=a`);
    expect(window.location.hash).toBe('#worklist');
    expect(state.push).not.toHaveBeenCalled();
    state.params = `${filters}&inquiryId=a`;
    state.linked = { id: 'a', applicantName: 'A' };
    view.rerender(<AdmissionInquiriesScreen />);
    act(() => screen.getByRole('button', { name: 'Back to inquiries' }).click());
    expect(window.location.search).toBe(`?${filters}`);
    expect(window.location.pathname).toBe(pathname);
    expect(window.location.hash).toBe('#worklist');
    expect(state.push).not.toHaveBeenCalled();
    state.params = filters;
    view.rerender(<AdmissionInquiriesScreen />);
    expect(screen.queryByText('Editing A')).not.toBeInTheDocument();
  }
);

it('never renders the empty result during scope restoration or before the first response', () => {
  const view = render(<AdmissionInquiriesScreen />);
  expect(state.query).toHaveBeenLastCalledWith({ skip: true });
  expect(screen.getByRole('status')).toHaveTextContent('Inquiry skeleton');
  expect(screen.queryByText('No Inquiries Awaiting Admission Handoff')).not.toBeInTheDocument();
  Object.assign(state, { board: 'board', medium: 'medium', scopeLoading: false, fetching: true });
  view.rerender(<AdmissionInquiriesScreen />);
  expect(state.table.isLoading).toBe(true);
  state.fetching = false;
  state.data = { items: [{ id: 'inquiry', applicantName: 'QA Loading' }], totalCount: 1 };
  view.rerender(<AdmissionInquiriesScreen />);
  expect(screen.getByText('QA Loading')).toBeInTheDocument();
});

it('keeps safe rows visible on refetch and handoff progress visible after the moved row disappears', () => {
  Object.assign(state, {
    board: 'board',
    medium: 'medium',
    scopeLoading: false,
    fetching: true,
    data: { items: [{ id: 'inquiry', applicantName: 'QA Loading' }], totalCount: 1 },
  });
  const view = render(<AdmissionInquiriesScreen />);
  expect(state.table.isLoading).toBe(false);
  expect(screen.getByText('QA Loading')).toBeInTheDocument();
  expect(state.table.isRefreshing).toBe(true);
  expect(state.table.refreshIndicator).toBe('skeleton');
  state.data = { items: [], totalCount: 0 };
  state.moving = true;
  state.fetching = false;
  view.rerender(<AdmissionInquiriesScreen />);
  expect(
    screen.getByRole('status', { name: 'Moving Inquiry to the Next Stage' })
  ).toBeInTheDocument();
});

it('distinguishes successful empty, failed and unavailable-scope results from initial loading', () => {
  Object.assign(state, {
    board: 'board',
    medium: 'medium',
    scopeLoading: false,
    data: { items: [], totalCount: 0 },
  });
  const view = render(<AdmissionInquiriesScreen />);
  expect(screen.getByText('No Inquiries Awaiting Admission Handoff')).toBeInTheDocument();
  state.error = true;
  view.rerender(<AdmissionInquiriesScreen />);
  expect(screen.getByRole('alert')).toBeInTheDocument();
  expect(screen.queryByText('No Inquiries Awaiting Admission Handoff')).not.toBeInTheDocument();
  Object.assign(state, { error: false, board: '', medium: '', data: undefined });
  view.rerender(<AdmissionInquiriesScreen />);
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(screen.getByText(/Select an Available Academic Year/)).toBeInTheDocument();
});

it('preserves same-scope rows and the table when a refresh fails', () => {
  Object.assign(state, {
    board: 'board',
    medium: 'medium',
    scopeLoading: false,
    error: true,
    data: { items: [{ id: 'inquiry', applicantName: 'Safe inquiry' }], totalCount: 1 },
  });
  render(<AdmissionInquiriesScreen />);
  expect(screen.getByText('Safe inquiry')).toBeInTheDocument();
  expect(state.table.totalCount).toBe(1);
  expect(state.table.errorContent).toBeUndefined();
});

it('follows URL record changes and never displays a stale response for another inquiry', () => {
  Object.assign(state, { params: 'inquiryId=a', linked: { id: 'a', applicantName: 'A' } });
  const view = render(<AdmissionInquiriesScreen />);
  expect(screen.getByText('Editing A')).toBeInTheDocument();
  Object.assign(state, { params: 'inquiryId=b', linkedFetching: true });
  view.rerender(<AdmissionInquiriesScreen />);
  expect(screen.queryByText('Editing A')).not.toBeInTheDocument();
  expect(screen.getByLabelText('Loading Inquiry')).toBeInTheDocument();
  state.linked = { id: 'b', applicantName: 'B' };
  view.rerender(<AdmissionInquiriesScreen />);
  expect(screen.getByText('Editing B')).toBeInTheDocument();
});

it('opens a row immediately then lets Back and Forward own the displayed record', () => {
  Object.assign(state, {
    board: 'board',
    medium: 'medium',
    scopeLoading: false,
    data: { items: [{ id: 'a', applicantName: 'A' }], totalCount: 1 },
  });
  const view = render(<AdmissionInquiriesScreen />);
  act(() =>
    (state.table.handleRowClick as (row: unknown) => void)({ id: 'a', applicantName: 'A' })
  );
  expect(screen.getByText('Editing A')).toBeInTheDocument();
  Object.assign(state, { params: 'inquiryId=a', linked: { id: 'a', applicantName: 'A' } });
  view.rerender(<AdmissionInquiriesScreen />);
  state.params = '';
  view.rerender(<AdmissionInquiriesScreen />);
  expect(screen.queryByText('Editing A')).not.toBeInTheDocument();
  state.params = 'inquiryId=a';
  view.rerender(<AdmissionInquiriesScreen />);
  expect(screen.getByText('Editing A')).toBeInTheDocument();
});

it.each([true, false])(
  'starts click preparation only with the existing View grant (%s)',
  (canView) => {
    Object.assign(state, {
      canView,
      board: 'board',
      medium: 'medium',
      scopeLoading: false,
      data: { items: [{ id: 'a', applicantName: 'A' }], totalCount: 1 },
    });
    render(<AdmissionInquiriesScreen />);
    act(() =>
      (state.table.handleRowClick as (row: unknown) => void)({ id: 'a', applicantName: 'A' })
    );
    expect(screen.getByText('Editing A')).toBeInTheDocument();
    expect(preloadInquiryWorkspace).toHaveBeenCalledTimes(canView ? 1 : 0);
    expect(loadInquiryOverviewForm).toHaveBeenCalledTimes(canView ? 1 : 0);
  }
);
