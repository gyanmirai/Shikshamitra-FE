import React from 'react';
import { it, vi, expect, describe } from 'vitest';
import { act, render } from '@testing-library/react';

import FeeStructureAssignTable from './FeeStructureAssignTable';

const state = vi.hoisted(() => ({
  query: {} as any,
  table: {} as any,
  context: {
    selectedStandardId: 'all-classes',
    selectedDivisionId: 'all-divisions',
    selectedBoard: 'board',
    selectedMedium: 'medium',
    isReady: true,
  } as any,
}));
vi.mock('react-redux', () => ({
  useSelector: () => ({ currentYear: { id: 'year' }, permissions: [] }),
}));
vi.mock('src/utils/permissions', () => ({ hasGrantedPermission: () => true }));
vi.mock('src/screens/finance/hooks/useFinanceAcademicFilters', () => ({
  ALL_CLASS_OPTION: { id: 'all-classes' },
  ALL_DIVISION_OPTION: { id: 'all-divisions' },
  useFinanceAcademicFilters: () => state.context,
}));
vi.mock('src/components/custom-select', () => ({ default: () => null }));
vi.mock('src/screens/finance/components/FinanceAcademicContextFilter', () => ({
  default: () => null,
}));
vi.mock('src/components/three-dots-actions', () => ({ default: () => null }));
vi.mock('src/redux/finance/studentFeeAssignment', () => ({
  useAssignmentStudentsQuery: (params: any) => {
    state.query = params;
    return { currentData: { items: [], totalCount: 45 }, isFetching: false };
  },
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: (props: any) => {
    state.table = props;
    return null;
  },
}));

describe('Fee assignment student table', () => {
  it('sends filters and sorting across pages, resets offsets immediately, and preserves scope', () => {
    const view = render(<FeeStructureAssignTable onAssignStructure={vi.fn()} />);
    act(() => state.table.onServerPagination(3, 10));
    expect(state.query.skipCount).toBe(20);
    expect(state.table.page).toBe(2);

    const filters = [
      { column: 'isFeeStructureAssigned', type: 'equals', value: 1, valueType: 'enum' },
      { column: 'rollNumber', type: 'between', value: { min: 2, max: 10 }, valueType: 'number' },
    ];
    act(() => state.table.onServerFilter(filters));
    expect(state.query.skipCount).toBe(0);
    expect(JSON.parse(state.query.filters)).toEqual(
      filters.map(({ valueType, ...filter }) => filter)
    );
    act(() =>
      state.table.onServerSort('rollNumber', [{ column: 'rollNumber', direction: 'desc' }])
    );
    act(() => state.table.onServerPagination(2, 10));
    expect(state.query).toMatchObject({
      skipCount: 10,
      sortBy: 'rollNumber',
      sortOrder: 'desc',
      boardId: 'board',
    });
    expect(state.query.filters).toBeDefined();

    state.context = { ...state.context, selectedDivisionId: 'division-b' };
    view.rerender(<FeeStructureAssignTable onAssignStructure={vi.fn()} />);
    expect(state.query).toMatchObject({
      skipCount: 0,
      divisionId: 'division-b',
      sortBy: 'rollNumber',
    });
    act(() => state.table.onServerSearch('10025'));
    expect(state.query).toMatchObject({ skipCount: 0, search: '10025' });
    act(() => state.table.onServerFilter([]));
    expect(state.query.filters).toBeUndefined();
  });

  it('provides typed controls for every student field and excludes action controls from export', () => {
    render(<FeeStructureAssignTable onAssignStructure={vi.fn()} />);
    [
      'studentName',
      'grNumber',
      'standardDivision',
      'boardName',
      'mediumName',
      'stageName',
      'className',
      'divisionName',
    ].forEach((id) => {
      expect(state.table.columns.find((column: any) => column.id === id)).toMatchObject({
        isFilter: true,
        isSort: true,
        filterType: 'string',
        align: 'left',
      });
    });
    expect(state.table.columns.find((column: any) => column.id === 'rollNumber')).toMatchObject({
      filterType: 'number',
      align: 'left',
      cellSx: { textAlign: 'right', verticalAlign: 'middle' },
    });
    ['isActive', 'isFeeStructureAssigned'].forEach((id) => {
      expect(state.table.columns.find((column: any) => column.id === id)).toMatchObject({
        filterType: 'enum',
        isFilter: true,
        isSort: true,
      });
    });
    ['select', 'action'].forEach((id) => {
      expect(state.table.columns.find((column: any) => column.id === id)).toMatchObject({
        isFilter: false,
        isSort: false,
        excludeFromExport: true,
      });
    });
    expect(state.table).toMatchObject({
      serverSideFilter: true,
      serverSideSort: true,
      serverSideSortMode: 'single',
    });
  });

  it('scopes dependency-review links to the requested fee head and exposes a clear action', () => {
    const view = render(
      <FeeStructureAssignTable onAssignStructure={vi.fn()} feeHeadId="tuition" />
    );
    expect(state.query.feeHeadId).toBe('tuition');
    expect(view.getByRole('link', { name: 'Clear fee head filter' })).toHaveAttribute(
      'href',
      '/finance/fee-structure-assign'
    );
  });
});
