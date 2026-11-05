import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import AdjustmentTable from './AdjustmentTable';
import { AdjustmentTabEnum, AdjustmentStatusEnum } from '../enums/adjustment.enum';

// Icon rendering is unrelated to authorization and would fetch external SVGs.
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const state = vi.hoisted(() => ({
  query: null as any,
  table: null as any,
  year: 'year',
  userId: 'checker',
  canAdd: false,
  items: [] as any[],
  context: { boardId: 'board', educationMediumId: 'medium' } as any,
}));
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
}));
vi.mock('react-redux', () => ({
  useSelector: (fn: any) =>
    fn({ globalState: { currentYear: { id: state.year } }, auth: { user: { sub: state.userId } } }),
}));
vi.mock('../../hooks/useFinancePermissions', () => ({
  useFinancePermissions: () => ({
    canView: true, canAdd: state.canAdd,
    canApprove: state.canAdd, canReject: state.canAdd,
  }),
}));
vi.mock('../../hooks/useFinanceAcademicFilters', () => ({
  useFinanceAcademicFilters: () => ({
    isReady: true,
    filterPayload: state.context,
    classOptions: [],
    divisionOptions: [],
  }),
}));
vi.mock('../../components/FinanceAcademicContextFilter', () => ({ default: () => null }));
vi.mock('../../components/FinanceClassDivisionFilter', () => ({ default: () => null }));
vi.mock('src/redux/finance/adjustments/adjustmentApi', () => ({
  useGetAdjustmentApplicationsQuery: vi.fn(),
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ params }: any) => {
    state.query = params;
    return {
      data: { items: state.items, totalCount: 250 },
      currentData: { items: state.items, totalCount: 250 },
      isLoading: false,
      isFetching: false,
    };
  },
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: (props: any) => {
    state.table = props;
    return (
      <div>
        <button type="button" onClick={() => props.onServerPagination?.(3, 10)}>
          Page three
        </button>
        <button type="button" onClick={() => props.onServerSearch?.('456789')}>
          Find GR
        </button>
        <button
          type="button"
          onClick={() =>
            props.onServerFilter?.([
              {
                column: 'adjustmentAmount',
                type: 'greaterThan',
                value: '500',
                valueType: 'number',
              },
            ])
          }
        >
          Amount criterion
        </button>
        <button type="button" onClick={() => props.onClearCriteria?.()}>
          Clear criteria
        </button>
        <button
          type="button"
          onClick={() =>
            props.onServerFilter?.([
              { column: 'status', type: 'contains', value: 'Pending', valueType: 'string' },
            ])
          }
        >
          Pending criterion
        </button>
      </div>
    );
  },
}));
beforeEach(() => {
  window.history.replaceState(null, '', '/finance/adjustments');
  state.query = null;
  state.table = null;
  state.year = 'year';
  state.userId = 'checker';
  state.canAdd = false;
  state.context = { boardId: 'board', educationMediumId: 'medium' };
  state.items = [];
});
it('restores status, paging, search and criteria from the URL', () => {
  window.history.replaceState(
    null,
    '',
    `/finance/adjustments?adjustmentTab=2&adjustmentPage=3&adjustmentSize=25&adjustmentSearch=10260&adjustmentFilters=${encodeURIComponent(
      JSON.stringify([
        { column: 'adjustmentAmount', type: 'greaterThan', value: '100', valueType: 'number' },
      ])
    )}`
  );
  render(<Table />);
  expect(state.query).toMatchObject({ status: 1, page: 3, pageSize: 25, filter: '10260' });
  expect(JSON.parse(state.query.filters)).toEqual([
    { column: 'adjustmentAmount', type: 'greaterThan', value: '100' },
  ]);
});

it('restores a historical page across status groups instead of replacing it with page one', async () => {
  window.history.replaceState(null, '', '/finance/adjustments?adjustmentPage=3');
  const view = render(<Table />);
  expect(state.query.page).toBe(3);
  fireEvent.click(screen.getByRole('tab', { name: /Approved/ }));
  expect(state.query).toMatchObject({ page: 1, completedOnly: true });
  window.history.replaceState(null, '', '/finance/adjustments?adjustmentPage=3');
  view.rerender(<Table />);
  await waitFor(() => expect(state.query).toMatchObject({ page: 3, status: 0 }));
});
function Table() {
  return (
    <AdjustmentTable
      activeTab={AdjustmentTabEnum.Pending}
      onTabChange={vi.fn()}
      tabCounts={{ 0: 250, 1: 0, 2: 0 }}
      onCreateAdjustment={vi.fn()}
      onView={vi.fn()}
    />
  );
}
it('sends table paging, search and header criteria to the complete server result query', () => {
  render(<Table />);
  expect(state.table.errorContent).toBeUndefined();
  expect(state.table.error).toBeUndefined();
  expect(state.table.serverSidePagination).toBe(true);
  expect(state.table.serverSideSearch).toBe(true);
  expect(state.table.serverSideFilter).toBe(true);
  expect(state.table.totalCount).toBe(250);
  fireEvent.click(screen.getByText('Page three'));
  expect(state.query).toMatchObject({ page: 3, pageSize: 10 });
  expect(state.table.page).toBe(2);
  fireEvent.click(screen.getByText('Find GR'));
  expect(state.query).toMatchObject({ page: 1, pageSize: 10, filter: '456789' });
  fireEvent.click(screen.getByText('Page three'));
  fireEvent.click(screen.getByText('Amount criterion'));
  expect(state.query.page).toBe(1);
  expect(JSON.parse(state.query.filters)).toEqual([
    { column: 'adjustmentAmount', type: 'greaterThan', value: '500' },
  ]);
});
it('resets to the first page for tab, academic context and year changes', () => {
  const view = render(<Table />);
  fireEvent.click(screen.getByText('Page three'));
  fireEvent.click(screen.getByRole('tab', { name: /Rejected/ }));
  expect(state.query).toMatchObject({ page: 1, pageSize: 10, status: 1 });
  fireEvent.click(screen.getByText('Page three'));
  state.context = {
    boardId: 'board',
    educationMediumId: 'medium',
    standardId: 'class',
    divisionId: 'division',
  };
  view.rerender(<Table />);
  expect(state.query).toMatchObject({ page: 1, standardId: 'class', divisionId: 'division' });
  fireEvent.click(screen.getByText('Page three'));
  state.year = 'next-year';
  view.rerender(<Table />);
  expect(state.query).toMatchObject({ page: 1, academicYearId: 'next-year' });
});
it('clears search and header criteria atomically while retaining the selected page size', () => {
  render(<Table />);
  fireEvent.click(screen.getByText('Page three'));
  fireEvent.click(screen.getByText('Find GR'));
  fireEvent.click(screen.getByText('Amount criterion'));
  fireEvent.click(screen.getByText('Clear criteria'));
  expect(state.query).toMatchObject({ page: 1, pageSize: 10 });
  expect(state.query.filter).toBeUndefined();
  expect(state.query.filters).toBeUndefined();
  expect(state.table.searchTerm).toBe('');
  expect(state.table.filters).toEqual([]);
});
it('uses text operators for roll identifiers and displayed status labels', () => {
  render(<Table />);
  const field = (id: string) => state.table.columns.find((column: any) => column.id === id);
  expect(field('rollNumber').filterType).toBe('string');
  expect(field('status').filterType).toBe('string');
  expect(field('adjustmentAmount').filterType).toBe('number');
  expect(field('createdAt').filterType).toBe('date');
});

it('keeps server-supported header filters while disabling page-local sort controls', () => {
  render(<Table />);
  expect(
    state.table.columns
      .filter((column: any) => column.id !== 'actions')
      .every((column: any) => column.isFilter !== false)
  ).toBe(true);
  expect(state.table.columns.every((column: any) => column.isSort === false)).toBe(true);
});

it('clears a conflicting status criterion when switching worklist groups', () => {
  render(<Table />);
  fireEvent.click(screen.getByText('Pending criterion'));
  fireEvent.click(screen.getByRole('tab', { name: /Rejected/ }));
  expect(state.query.status).toBe(1);
  expect(state.query.filters).toBeUndefined();
});

it.each(['creator', 'checker'])(
  'shows decision actions only to a different user with Add: %s',
  (userId) => {
    state.userId = userId;
    state.canAdd = true;
    state.items = [
      {
        id: 'request',
        studentId: 'student',
        studentName: 'Student',
        grNumber: '1001',
        rollNo: '1',
        standardName: 'Class 1',
        divisionName: 'A',
        adjustmentType: 0,
        adjustmentTypeName: 'Fee adjustment',
        requestedAmount: 100,
        appliedAmount: 0,
        remainingAmount: 100,
        status: AdjustmentStatusEnum.Pending,
        statusName: 'Pending',
        availableActions: ['Approve', 'Reject'],
        requestedByUserId: 'creator',
        requestedByName: 'Creator',
        createdAt: '2026-11-03T00:00:00Z',
      },
    ];
    render(
      <AdjustmentTable
        activeTab={AdjustmentTabEnum.Pending}
        onTabChange={vi.fn()}
        tabCounts={{ 0: 1, 1: 0, 2: 0 }}
        onCreateAdjustment={vi.fn()}
        onView={vi.fn()}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />
    );
    const decisions = state.table.columns.find((column: any) => column.id === 'actions');
    if (userId === 'creator') {
      expect(decisions).toBeUndefined();
      expect(screen.queryByRole('button', { name: /^Approve/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^Reject/ })).not.toBeInTheDocument();
    } else {
      expect(decisions).toBeDefined();
      render(decisions.render(undefined, state.table.data[0]));
      expect(screen.getByRole('button', { name: /^Approve/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Reject/ })).toBeInTheDocument();
    }
  }
);

it.each([
  AdjustmentStatusEnum.Pending,
  AdjustmentStatusEnum.Approved,
  AdjustmentStatusEnum.Rejected,
  AdjustmentStatusEnum.Cancelled,
])('hides the Actions column when status %s has no row action', (status) => {
  state.canAdd = true;
  state.items = [{
    id: 'request', studentId: 'student', studentName: 'Student',
    requestedAmount: 100, appliedAmount: 0, remainingAmount: 100,
    status, statusName: 'Status', requestedByUserId: 'creator',
    availableActions: [], createdAt: '2026-11-03T00:00:00Z',
  }];
  render(<AdjustmentTable activeTab={AdjustmentTabEnum.Pending} onView={vi.fn()}
    onApprove={vi.fn()} onReject={vi.fn()} />);
  expect(state.table.columns.some((column: any) => column.id === 'actions')).toBe(false);
});

it('keeps Actions when one partially applied row can still be approved', () => {
  state.canAdd = true;
  state.items = [
    { id: 'paid', studentId: 'student', studentName: 'Paid', requestedAmount: 100,
      status: AdjustmentStatusEnum.Approved, requestedByUserId: 'creator', availableActions: [] },
    { id: 'partial', studentId: 'student', studentName: 'Partial', requestedAmount: 100,
      status: AdjustmentStatusEnum.PartiallyApplied, requestedByUserId: 'creator',
      availableActions: ['Approve'] },
  ];
  render(<AdjustmentTable activeTab={AdjustmentTabEnum.Approved} onView={vi.fn()}
    onApprove={vi.fn()} onReject={vi.fn()} />);
  expect(state.table.columns.some((column: any) => column.id === 'actions')).toBe(true);
});
