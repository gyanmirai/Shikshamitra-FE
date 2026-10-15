import React from 'react';
import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import FeeCollectionTable from './FeeCollectionTable';

const state = vi.hoisted(() => ({ params: {} as any, table: {} as any }));
vi.mock('react-redux', () => ({ useSelector: () => ({ currentYear: { id: 'year' } }) }));
vi.mock('src/screens/finance/components/FinanceAcademicContextFilter', () => ({
  default: () => null,
}));
vi.mock('src/screens/finance/components/FinanceClassDivisionFilter', () => ({
  default: () => null,
}));
vi.mock('src/components/adaptive-three-dots-actions', () => ({ default: () => null }));
vi.mock('src/redux/feeCollection/feeCollection', () => ({ useGetFeeCollectionListQuery: vi.fn() }));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ params }: any) => {
    state.params = params;
    return {
      data: {
        totalCount: 48,
        items: [{ studentId: 'student', studentName: 'Asha', totalFees: 400, status: 0 }],
      },
    };
  },
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: (props: any) => {
    state.table = props;
    return (
      <>
        <button type="button" onClick={() => props.onServerPagination(2, 10)}>
          Second page
        </button>
        <button
          type="button"
          onClick={() =>
            props.onServerFilter([
              { column: 'status', type: 'equals', value: 0, valueType: 'enum' },
              {
                column: 'pendingFees',
                type: 'between',
                value: { min: 100, max: 500 },
                valueType: 'number',
              },
            ])
          }
        >
          Filter rows
        </button>
        <button
          type="button"
          onClick={() =>
            props.onServerSort('totalFees', [{ column: 'totalFees', direction: 'desc' }])
          }
        >
          Sort rows
        </button>
        <button type="button" onClick={() => props.onServerFilter([])}>
          Clear filters
        </button>
      </>
    );
  },
}));

function setup() {
  render(
    <FeeCollectionTable
      academicFilters={{ selectedMedium: 'medium', isReady: true, filterPayload: {} } as any}
      onAddFee={{} as any}
      onDelete={vi.fn()}
      onCollectFee={vi.fn()}
      onView={vi.fn()}
      onGiveAdjustment={vi.fn()}
    />
  );
}

describe('Collections full-result query', () => {
  it('maps one-based server callbacks to API offsets and zero-based table pages', () => {
    setup();
    fireEvent.click(screen.getByText('Second page'));
    expect(state.params.SkipCount).toBe(10);
    expect(state.table.page).toBe(1);
    fireEvent.click(screen.getByText('Filter rows'));
    expect(state.params.SkipCount).toBe(0);
    expect(JSON.parse(state.params.Filters)).toEqual([
      { column: 'status', type: 'equals', value: 0 },
      { column: 'pendingFees', type: 'between', value: { min: 100, max: 500 } },
    ]);
    fireEvent.click(screen.getByText('Sort rows'));
    expect(state.params).toMatchObject({ SortBy: 'totalFees', SortOrder: 'desc', SkipCount: 0 });
    fireEvent.click(screen.getByText('Second page'));
    expect(state.params.Filters).toBeDefined();
    expect(state.table.totalCount).toBe(48);
    fireEvent.click(screen.getByText('Clear filters'));
    expect(state.params.Filters).toBeUndefined();
  });
  it('uses proper column filters, canonical currency and sticky right controls', () => {
    setup();
    const { columns } = state.table;
    expect(
      columns
        .filter((column: any) => column.id !== 'action')
        .every((column: any) => column.isFilter)
    ).toBe(true);
    expect(columns.find((column: any) => column.id === 'totalFees').render(400)).toBe('₹ 400');
    expect(
      columns
        .find((column: any) => column.id === 'status')
        .enumOptions.map((option: any) => option.value)
    ).toEqual([0, 1, 2, 7]);
    expect(columns.slice(-2).map((column: any) => column.stickyPosition)).toEqual([
      'right',
      'right',
    ]);
    expect(columns.at(-1)).toMatchObject({
      isFilter: false,
      isSort: false,
      excludeFromExport: true,
    });
  });
});
