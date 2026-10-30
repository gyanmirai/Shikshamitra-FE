import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import AdjustmentTable from './AdjustmentTable';
import { AdjustmentTabEnum } from '../enums/adjustment.enum';

const state = vi.hoisted(() => ({
  query: null as any,
  table: null as any,
  year: 'year',
  context: { boardId: 'board', educationMediumId: 'medium' } as any,
}));
vi.mock('react-redux', () => ({
  useSelector: (fn: any) => fn({ globalState: { currentYear: { id: state.year } } }),
}));
vi.mock('../../hooks/useFinancePermissions', () => ({
  useFinancePermissions: () => ({ canView: true, canAdd: false }),
}));
vi.mock('../../hooks/useFinanceAcademicFilters', () => ({
  useFinanceAcademicFilters: () => ({ isReady: true, filterPayload: state.context, classOptions: [], divisionOptions: [] }),
}));
vi.mock('../../components/FinanceAcademicContextFilter', () => ({ default: () => null }));
vi.mock('../../components/FinanceClassDivisionFilter', () => ({ default: () => null }));
vi.mock('src/redux/finance/adjustments/adjustmentApi', () => ({ useGetAdjustmentApplicationsQuery: vi.fn() }));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ params }: any) => {
    state.query = params;
    return { data: { items: [], totalCount: 250 }, isLoading: false, isFetching: false };
  },
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: (props: any) => {
    state.table = props;
    return <div>
      <button type="button" onClick={() => props.onServerPagination?.(3, 10)}>Page three</button>
      <button type="button" onClick={() => props.onServerSearch?.('456789')}>Find GR</button>
      <button type="button" onClick={() => props.onServerFilter?.([{ column: 'adjustmentAmount', type: 'greaterThan', value: '500', valueType: 'number' }])}>Amount criterion</button>
      <button type="button" onClick={() => props.onClearCriteria?.()}>Clear criteria</button>
    </div>;
  },
}));
beforeEach(() => {
  state.query = null; state.table = null; state.year = 'year';
  state.context = { boardId: 'board', educationMediumId: 'medium' };
});
function Table() {
  return <AdjustmentTable activeTab={AdjustmentTabEnum.Pending} onTabChange={vi.fn()}
    tabCounts={{ 0: 250, 1: 0, 2: 0 }} onCreateAdjustment={vi.fn()} onView={vi.fn()} />;
}
it('sends table paging, search and header criteria to the complete server result query', () => {
  render(<Table />);
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
  expect(JSON.parse(state.query.filters)).toEqual([{ column: 'adjustmentAmount', type: 'greaterThan', value: '500' }]);
});
it('resets to the first page for tab, academic context and year changes', () => {
  const view = render(<Table />);
  fireEvent.click(screen.getByText('Page three'));
  fireEvent.click(screen.getByRole('tab', { name: /Rejected/ }));
  expect(state.query).toMatchObject({ page: 1, pageSize: 10, status: 1 });
  fireEvent.click(screen.getByText('Page three'));
  state.context = { boardId: 'board', educationMediumId: 'medium', standardId: 'class', divisionId: 'division' };
  view.rerender(<Table />);
  expect(state.query).toMatchObject({ page: 1, standardId: 'class', divisionId: 'division' });
  fireEvent.click(screen.getByText('Page three'));
  state.year = 'next-year'; view.rerender(<Table />);
  expect(state.query).toMatchObject({ page: 1, academicYearId: 'next-year' });
});
it('clears search and header criteria atomically while retaining the selected page size', () => {
  render(<Table />);
  fireEvent.click(screen.getByText('Page three'));
  fireEvent.click(screen.getByText('Find GR'));
  fireEvent.click(screen.getByText('Amount criterion'));
  fireEvent.click(screen.getByText('Clear criteria'));
  expect(state.query).toMatchObject({ page: 1, pageSize: 10 });
  expect(state.query.filter).toBeUndefined(); expect(state.query.filters).toBeUndefined();
  expect(state.table.searchTerm).toBe(''); expect(state.table.filters).toEqual([]);
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
  expect(state.table.columns.filter((column: any) => column.id !== 'actions').every((column: any) => column.isFilter !== false)).toBe(true);
  expect(state.table.columns.every((column: any) => column.isSort === false)).toBe(true);
});
