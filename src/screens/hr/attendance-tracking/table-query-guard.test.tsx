import { it, vi, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { isRegisterQueryLocked } from './table-query-guard';
import { useHrTableQuery } from '../hooks/use-hr-table-query';

vi.mock('src/redux/hr/hrOperationalTableApi', () => ({
  useHrOperationalTableQuery: () => ({
    currentData: { items: [{ employeeName: 'Selected staff' }], totalCount: 125 },
    isFetching: false,
  }),
}));

it.each(['editRow', 'bulkOpen', 'isAdjusting', 'isBulkAdjusting'] as const)(
  'keeps Register criteria and selected row context while %s is active, then allows criteria after close/save',
  (flag) => {
    const resetPage = vi.fn();
    const initial = {
      editRow: null as unknown,
      bulkOpen: false,
      isAdjusting: false,
      isBulkAdjusting: false,
    };
    const { result, rerender } = renderHook(
      ({ state }) =>
        useHrTableQuery(
          {
            table: 'hr-attendance-register',
            query: { startDate: '2026-10-01', endDate: '2026-10-31' },
            page: 0,
            size: 25,
            resetPage,
            locked: isRegisterQueryLocked(state),
          },
          { currentData: { items: [{ employeeName: 'Selected staff' }], totalCount: 125 } }
        ),
      {
        initialProps: {
          state: { ...initial, [flag]: flag === 'editRow' ? { employeeId: 'selected' } : true },
        },
      }
    );
    act(() => {
      result.current.tableProps.onServerSort!('employeeName', [
        { column: 'employeeName', direction: 'desc' },
      ]);
      result.current.tableProps.onServerFilter!([
        { column: 'exceptions', type: 'contains', value: 'Locked', valueType: 'string' },
      ]);
    });
    expect(resetPage).not.toHaveBeenCalled();
    expect(result.current.tableProps.sorts).toEqual([]);
    expect(result.current.tableProps.filters).toEqual([]);
    expect(result.current.currentData.items[0].employeeName).toBe('Selected staff');
    rerender({ state: initial });
    act(() =>
      result.current.tableProps.onServerFilter!([
        { column: 'exceptions', type: 'contains', value: 'Locked', valueType: 'string' },
      ])
    );
    expect(resetPage).toHaveBeenCalledOnce();
    expect(result.current.tableProps.filters).toHaveLength(1);
  }
);
