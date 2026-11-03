import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { useFinanceSetupProgress } from './use-finance-setup-progress';

const mocks = vi.hoisted(() => ({ save: vi.fn(), replace: vi.fn(), push: vi.fn(), search: '' }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace, push: mocks.push }),
  useSearchParams: () => new URLSearchParams(mocks.search),
}));
vi.mock('src/redux/finance/setup/api', () => ({
  useSaveFinanceSetupProgressMutation: () => [mocks.save, { isLoading: false }],
}));
const scope = { tenantCacheKey: 'tenant-a:user-a', academicYearId: 'year-a' };
const state = {
  academicYearId: 'year-a',
  concurrencyStamp: 'v1',
  currentStageKey: 'accounts',
  currentSettingKey: 'income-categories',
  deferredSettingKeys: [],
  reviewedAt: null,
  settings: [
    {
      key: 'income-categories',
      canView: true,
      canManage: true,
      configurationState: 'empty' as const,
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.search = '';
  mocks.save.mockReturnValue({ unwrap: () => Promise.resolve(state) });
});

describe('Finance guide persistence', () => {
  it('persists deferral with the current year and concurrency stamp before navigating', async () => {
    const { result } = renderHook(() => useFinanceSetupProgress(scope, state));
    await act(async () => {
      await result.current.persist({ stage: 'fees', setting: null }, ['income-categories']);
    });
    expect(mocks.save).toHaveBeenCalledWith({
      scope,
      progress: {
        concurrencyStamp: 'v1',
        currentStageKey: 'fees',
        currentSettingKey: null,
        deferredSettingKeys: ['income-categories'],
        finishReview: false,
      },
    });
    expect(mocks.push).toHaveBeenCalledWith('/finance/setup?guideYear=year-a&stage=fees', {
      scroll: false,
    });
  });
  it('retains the current position and offers reload on a conflicting save', async () => {
    mocks.save.mockReturnValue({
      unwrap: () => Promise.reject(Object.assign(new Error('Conflict'), { status: 409 })),
    });
    const { result } = renderHook(() => useFinanceSetupProgress(scope, state));
    await act(async () => {
      await result.current.persist({ stage: 'review', setting: null });
    });
    expect(result.current.conflict).toBe(true);
    expect(result.current.position).toEqual({ stage: 'accounts', setting: 'income-categories' });
    expect(mocks.replace).not.toHaveBeenCalled();
  });
  it('does not navigate or claim saved progress after a failed request', async () => {
    mocks.save.mockReturnValue({
      unwrap: () => Promise.reject(Object.assign(new Error('Failure'), { status: 500 })),
    });
    const { result } = renderHook(() => useFinanceSetupProgress(scope, state));
    await act(async () => {
      await result.current.persist(undefined, undefined, false, '/finance/income-tracking');
    });
    expect(result.current.failed).toBe(true);
    expect(result.current.message).toContain('could not be saved');
    expect(mocks.push).not.toHaveBeenCalled();
  });
  it('ignores a save result after the guide has unmounted for a year or identity change', async () => {
    let resolve!: (value: typeof state) => void;
    mocks.save.mockReturnValue({
      unwrap: () =>
        new Promise<typeof state>((done) => {
          resolve = done;
        }),
    });
    const { result, unmount } = renderHook(() => useFinanceSetupProgress(scope, state));
    let pending!: Promise<boolean>;
    act(() => {
      pending = result.current.persist({ stage: 'review', setting: null });
    });
    unmount();
    await act(async () => {
      resolve(state);
      await pending;
    });
    expect(mocks.replace).not.toHaveBeenCalled();
  });
  it('rejects a state from another year and does not submit duplicate in-flight saves', async () => {
    const wrong = renderHook(() =>
      useFinanceSetupProgress(scope, { ...state, academicYearId: 'year-b' })
    );
    await act(async () => {
      await wrong.result.current.persist();
    });
    expect(mocks.save).not.toHaveBeenCalled();
    wrong.unmount();
    mocks.save.mockReturnValue({ unwrap: () => new Promise(() => {}) });
    const { result } = renderHook(() => useFinanceSetupProgress(scope, state));
    act(() => {
      result.current.persist();
      result.current.persist();
    });
    expect(mocks.save).toHaveBeenCalledTimes(1);
  });
  it('resumes the new year instead of applying the previous year URL position', () => {
    mocks.search = 'guideYear=year-old&stage=policies&setting=refund-policy';
    const { result } = renderHook(() => useFinanceSetupProgress(scope, state));
    expect(result.current.position).toEqual({ stage: 'accounts', setting: 'income-categories' });
  });
  it('omits deferred settings whose View permission was revoked', async () => {
    const limited = {
      ...state,
      deferredSettingKeys: ['expense-categories'],
      settings: [
        ...state.settings,
        {
          key: 'expense-categories',
          canView: false,
          canManage: false,
          configurationState: 'unavailable' as const,
        },
      ],
    };
    const { result } = renderHook(() => useFinanceSetupProgress(scope, limited));
    expect(result.current.deferred).toEqual([]);
    await act(async () => {
      await result.current.persist();
    });
    expect(mocks.save.mock.calls[0][0].progress.deferredSettingKeys).toEqual([]);
  });
});
