import { it, vi, expect } from 'vitest';
import { waitFor, renderHook } from '@testing-library/react';

import { useCatalog } from './useFeeStructureLookups';

vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ currentQueryAndMutation, params, options }: any) =>
    currentQueryAndMutation(params, options),
}));
vi.mock('src/redux/finance/refundPolicy', () => ({ useGetRefundPoliciesQuery: vi.fn() }));
vi.mock('src/redux/finance/prorationPolicy', () => ({ useGetProrationPoliciesQuery: vi.fn() }));
vi.mock('src/redux/finance/concessionPolicy', () => ({ useGetConcessionPoliciesQuery: vi.fn() }));
vi.mock('src/redux/finance/collectionPolicy', () => ({ useGetCollectionPoliciesQuery: vi.fn() }));
vi.mock('src/redux/feeHeadManage/feeHeadManageApi', () => ({ useGetActiveFeeHeadsQuery: vi.fn() }));
vi.mock('src/redux/finance/feeStructureWorkspace', () => ({
  useGetStructureContextQuery: vi.fn(),
}));
vi.mock('src/redux/finance/paymentTerm', () => ({
  useGetPaymentTermsQuery: vi.fn(),
  useGetPaymentTermByIdQuery: vi.fn(),
}));

it('loads later pages before declaring defaults ready and preserves their IDs', async () => {
  const pages = [
    { items: Array.from({ length: 100 }, (_, id) => ({ id: String(id) })), totalCount: 101 },
    { items: [{ id: 'default-on-second-page', isDefault: true }], totalCount: 101 },
  ];
  const query = vi.fn(({ page }) => ({
    currentData: pages[page - 1],
    isFetching: false,
    isError: false,
  }));
  const { result } = renderHook(() => useCatalog(query, { academicYearId: 'year' }, true));
  await waitFor(() => expect(result.current.ready).toBe(true));
  expect(result.current.items).toHaveLength(101);
  expect(result.current.items.at(-1)?.id).toBe('default-on-second-page');
});

it('does not consume stale cached pages while a fresh request is running', async () => {
  const old = { items: [{ id: 'old' }], totalCount: 1 };
  const fresh = { items: [{ id: 'new' }], totalCount: 1 };
  let fetching = true;
  const query = () => ({
    currentData: fetching ? old : fresh,
    isFetching: fetching,
    isError: false,
  });
  const { result, rerender } = renderHook(() =>
    useCatalog(query, { academicYearId: 'year' }, true)
  );
  expect(result.current.ready).toBe(false);
  expect(result.current.items).toEqual([]);
  fetching = false;
  rerender();
  await waitFor(() => expect(result.current.ready).toBe(true));
  expect(result.current.items).toEqual([{ id: 'new' }]);
});

it('reports a changing/incomplete catalog instead of spinning forever', async () => {
  const data = { items: [], totalCount: 2 };
  const query = () => ({ currentData: data, isFetching: false, isError: false });
  const { result } = renderHook(() => useCatalog(query, { academicYearId: 'year' }, true));
  await waitFor(() => expect(result.current.error).toBe(true));
  expect(result.current.loading).toBe(false);
  expect(result.current.ready).toBe(false);
});

it('keeps loaded options available after a failed refresh but does not initialize defaults', async () => {
  const data = { items: [{ id: 'monthly', isDefault: true }], totalCount: 1 };
  let failed = false;
  const query = () => ({ currentData: data, isFetching: false, isError: failed });
  const { result, rerender } = renderHook(() =>
    useCatalog(query, { academicYearId: 'year' }, true)
  );
  await waitFor(() => expect(result.current.ready).toBe(true));
  failed = true;
  rerender();
  expect(result.current.error).toBe(true);
  expect(result.current.ready).toBe(false);
  expect(result.current.items).toEqual(data.items);
});
