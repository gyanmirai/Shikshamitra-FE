import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import AdjustmentTable from './AdjustmentTable';
import { AdjustmentTabEnum } from '../enums/adjustment.enum';

const state = vi.hoisted(() => ({ query: {} as any }));
vi.mock('react-redux', () => ({
  useSelector: (fn: any) => fn({ globalState: { currentYear: { id: 'year' } } }),
}));
vi.mock('../../hooks/useFinancePermissions', () => ({
  useFinancePermissions: () => ({ canView: true, canAdd: false }),
}));
vi.mock('../../hooks/useFinanceAcademicFilters', () => ({
  useFinanceAcademicFilters: () => ({
    isReady: true,
    filterPayload: { boardId: 'board', educationMediumId: 'medium' },
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
      data: {
        items: [
          {
            id: 'request',
            studentId: 'student',
            studentName: 'Aarav Patel',
            grNumber: '10092',
            rollNo: '2',
            status: 0,
            statusName: 'Pending',
            requestedAmount: 1000,
            createdAt: '2026-10-05',
            standardName: 'Class 3',
            divisionName: 'A',
          },
        ],
      },
      isLoading: false,
      isFetching: false,
    };
  },
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ columns, data }: any) => (
    <div>
      {data.map((row: any) => (
        <div key={row.id}>{columns[0].render(row.studentName, row)}</div>
      ))}
    </div>
  ),
}));
beforeEach(() => {
  state.query = {};
});
function show() {
  render(
    <AdjustmentTable
      activeTab={AdjustmentTabEnum.Pending}
      onTabChange={vi.fn()}
      tabCounts={{ 0: 0, 1: 0, 2: 0 }}
      onCreateAdjustment={vi.fn()}
      onView={vi.fn()}
    />
  );
}
it('sends the backend rejected status when the Rejected tab is selected', () => {
  show();
  fireEvent.click(screen.getByRole('tab', { name: /Rejected/ }));
  expect(state.query.status).toBe(1);
  expect(state.query.completedOnly).toBeUndefined();
});
it('shows the mapped student GR number so it remains searchable in the table', () => {
  show();
  expect(screen.getByText(/Aarav Patel/)).toHaveTextContent('10092');
});
