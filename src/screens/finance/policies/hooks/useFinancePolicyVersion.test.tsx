import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { useFinancePolicyVersion } from './useFinancePolicyVersion';

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  pages: {} as Record<string, { totalCount: number; items: any[] }>,
  stale: undefined as unknown,
  requests: [] as Array<{ id: string; skipCount: number; maxResultCount: number }>,
}));
vi.mock('src/redux/finance/collectionPolicy', () => ({ useGetCollectionPolicyVersionsQuery: mocks.query }));
vi.mock('src/redux/finance/concessionPolicy', () => ({ useGetConcessionPolicyVersionsQuery: mocks.query }));
vi.mock('src/redux/finance/refundPolicy', () => ({ useGetRefundPolicyVersionsQuery: mocks.query }));
vi.mock('src/redux/finance/prorationPolicy', () => ({ useGetProrationPolicyVersionsQuery: mocks.query }));
vi.mock('src/redux/finance/audit/financeAuditApi', () => ({ useGetFinanceEntityAuditEventsQuery: () => ({}) }));

beforeEach(() => {
  mocks.pages = {};
  mocks.stale = undefined;
  mocks.requests = [];
  mocks.query.mockImplementation((args, options) => {
    if (options.skip) return {};
    mocks.requests.push(args);
    const data = mocks.pages[`${args.id}:${args.skipCount}`];
    return { currentData: data, data: data ?? mocks.stale, isFetching: !data, isError: false, refetch: vi.fn() };
  });
});

const record = (n: number) => ({
  id: `v${n}`, versionNumber: n, snapshotJson: JSON.stringify({ flatAmount: n * 10 }),
  creationTime: '2026-11-17T10:00:00Z', changeAction: n === 1 ? 'created' : 'edited',
});

describe('policy history paging', () => {
  it.each(['collection', 'concession', 'refund', 'proration'])('pages %s history with a correct boundary comparison', (policyType) => {
    mocks.pages['policy:0'] = { totalCount: 22, items: Array.from({ length: 21 }, (_, i) => record(22 - i)) };
    mocks.pages['policy:20'] = { totalCount: 22, items: [record(2), record(1)] };
    const { result } = renderHook(() => useFinancePolicyVersion({ open: true, policyType, policyId: 'policy' }));
    expect(mocks.requests.at(-1)).toEqual({ id: 'policy', skipCount: 0, maxResultCount: 21 });
    expect(result.current.versions).toHaveLength(20);
    act(() => result.current.setSelectedVersionId('v3'));
    expect(result.current.selectedVersion?.changedFields).toEqual([{ field: 'flatAmount', oldValue: 20, newValue: 30 }]);
    act(() => result.current.setPage(1));
    expect(mocks.requests.at(-1)).toEqual({ id: 'policy', skipCount: 20, maxResultCount: 21 });
    expect(result.current.versions.map((item) => item.versionNumber)).toEqual([2, 1]);
    expect(result.current.totalCount).toBe(22);
    act(() => result.current.setSelectedVersionId('v1'));
    expect(result.current.selectedVersion?.changedFields).toEqual([{ field: 'flatAmount', oldValue: null, newValue: 10 }]);
  });

  it('does not reuse another policy history while the new request is pending', () => {
    mocks.pages['first:0'] = { totalCount: 1, items: [record(1)] };
    const { result, rerender } = renderHook(({ id }) => useFinancePolicyVersion({ open: true, policyType: 'refund', policyId: id }), {
      initialProps: { id: 'first' },
    });
    mocks.stale = mocks.pages['first:0'];
    rerender({ id: 'second' });
    expect(result.current.versions).toEqual([]);
    expect(result.current.selectedVersion).toBeNull();
    expect(result.current.page).toBe(0);
    expect(result.current.isLoading).toBe(true);
  });

  it('reopens on the latest page after browsing older history', () => {
    mocks.pages['policy:0'] = { totalCount: 22, items: [record(22), record(21)] };
    mocks.pages['policy:20'] = { totalCount: 22, items: [record(2), record(1)] };
    const { result, rerender } = renderHook(({ open }) => useFinancePolicyVersion({ open, policyType: 'refund', policyId: 'policy' }), {
      initialProps: { open: true },
    });
    act(() => result.current.setPage(1));
    rerender({ open: false });
    rerender({ open: true });
    expect(result.current.page).toBe(0);
    expect(result.current.selectedVersion?.versionNumber).toBe(22);
  });
});
