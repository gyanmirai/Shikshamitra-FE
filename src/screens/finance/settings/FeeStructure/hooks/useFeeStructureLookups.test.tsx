import { it, vi, expect } from 'vitest';
import { waitFor, fireEvent, renderHook } from '@testing-library/react';
import { useGetRefundPoliciesQuery } from 'src/redux/finance/refundPolicy';
import { useGetCollectionPoliciesQuery } from 'src/redux/finance/collectionPolicy';
import { useGetActiveFeeHeadsQuery } from 'src/redux/feeHeadManage/feeHeadManageApi';
import {
  useGetStructureContextQuery,
  useGetStructureCatalogueQuery,
  useGetStructureTermScheduleQuery,
} from 'src/redux/finance/feeStructureWorkspace';
import { useGetPaymentTermsQuery, useGetPaymentTermByIdQuery } from 'src/redux/finance/paymentTerm';

import { defaultPolicy } from '../feeStructureModel';
import useFeeStructureLookups, { useCatalog } from './useFeeStructureLookups';

vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ currentQueryAndMutation, params, options }: any) =>
    currentQueryAndMutation(params, options),
}));
vi.mock('src/redux/finance/refundPolicy', () => ({
  useGetRefundPoliciesQuery: vi.fn(),
  useGetRefundPolicyByIdQuery: vi.fn(() => ({})),
}));
vi.mock('src/redux/finance/concessionPolicy', () => ({ useGetConcessionPoliciesQuery: vi.fn() }));
vi.mock('src/redux/finance/collectionPolicy', () => ({
  useGetCollectionPoliciesQuery: vi.fn(),
  useGetCollectionPolicyByIdQuery: vi.fn(() => ({})),
}));
vi.mock('src/redux/feeHeadManage/feeHeadManageApi', () => ({ useGetActiveFeeHeadsQuery: vi.fn() }));
vi.mock('src/redux/finance/feeStructureWorkspace', () => ({
  useGetStructureContextQuery: vi.fn(),
  useGetStructureCatalogueQuery: vi.fn(),
  useGetStructureTermScheduleQuery: vi.fn(),
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

const scope = { feeStructureMetadataId: 'metadata', standardId: 'class' };
function mockLookups() {
  const permissions = { collectionRead: true, refundRead: true, termsRead: true, headsRead: true };
  vi.mocked(useGetStructureContextQuery).mockReturnValue({
    currentData: { academicYearId: 'year', boardId: 'board', permissions },
  } as any);
  vi.mocked(useGetActiveFeeHeadsQuery).mockReturnValue({ currentData: [] } as any);
  vi.mocked(useGetStructureTermScheduleQuery).mockReturnValue({} as any);
  const policies = ['collection', 'refund'].flatMap((family) =>
    Array.from({ length: 101 }, (_, index) => ({
      family,
      id: family + index,
      name: family + index,
      versionId: family + '-version',
      versionNumber: 1,
      isCurrent: true,
      isDefault: index === 100,
    }))
  );
  vi.mocked(useGetStructureCatalogueQuery).mockReturnValue({
    currentData: { policies, terms: [] },
    isFetching: false,
    isError: false,
  } as any);
}
it('uses one complete lightweight catalogue including defaults after the hundredth choice', () => {
  mockLookups();
  const { result } = renderHook(() => useFeeStructureLookups(scope, true));
  expect(result.current.catalogs.refund.ready).toBe(true);
  expect(result.current.settings?.policies).toHaveLength(202);
  expect(defaultPolicy(result.current.settings!, 'collection')?.id).toBe('collection100');
  expect(defaultPolicy(result.current.settings!, 'refund')?.id).toBe('refund100');
  expect(useGetStructureCatalogueQuery).toHaveBeenLastCalledWith(
    { ...scope, academicYearId: 'year' },
    expect.objectContaining({ skip: false })
  );
});
it('fetches only the requested pinned schedule when its dialog is active', () => {
  mockLookups();
  const line = {
    paymentTermId: 'term',
    paymentTermVersionId: 'historical-version',
    paymentTermName: 'Saved term',
  } as any;
  vi.mocked(useGetStructureTermScheduleQuery).mockReturnValue({
    currentData: { id: 'term', name: 'Renamed', versionId: 'historical-version', installments: [] },
  } as any);
  const { result } = renderHook(() => useFeeStructureLookups(scope, true, line, true));
  expect(useGetStructureTermScheduleQuery).toHaveBeenLastCalledWith(
    { ...scope, paymentTermId: 'term', versionId: 'historical-version' },
    expect.objectContaining({ skip: false })
  );
  expect(result.current.scheduleTerm?.name).toBe('Saved term');
});
it('keeps failed catalogue options but blocks publication readiness until retry succeeds', () => {
  mockLookups();
  const { result, rerender } = renderHook(() => useFeeStructureLookups(scope, true));
  const policies = result.current.settings!.policies;
  vi.mocked(useGetStructureCatalogueQuery).mockReturnValue({
    currentData: { policies, terms: [] },
    isError: true,
  } as any);
  rerender();
  expect(result.current.catalogs.collection.ready).toBe(false);
  expect(result.current.catalogs.collection.error).toBe(true);
  expect(result.current.settings?.policies).toHaveLength(202);
});
it('skips unactivated catalogue and schedule requests while retaining context actions', () => {
  mockLookups();
  const { result } = renderHook(() => useFeeStructureLookups(scope, true, undefined, false, false));
  expect(useGetStructureCatalogueQuery).toHaveBeenLastCalledWith(
    { ...scope, academicYearId: 'year' },
    expect.objectContaining({ skip: true })
  );
  expect(useGetStructureTermScheduleQuery).toHaveBeenLastCalledWith(
    expect.anything(),
    expect.objectContaining({ skip: true })
  );
  expect(result.current.settings?.permissions.termsRead).toBe(true);
});
