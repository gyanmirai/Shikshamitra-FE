import { StrictMode } from 'react';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useAcademicSetupVisit } from './use-academic-setup-visit';
import { useAcademicSetupProgress } from './use-academic-setup-progress';

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  push: vi.fn(),
  record: vi.fn(),
  save: vi.fn(),
  query: 'stage=curriculum&setting=subjects&action=create&recordId=record-a',
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace, push: mocks.push }),
  useSearchParams: () => new URLSearchParams(mocks.query),
}));
vi.mock('src/redux/academic-setup/api', () => ({
  useRecordAcademicSetupVisitMutation: () => [mocks.record],
  useSaveAcademicSetupProgressMutation: () => [mocks.save, { isLoading: false, isError: false }],
}));
const saved = {
  academicYearId: 'year-a',
  concurrencyStamp: 'v1',
  currentStageKey: 'curriculum',
  currentSettingKey: 'subjects',
  deferredSettingKeys: [],
  reviewedAt: null,
  settings: [
    { key: 'subjects', canView: true, canManage: true, configurationState: 'empty' as const },
  ],
};
beforeEach(() => {
  vi.clearAllMocks();
  mocks.query = 'stage=curriculum&setting=subjects&action=create&recordId=record-a';
  mocks.record.mockReturnValue({ unwrap: () => Promise.resolve({ firstVisit: true }) });
  mocks.save.mockReturnValue({ unwrap: () => Promise.resolve(saved) });
});

describe('Academic guide first visit and saved navigation', () => {
  it('reports navigation immediately, through the save and until the destination URL arrives', async () => {
    let complete: () => void = () => {};
    mocks.save.mockReturnValue({ unwrap: () => new Promise<void>((resolve) => { complete = resolve; }) });
    const hook = renderHook(() => useAcademicSetupProgress({ tenantCacheKey: 'a', academicYearId: 'year-a' }, saved));
    let pending: Promise<boolean>;
    act(() => { pending = hook.result.current.move({ stage: 'review', setting: null }); });
    expect(hook.result.current.navigating).toBe(true);
    await act(async () => { complete(); await pending; });
    expect(hook.result.current.navigating).toBe(true);
    mocks.query = 'stage=review';
    hook.rerender();
    expect(hook.result.current.navigating).toBe(false);
    mocks.query = 'stage=curriculum&setting=subjects';
    hook.rerender();
    expect(hook.result.current.navigating).toBe(false);
  });

  it('stops navigation feedback after a failed save and retains the current position', async () => {
    mocks.save.mockReturnValue({ unwrap: () => Promise.reject(new Error('offline')) });
    const hook = renderHook(() => useAcademicSetupProgress({ tenantCacheKey: 'a', academicYearId: 'year-a' }, saved));
    await act(async () => { await hook.result.current.move({ stage: 'timetable', setting: 'lecture-slots' }); });
    expect(hook.result.current.navigating).toBe(false);
    expect(hook.result.current.position).toEqual({ stage: 'curriculum', setting: 'subjects' });
    expect(hook.result.current.message).toContain('could not be saved');
  });

  it('records once under StrictMode and removes automatic opening after the winning visit', async () => {
    const hook = renderHook(
      ({ query }) => useAcademicSetupVisit('school-a', query, '/academic/courseSubjects'),
      {
        wrapper: StrictMode,
        initialProps: { query: 'source=automatic&returnTo=%2Facademic%2FcourseSubjects' },
      }
    );
    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith(
        '/academic/setup?returnTo=%2Facademic%2FcourseSubjects',
        { scroll: false }
      )
    );
    expect(hook.result.current.ready).toBe(false);
    hook.rerender({ query: 'returnTo=%2Facademic%2FcourseSubjects' });
    await waitFor(() => expect(hook.result.current.ready).toBe(true));
    expect(mocks.record).toHaveBeenCalledTimes(1);
  });

  it('returns a concurrent subsequent visitor to their original route', async () => {
    mocks.record.mockReturnValue({ unwrap: () => Promise.resolve({ firstVisit: false }) });
    const hook = renderHook(() =>
      useAcademicSetupVisit('school-a', 'source=automatic', '/academic/courseSubjects')
    );
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith('/academic/courseSubjects'));
    expect(hook.result.current.ready).toBe(false);
  });

  it('requires an explicit retry after a visit write fails', async () => {
    mocks.record.mockReturnValueOnce({ unwrap: () => Promise.reject(new Error('offline')) });
    const hook = renderHook(() => useAcademicSetupVisit('school-a', '', '/academic/dashboard'));
    await waitFor(() => expect(hook.result.current.failed).toBe(true));
    expect(hook.result.current.ready).toBe(false);
    expect(mocks.replace).not.toHaveBeenCalled();
    act(() => hook.result.current.retry());
    await waitFor(() => expect(hook.result.current.ready).toBe(true));
    expect(mocks.record).toHaveBeenCalledTimes(2);
  });

  it('keeps an open setting form URL when saving the current guide position', async () => {
    const hook = renderHook(() =>
      useAcademicSetupProgress({ tenantCacheKey: 'a', academicYearId: 'year-a' }, saved)
    );
    await act(async () => {
      await hook.result.current.persist();
    });
    expect(mocks.replace).toHaveBeenCalledWith(`/academic/setup?${mocks.query}`, { scroll: false });
    await act(async () => {
      await hook.result.current.move({ stage: 'timetable', setting: 'lecture-slots' });
    });
    expect(mocks.replace).toHaveBeenLastCalledWith(
      '/academic/setup?stage=timetable&setting=lecture-slots',
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
      useAcademicSetupVisit('school-a', 'source=automatic', '/academic/courseSubjects')
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
      useAcademicSetupProgress({ tenantCacheKey: 'a', academicYearId: 'year-a' }, saved)
    );
    await act(async () => {
      await hook.result.current.persist({ stage: 'timetable', setting: 'lecture-slots' }, [
        'subjects',
      ]);
    });
    expect(hook.result.current.conflict).toBe(true);
    expect(hook.result.current.deferred).toEqual(['subjects']);
    expect(hook.result.current.position).toEqual({ stage: 'curriculum', setting: 'subjects' });
    expect(mocks.replace).not.toHaveBeenCalled();
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it('pins a resumed cursor while another user changes saved progress in the background', () => {
    mocks.query = '';
    const initial = {
      ...saved,
      settings: [
        ...saved.settings,
        { key: 'rubrics', canView: true, canManage: true, configurationState: 'empty' as const },
      ],
    };
    const hook = renderHook(
      ({ state }) =>
        useAcademicSetupProgress({ tenantCacheKey: 'a', academicYearId: 'year-a' }, state),
      { initialProps: { state: initial } }
    );
    expect(hook.result.current.position).toEqual({ stage: 'curriculum', setting: 'subjects' });
    hook.rerender({
      state: {
        ...initial,
        concurrencyStamp: 'v2',
        currentStageKey: 'homework',
        currentSettingKey: 'rubrics',
      },
    });
    expect(hook.result.current.position).toEqual({ stage: 'curriculum', setting: 'subjects' });
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
      useAcademicSetupProgress({ tenantCacheKey: 'a', academicYearId: 'year-a' }, saved)
    );
    let pending: Promise<boolean>;
    act(() => {
      pending = hook.result.current.move({ stage: 'timetable', setting: 'lecture-slots' });
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
