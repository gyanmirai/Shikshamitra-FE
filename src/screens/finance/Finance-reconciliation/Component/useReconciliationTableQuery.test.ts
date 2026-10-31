import { it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useReconciliationTableQuery } from './useReconciliationTableQuery';

const scope = { academicYearId: 'year', paymentMethod: 'Cheque', month: 10, year: 2026 };
it('resets the page for a changed server filter while retaining search and page size', () => {
  const { result, rerender } = renderHook((params) => useReconciliationTableQuery(params), {
    initialProps: scope,
  });
  act(() => result.current.tableProps.onServerSearch('Aarav'));
  act(() => result.current.tableProps.onServerPagination(3, 25));
  expect(result.current.params).toMatchObject({ page: 3, pageSize: 25, search: 'Aarav' });
  rerender({ ...scope, month: 11 });
  expect(result.current.params).toMatchObject({
    page: 1,
    pageSize: 25,
    search: 'Aarav',
    month: 11,
  });
});
it('resets the API page when search is entered or cleared', () => {
  const { result } = renderHook(() => useReconciliationTableQuery(scope));
  act(() => result.current.tableProps.onServerPagination(4, 10));
  act(() => result.current.tableProps.onServerSearch('2075'));
  expect(result.current.params).toMatchObject({ page: 1, search: '2075' });
  act(() => result.current.tableProps.onServerPagination(2, 10));
  act(() => result.current.tableProps.onServerSearch(''));
  expect(result.current.params?.page).toBe(1);
  expect(result.current.params?.search).toBeUndefined();
});

it('does not restore an old page when returning to a previous month', () => {
  const { result, rerender } = renderHook((params) => useReconciliationTableQuery(params), {
    initialProps: scope,
  });
  act(() => result.current.tableProps.onServerPagination(3, 10));
  rerender({ ...scope, month: 11 });
  expect(result.current.params?.page).toBe(1);
  rerender(scope);
  expect(result.current.params?.page).toBe(1);
});

it('sends controlled column criteria before paging and clears back to the first page', () => {
  const { result, rerender } = renderHook((params) => useReconciliationTableQuery(params), { initialProps: scope });
  act(() => result.current.tableProps.onServerSearch('2075'));
  act(() => result.current.tableProps.onServerPagination(4, 25));
  const filters = [{ column: 'amount', type: 'greaterThan', value: 7000, valueType: 'number' }];
  act(() => (result.current.tableProps as any).onServerFilter(filters));
  expect(result.current.params).toMatchObject({ page: 1, pageSize: 25, search: '2075', filters: '[{"column":"amount","type":"greaterThan","value":7000}]' });
  expect(result.current.tableProps).toMatchObject({ isFilter: true, serverSideFilter: true, filters });
  act(() => result.current.tableProps.onServerPagination(2, 25));
  rerender({ ...scope, month: 11 });
  expect(result.current.params).toMatchObject({ page: 1, pageSize: 25, search: '2075' });
  expect((result.current.params as any).filters).toContain('greaterThan');
  act(() => (result.current.tableProps as any).onServerFilter([]));
  expect((result.current.params as any).filters).toBeUndefined();
  expect(result.current.params).toMatchObject({ page: 1, pageSize: 25, search: '2075' });
});

it.each(['Cash', 'OnlineGateway', 'Wallet'])('%s retains server paging/search without unsupported column menus', (paymentMethod) => {
  const { result } = renderHook(() => useReconciliationTableQuery({ ...scope, paymentMethod }));
  expect(result.current.tableProps).toMatchObject({ isFilter: false, serverSideFilter: false, serverSidePagination: true, serverSideSearch: true });
  expect(result.current.params?.filters).toBeUndefined();
});

it.each([1, 2, 3, 4, 5, 6, '1', '2', '3', '4', '5', '6'])('supports the runtime numeric payment-method value %s', (paymentMethod) => {
  const { result } = renderHook(() => useReconciliationTableQuery({ ...scope, paymentMethod }));
  const filters = [{ column: 'amount', type: 'greaterThan', value: '7500', valueType: 'number' }];
  act(() => (result.current.tableProps as any).onServerFilter(filters));
  expect(result.current.params).toMatchObject({ paymentMethod, page: 1, filters: '[{"column":"amount","type":"greaterThan","value":"7500"}]' });
  expect(result.current.tableProps).toMatchObject({ serverSideFilter: true, isFilter: true });
});
it.each([0, 7, 8, '0', '7', '8', 'Cash', 'OnlineGateway', 'Wallet'])('omits server filter callbacks for unsupported method %s', (paymentMethod) => {
  const { result } = renderHook(() => useReconciliationTableQuery({ ...scope, paymentMethod }));
  expect(result.current.tableProps.onServerFilter).toBeUndefined();
  expect(result.current.tableProps.filters).toEqual([]);
  expect(result.current.params?.filters).toBeUndefined();
});
