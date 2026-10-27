import { useEffect } from 'react';
import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import AdmissionInquiriesScreen from './admission-inquiries';

const state = vi.hoisted(() => ({
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
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('react-redux', () => ({
  useSelector: (select: (value: unknown) => unknown) =>
    select({ auth: { permissions: [], user: {} } }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: () => <h1>Admission inquiries</h1>,
}));
vi.mock('./admission-academic-filters', () => ({
  useAdmissionAcademicFilters: () => ({
    academicYearId: 'year',
    boardId: state.board,
    mediumId: state.medium,
    standardId: '',
    dashboardScope: false,
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
  AdmissionInquiryManagementPage: () => null,
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
  useGetAdmissionInquiryQuery: () => ({}),
}));
beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(state, {
    board: '',
    medium: '',
    scopeLoading: true,
    fetching: false,
    error: false,
    moving: false,
    data: undefined,
  });
});

it('never renders the empty result during scope restoration or before the first response', () => {
  const view = render(<AdmissionInquiriesScreen />);
  expect(state.query).toHaveBeenLastCalledWith({ skip: true });
  expect(screen.getByRole('status')).toHaveTextContent('Inquiry skeleton');
  expect(screen.queryByText('No inquiries awaiting admission handoff')).not.toBeInTheDocument();
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
  state.data = { items: [], totalCount: 0 };
  state.moving = true;
  state.fetching = false;
  view.rerender(<AdmissionInquiriesScreen />);
  expect(
    screen.getByRole('progressbar', { name: 'Moving inquiry to the next stage' })
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
  expect(screen.getByText('No inquiries awaiting admission handoff')).toBeInTheDocument();
  state.error = true;
  view.rerender(<AdmissionInquiriesScreen />);
  expect(screen.getByRole('alert')).toBeInTheDocument();
  expect(screen.queryByText('No inquiries awaiting admission handoff')).not.toBeInTheDocument();
  Object.assign(state, { error: false, board: '', medium: '', data: undefined });
  view.rerender(<AdmissionInquiriesScreen />);
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(screen.getByText(/Select an available academic year/)).toBeInTheDocument();
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
