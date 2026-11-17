import { StrictMode } from 'react';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useStudentSetupVisit } from './use-student-setup-visit';
import { useStudentSetupProgress } from './use-student-setup-progress';

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  push: vi.fn(),
  record: vi.fn(),
  save: vi.fn(),
  query: 'stage=admissions&setting=admission-periods&action=create&recordId=record-a',
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace, push: mocks.push }),
  useSearchParams: () => new URLSearchParams(mocks.query),
}));
vi.mock('src/redux/student/setup/api', () => ({
  useRecordStudentSetupVisitMutation: () => [mocks.record],
  useSaveStudentSetupProgressMutation: () => [mocks.save, { isLoading: false, isError: false }],
}));
const saved = {
  academicYearId: 'year-a',
  concurrencyStamp: 'v1',
  currentStageKey: 'admissions',
  currentSettingKey: 'admission-periods',
  deferredSettingKeys: [],
  reviewedAt: null,
  settings: [
    { key: 'admission-periods', canView: true, canManage: true, configurationState: 'empty' as const },
  ],
};
beforeEach(() => {
  vi.clearAllMocks();
  mocks.query = 'stage=admissions&setting=admission-periods&action=create&recordId=record-a';
  mocks.record.mockReturnValue({ unwrap: () => Promise.resolve({ firstVisit: true }) });
  mocks.save.mockReturnValue({ unwrap: () => Promise.resolve(saved) });
});

describe('Student guide first visit and saved navigation', () => {
  it('ignores a different year URL cursor and restores that year’s server progress', () => {
    mocks.query = 'guideYear=year-a&stage=review';
    const otherYear = { ...saved, academicYearId: 'year-b', currentStageKey: 'admissions' };
    const hook = renderHook(() => useStudentSetupProgress({ tenantCacheKey: 'a', academicYearId: 'year-b' }, otherYear));
    expect(hook.result.current.position).toEqual({ stage: 'admissions', setting: 'admission-periods' });
  });

  it('does not start a second write while the first progress save is pending', async () => {
    let complete: () => void = () => {};
    mocks.save.mockReturnValue({ unwrap: () => new Promise<void>((resolve) => { complete = resolve; }) });
    const hook = renderHook(() => useStudentSetupProgress({ tenantCacheKey: 'a', academicYearId: 'year-a' }, saved));
    let pending: Promise<boolean>;
    act(() => { pending = hook.result.current.persist(); });
    await act(async () => { expect(await hook.result.current.persist()).toBe(false); });
    expect(mocks.save).toHaveBeenCalledTimes(1);
    await act(async () => { complete(); await pending; });
  });

  it('does not navigate when the academic scope changes during a pending save', async () => {
    let complete: () => void = () => {};
    mocks.save.mockReturnValue({ unwrap: () => new Promise<void>((resolve) => { complete = resolve; }) });
    const hook = renderHook(({ year }) => useStudentSetupProgress({ tenantCacheKey: 'a', academicYearId: year }, { ...saved, academicYearId: year }),
      { initialProps: { year: 'year-a' } });
    let pending: Promise<boolean>;
    act(() => { pending = hook.result.current.persist(); });
    hook.rerender({ year: 'year-b' });
    await act(async () => { complete(); await pending; });
    expect(mocks.replace).not.toHaveBeenCalled();
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it('reports navigation immediately, through the save and until the destination URL arrives', async () => {
    let complete: () => void = () => {};
    mocks.save.mockReturnValue({ unwrap: () => new Promise<void>((resolve) => { complete = resolve; }) });
    const hook = renderHook(() => useStudentSetupProgress({ tenantCacheKey: 'a', academicYearId: 'year-a' }, saved));
    let pending: Promise<boolean>;
    act(() => { pending = hook.result.current.move({ stage: 'review', setting: null }); });
    expect(hook.result.current.navigating).toBe(true);
    await act(async () => { complete(); await pending; });
    expect(hook.result.current.navigating).toBe(true);
    mocks.query = 'stage=review';
    hook.rerender();
    expect(hook.result.current.navigating).toBe(false);
    mocks.query = 'stage=admissions&setting=admission-periods';
    hook.rerender();
    expect(hook.result.current.navigating).toBe(false);
  });

  it('stops navigation feedback after a failed save and retains the current position', async () => {
    mocks.save.mockReturnValue({ unwrap: () => Promise.reject(new Error('offline')) });
    const hook = renderHook(() => useStudentSetupProgress({ tenantCacheKey: 'a', academicYearId: 'year-a' }, saved));
    await act(async () => { await hook.result.current.move({ stage: 'numbering', setting: 'gr-number' }); });
    expect(hook.result.current.navigating).toBe(false);
    expect(hook.result.current.position).toEqual({ stage: 'admissions', setting: 'admission-periods' });
    expect(hook.result.current.message).toContain('could not be saved');
  });

  it('records once under StrictMode and removes automatic opening after the winning visit', async () => {
    const hook = renderHook(
      ({ query }) => useStudentSetupVisit('school-a', query, '/student/admissions/pipeline'),
      {
        wrapper: StrictMode,
        initialProps: { query: 'source=automatic&returnTo=%2Fstudent%2Fadmissions%2Fpipeline' },
      }
    );
    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith(
        '/student/setup?returnTo=%2Fstudent%2Fadmissions%2Fpipeline',
        { scroll: false }
      )
    );
    expect(hook.result.current.ready).toBe(false);
    hook.rerender({ query: 'returnTo=%2Fstudent%2Fadmissions%2Fpipeline' });
    await waitFor(() => expect(hook.result.current.ready).toBe(true));
    expect(mocks.record).toHaveBeenCalledTimes(1);
  });

  it('returns a concurrent subsequent visitor to their original route', async () => {
    mocks.record.mockReturnValue({ unwrap: () => Promise.resolve({ firstVisit: false }) });
    const hook = renderHook(() =>
      useStudentSetupVisit('school-a', 'source=automatic', '/student/admissions/pipeline')
    );
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith('/student/admissions/pipeline'));
    expect(hook.result.current.ready).toBe(false);
  });

  it('requires an explicit retry after a visit write fails', async () => {
    mocks.record.mockReturnValueOnce({ unwrap: () => Promise.reject(new Error('offline')) });
    const hook = renderHook(() => useStudentSetupVisit('school-a', '', '/student/dashboard'));
    await waitFor(() => expect(hook.result.current.failed).toBe(true));
    expect(hook.result.current.ready).toBe(false);
    expect(mocks.replace).not.toHaveBeenCalled();
    act(() => hook.result.current.retry());
    await waitFor(() => expect(hook.result.current.ready).toBe(true));
    expect(mocks.record).toHaveBeenCalledTimes(2);
  });

  it('keeps an open setting form URL when saving the current guide position', async () => {
    const hook = renderHook(() =>
      useStudentSetupProgress({ tenantCacheKey: 'a', academicYearId: 'year-a' }, saved)
    );
    await act(async () => {
      await hook.result.current.persist();
    });
    expect(mocks.replace).toHaveBeenCalledWith(`/student/setup?${mocks.query}&guideYear=year-a`, { scroll: false });
    await act(async () => {
      await hook.result.current.move({ stage: 'numbering', setting: 'gr-number' });
    });
    expect(mocks.replace).toHaveBeenLastCalledWith(
      '/student/setup?stage=numbering&setting=gr-number&guideYear=year-a',
      { scroll: false }
    );
  });

  it('does not navigate after leaving while the visit write is pending', async () => {
    let complete: (result: { firstVisit: boolean }) => void = () => {};
    mocks.record.mockReturnValue({
      unwrap: () =>
        new Promise((resolve) => {
          complete = resolve;
        }),
    });
    const hook = renderHook(() =>
      useStudentSetupVisit('school-a', 'source=automatic', '/student/admissions/pipeline')
    );
    hook.unmount();
    await act(async () => {
      complete({ firstVisit: false });
    });
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it('retains a failed deferral, cursor and form URL and does not navigate on conflict', async () => {
    mocks.save.mockReturnValue({
      unwrap: () => Promise.reject(Object.assign(new Error('Conflict'), { status: 409 })),
    });
    const hook = renderHook(() =>
      useStudentSetupProgress({ tenantCacheKey: 'a', academicYearId: 'year-a' }, saved)
    );
    await act(async () => {
      await hook.result.current.persist({ stage: 'numbering', setting: 'gr-number' }, [
        'admission-periods',
      ]);
    });
    expect(hook.result.current.conflict).toBe(true);
    expect(hook.result.current.deferred).toEqual(['admission-periods']);
    expect(hook.result.current.position).toEqual({ stage: 'admissions', setting: 'admission-periods' });
    expect(mocks.replace).not.toHaveBeenCalled();
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it('pins a resumed cursor while another user changes saved progress in the background', () => {
    mocks.query = '';
    const initial = {
      ...saved,
      settings: [
        ...saved.settings,
        { key: 'houses', canView: true, canManage: true, configurationState: 'empty' as const },
      ],
    };
    const hook = renderHook(
      ({ state }) =>
        useStudentSetupProgress({ tenantCacheKey: 'a', academicYearId: 'year-a' }, state),
      { initialProps: { state: initial } }
    );
    expect(hook.result.current.position).toEqual({ stage: 'admissions', setting: 'admission-periods' });
    hook.rerender({
      state: {
        ...initial,
        concurrencyStamp: 'v2',
        currentStageKey: 'records',
        currentSettingKey: 'houses',
      },
    });
    expect(hook.result.current.position).toEqual({ stage: 'admissions', setting: 'admission-periods' });
  });

  it('does not navigate after leaving while a guide save is pending', async () => {
    let complete: (result: typeof saved) => void = () => {};
    mocks.save.mockReturnValue({
      unwrap: () =>
        new Promise((resolve) => {
          complete = resolve;
        }),
    });
    const hook = renderHook(() =>
      useStudentSetupProgress({ tenantCacheKey: 'a', academicYearId: 'year-a' }, saved)
    );
    let pending: Promise<boolean>;
    act(() => {
      pending = hook.result.current.move({ stage: 'numbering', setting: 'gr-number' });
    });
    hook.unmount();
    await act(async () => {
      complete(saved);
      await pending;
    });
    expect(mocks.replace).not.toHaveBeenCalled();
    expect(mocks.push).not.toHaveBeenCalled();
  });
});



