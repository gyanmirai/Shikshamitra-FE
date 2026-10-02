import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

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
    fireEvent.click(screen.getByTitle('Approve'));
    fireEvent.click(screen.getByTitle('Reject'));
    expect(props.onApprove).toHaveBeenCalledOnce();
    expect(props.onReject).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('tab', { name: 'In Process 3' }));
    expect(screen.queryByTitle('Approve')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Reject')).not.toBeInTheDocument();
  });
});
