import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { useHrTableQuery, operationalColumnTypes } from './use-hr-table-query';

const rpc = vi.hoisted(() => ({
  read: vi.fn(),
  retry: vi.fn(),
  page: {} as Record<string, unknown>,
}));
vi.mock('src/redux/hr/hrOperationalTableApi', () => ({
  useHrOperationalTableQuery: (body: unknown, options: unknown) => {
    rpc.read(body, options);
    return rpc.page;
  },
}));

const base = {
  currentData: { items: [{ id: 'loaded-page-row' }], totalCount: 301 },
  data: { items: [{ id: 'loaded-page-row' }], totalCount: 301 },
  isFetching: false,
  isLoading: false,
  isError: false,
  error: undefined,
  refetch: vi.fn(),
};
const resetPage = vi.fn();
const options = {
  table: 'hr-leave-requests',
  query: { academicYearId: 'synthetic-year', status: 0, isTeaching: false },
  page: 3,
  size: 10,
  resetPage,
};

describe('authorized operational table query adapter', () => {
  beforeEach(() => {
    rpc.read.mockClear();
    resetPage.mockClear();
    rpc.page = {
      currentData: { items: [{ id: 'matching-beyond-first-page' }], totalCount: 25 },
      isFetching: false,
      isError: false,
      refetch: rpc.retry,
    };
  });
  it('keeps the owning reader fast path until criteria are selected, then requests global typed criteria', () => {
    const { result } = renderHook(() => useHrTableQuery(options, base));
    expect(result.current.currentData).toBe(base.currentData);
    expect(rpc.read.mock.lastCall?.[1]).toMatchObject({ skip: true });
    act(() =>
      result.current.tableProps.onServerFilter!([
        {
          column: 'totalDays',
          type: 'greaterThan',
          value: 0.5,
          valueType: 'number',
          label: 'Days',
        },
      ])
    );
    expect(resetPage).toHaveBeenCalledOnce();
    expect(rpc.read.mock.lastCall).toEqual([
      {
        table: 'hr-leave-requests',
        query: options.query,
        offset: 30,
        size: 10,
        criteria: {
          search: '',
          sorts: [],
          filters: [{ column: 'totalDays', type: 'greaterThan', value: 0.5 }],
        },
      },
      { skip: undefined, refetchOnMountOrArgChange: true },
    ]);
    expect(result.current.currentData?.items[0].id).toBe('matching-beyond-first-page');
    expect(options.query.status).toBe(0);
    expect(options.query.isTeaching).toBe(false);
    act(() =>
      result.current.tableProps.onServerSort!('startDate', [
        { column: 'startDate', direction: 'desc' },
      ])
    );
    expect(rpc.read.mock.lastCall?.[0].criteria.sorts).toEqual([
      { column: 'startDate', direction: 'desc' },
    ]);
  });
  it('does not show a baseline page when a criteria request fails or is loading', () => {
    rpc.page = { currentData: undefined, isFetching: true, isError: false, refetch: rpc.retry };
    const { result, rerender } = renderHook(() => useHrTableQuery(options, base));
    act(() =>
      result.current.tableProps.onServerSort!('startDate', [
        { column: 'startDate', direction: 'asc' },
      ])
    );
    expect(result.current.data).toBeUndefined();
    expect(result.current.isFetching).toBe(true);
    rpc.page = {
      currentData: undefined,
      isFetching: false,
      isError: true,
      error: { status: 403 },
      refetch: rpc.retry,
    };
    rerender();
    expect(result.current.currentData).toBeUndefined();
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toEqual({ status: 403 });
    expect(result.current.refetch).toBe(rpc.retry);
  });
  it('returns to the owning reader after clearing criteria and preserves skip and editing locks', () => {
    const { result, rerender } = renderHook(
      ({ locked }) => useHrTableQuery({ ...options, locked, skip: true }, base),
      { initialProps: { locked: false } }
    );
    act(() =>
      result.current.tableProps.onServerFilter!([
        { column: 'totalDays', type: 'equals', value: 0, valueType: 'number', label: 'Days' },
      ])
    );
    expect(rpc.read.mock.lastCall?.[1].skip).toBe(true);
    act(() => result.current.tableProps.onServerFilter!([]));
    expect(result.current.currentData).toBe(base.currentData);
    resetPage.mockClear();
    rerender({ locked: true });
    act(() =>
      result.current.tableProps.onServerSort!('startDate', [
        { column: 'startDate', direction: 'asc' },
      ])
    );
    expect(result.current.tableProps.sorts).toEqual([]);
    expect(resetPage).not.toHaveBeenCalled();
    expect(result.current.tableProps.serverColumnTypes).toEqual({});
  });
  it('provides real server search for readers without an existing search contract', () => {
    const { result } = renderHook(() =>
      useHrTableQuery({ ...options, table: 'hr-professional-tax', genericSearch: true }, base)
    );
    act(() => result.current.tableProps.onServerSearch!('Gujarat'));
    expect(rpc.read.mock.lastCall?.[0].criteria.search).toBe('Gujarat');
    expect(result.current.tableProps.searchTerm).toBe('Gujarat');
    expect(resetPage).toHaveBeenCalledOnce();
  });
  it('uses the agreed numeric/date field types and exposes no action or hidden staff bank field', () => {
    expect(operationalColumnTypes('hr-pf-rules').wageCeiling).toBe('money');
    expect(operationalColumnTypes('employee-table').dob).toBe('date');
    expect(operationalColumnTypes('employee-onboarding-table').submittedAt).toBe('datetime');
    expect(operationalColumnTypes('hr-attendance-import-rows').rowNumber).toBe('number');
    expect(operationalColumnTypes('employee-table')).not.toHaveProperty('bankAccountNumber');
    expect(operationalColumnTypes('employee-table')).not.toHaveProperty('actions');
  });
});
