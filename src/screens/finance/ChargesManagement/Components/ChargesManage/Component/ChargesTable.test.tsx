import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import ChargesTable from './ChargesTable';

const mocks = vi.hoisted(() => ({ query: vi.fn(), table: vi.fn() }));

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/redux/customQueryAndMutation', () => ({ default: mocks.query }));
vi.mock('src/redux/finance/ChargeManagement/chargeApi', () => ({ useGetChargesQuery: vi.fn() }));
vi.mock('src/screens/finance/ChargesManagement/useChargePermissions', () => ({
  useChargePermissions: () => ({
    canAdd: true,
    canEdit: true,
    canDelete: true,
    canApprove: true,
    canReject: true,
    canVoid: true,
  }),
}));
vi.mock('src/screens/finance/hooks/useFinanceAcademicFilters', () => ({
  useFinanceAcademicFilters: () => ({
    boards: [],
    mediums: [],
    classOptions: [],
    divisionOptions: [],
    selectedBoard: 'board',
    selectedMedium: 'medium',
    isReady: true,
    filterPayload: { academicYearId: 'year' },
    setSelectedBoard: vi.fn(),
    setSelectedMedium: vi.fn(),
    setSelectedStandardId: vi.fn(),
    setSelectedDivisionId: vi.fn(),
  }),
}));
vi.mock('src/screens/finance/components/FinanceClassDivisionFilter', () => ({
  default: () => null,
}));
vi.mock('src/screens/finance/components/FinanceAcademicContextFilter', () => ({
  default: () => null,
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: (props: any) => {
    mocks.table(props);
    return (
      <div>
        {props.data.map((row: any) => (
          <div key={row.chargeId}>
            {props.columns
              .find((column: any) => column.id === 'workflowStatus')
              .render(row.workflowStatus)}
            {props.columns.find((column: any) => column.id === 'actions').render(null, row)}
          </div>
        ))}
      </div>
    );
  },
}));
vi.mock('src/components/adaptive-three-dots-actions', () => ({
  default: ({ actions }: any) => (
    <>
      {actions.map((action: any) => (
        <button key={action.id} type="button" onClick={action.onClick}>
          {action.label}
        </button>
      ))}
    </>
  ),
}));

const props = {
  onView: vi.fn(),
  onEdit: vi.fn(),
  onAddCharge: vi.fn(),
  onApprove: vi.fn(),
  onReject: vi.fn(),
  onVoid: vi.fn(),
  onRemove: vi.fn(),
  setSelectedTab: vi.fn(),
};

describe('Charge lifecycle inbox', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.query.mockImplementation(({ params }) => ({
      data: {
        items: [
          {
            chargeId: 'charge',
            chargeName: 'School trip',
            dueDate: '2026-10-14T00:00:00+05:30',
            amount: 500,
            studentCount: 2,
            processedCount: 2,
            workflowStatus: params.status,
            displayStatus: params.status,
            availableActions: params.status === 0 ? ['View', 'Approve', 'Reject'] : ['View'],
          },
        ],
        pendingCount: 4,
        inProcessCount: 3,
        completedCount: 2,
        rejectedCount: 1,
        totalCount: 1,
      },
      isLoading: false,
      isFetching: false,
    }));
  });

  it('shows all four server counts and queries the selected lifecycle', async () => {
    render(<ChargesTable {...props} selectedTab={0} />);
    ['Pending 4', 'In Process 3', 'Completed 2', 'Rejected 1'].forEach((label) => {
      expect(screen.getByRole('tab', { name: label })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('tab', { name: 'Completed 2' }));
    await waitFor(() =>
      expect(mocks.query.mock.lastCall?.[0].params).toMatchObject({
        status: 2,
        page: 1,
        academicYearId: 'year',
      })
    );
    expect(screen.getByText('Completed', { selector: 'span' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Rejected 1' }));
    await waitFor(() => expect(mocks.query.mock.lastCall?.[0].params.status).toBe(3));
  });

  it('permits approval and rejection only for pending rows with server actions', () => {
    render(<ChargesTable {...props} selectedTab={0} />);
    fireEvent.click(screen.getByRole('button', { name: 'Approve School trip' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reject School trip' }));
    expect(props.onApprove).toHaveBeenCalledOnce();
    expect(props.onReject).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('tab', { name: 'In Process 3' }));
    expect(screen.queryByRole('button', { name: 'Approve School trip' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reject School trip' })).not.toBeInTheDocument();
  });

  it('uses one-based API pages and preserves filters and sorting while paging', () => {
    render(<ChargesTable {...props} selectedTab={0} />);
    const filter = {
      column: 'studentCount',
      type: 'between',
      value: { min: 2, max: 5 },
      valueType: 'number',
    };
    act(() => mocks.table.mock.lastCall?.[0].onServerPagination(2, 20));
    expect(mocks.query.mock.lastCall?.[0].params.page).toBe(2);
    act(() => mocks.table.mock.lastCall?.[0].onServerFilter([filter]));
    expect(mocks.query.mock.lastCall?.[0].params.page).toBe(1);
    expect(JSON.parse(mocks.query.mock.lastCall?.[0].params.filters)).toEqual([
      { column: 'studentCount', type: 'between', value: { min: 2, max: 5 } },
    ]);
    act(() =>
      mocks.table.mock.lastCall?.[0].onServerSort('amount', [
        { column: 'amount', direction: 'desc' },
      ])
    );
    act(() => mocks.table.mock.lastCall?.[0].onServerPagination(3, 10));
    expect(mocks.query.mock.lastCall?.[0].params).toMatchObject({
      page: 3,
      pageSize: 10,
      sortBy: 'amount',
      sortOrder: 'desc',
    });
    expect(mocks.table.mock.lastCall?.[0].filters).toEqual([filter]);
    act(() => mocks.table.mock.lastCall?.[0].onServerFilter([]));
    expect(mocks.query.mock.lastCall?.[0].params.filters).toBeUndefined();
    expect(mocks.query.mock.lastCall?.[0].params.page).toBe(1);
  });

  it('keeps ordinary filters but clears the status filter when changing tabs', () => {
    render(<ChargesTable {...props} selectedTab={0} />);
    const filters = [
      { column: 'chargeName', type: 'contains', value: 'Trip', valueType: 'string' },
      { column: 'workflowStatus', type: 'equals', value: 0, valueType: 'enum' },
    ];
    act(() => mocks.table.mock.lastCall?.[0].onServerFilter(filters));
    fireEvent.click(screen.getByRole('tab', { name: 'Completed 2' }));
    expect(mocks.table.mock.lastCall?.[0].filters).toEqual([filters[0]]);
    expect(mocks.query.mock.lastCall?.[0].params.status).toBe(2);
  });

  it('sends local calendar dates and pins filterable Status before unfiltered Actions', () => {
    render(<ChargesTable {...props} selectedTab={0} />);
    act(() =>
      mocks.table.mock.lastCall?.[0].onServerFilter([
        { column: 'dueDate', type: 'equals', value: '14-10-2026', valueType: 'date' },
      ])
    );
    const params = mocks.query.mock.lastCall?.[0].params;
    expect(JSON.parse(params.filters)[0].value).toMatch(/^2026-10-14T00:00:00[+-]\d{2}:\d{2}$/);
    const table = mocks.table.mock.lastCall?.[0];
    expect(table.serverSideFilter).toBe(true);
    expect(table.isFilter).not.toBe(false);
    expect(table.columns.slice(-2).map((col: any) => col.id)).toEqual([
      'workflowStatus',
      'actions',
    ]);
    expect(table.columns.at(-2)).toMatchObject({ filterType: 'enum', stickyPosition: 'right' });
    expect(table.columns.at(-1)).toMatchObject({
      isFilter: false,
      isSort: false,
      excludeFromExport: true,
      stickyPosition: 'right',
    });
  });
});
