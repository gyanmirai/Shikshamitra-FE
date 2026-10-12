import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';

import { usePaginatedSearch } from './use-paginated-search';

import type { FetchOptionsResponse } from './types';

type Response = FetchOptionsResponse<string>;
const page = (value: string, hasMore = false): Response => ({ data: [value], hasMore });
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((complete) => {
    resolve = complete;
  });
  return { promise, resolve };
}
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

it('invalidates pending results immediately when the new query is below the minimum length', async () => {
  const old = deferred<Response>();
  const fetchOptions = vi
    .fn()
    .mockResolvedValueOnce(page('default'))
    .mockReturnValueOnce(old.promise);
  const { result } = renderHook(() => usePaginatedSearch({ fetchOptions }));
  await act(async () => {});
  act(() => result.current.handleInputChange('Older'));
  await act(() => vi.advanceTimersByTimeAsync(400));
  act(() => result.current.handleInputChange('x'));
  await act(async () => old.resolve(page('Older')));
  expect(result.current.options).toEqual([]);
  expect(result.current.loading).toBe(false);
});

it('ignores an earlier request even when its query text matches the newest search', async () => {
  const old = deferred<Response>();
  const fetchOptions = vi
    .fn()
    .mockResolvedValueOnce(page('default'))
    .mockReturnValueOnce(old.promise)
    .mockResolvedValueOnce(page('new Alpha'));
  const { result } = renderHook(() => usePaginatedSearch({ fetchOptions }));
  await act(async () => {});
  act(() => result.current.handleInputChange('Alpha'));
  await act(() => vi.advanceTimersByTimeAsync(400));
  act(() => result.current.handleInputChange('Beta'));
  act(() => result.current.handleInputChange('Alpha'));
  await act(() => vi.advanceTimersByTimeAsync(400));
  await act(async () => old.resolve(page('old Alpha')));
  expect(result.current.options).toEqual(['new Alpha']);
});

it('does not paginate a new query while its first page is waiting for the debounce', async () => {
  const fetchOptions = vi.fn().mockResolvedValue(page('default', true));
  const { result } = renderHook(() => usePaginatedSearch({ fetchOptions }));
  await act(async () => {});
  await act(async () => result.current.loadMore());
  act(() => result.current.handleInputChange('Alpha'));
  act(() => result.current.loadMore());
  expect(fetchOptions).toHaveBeenCalledTimes(2);
  await act(() => vi.advanceTimersByTimeAsync(400));
  expect(fetchOptions).toHaveBeenLastCalledWith('Alpha', 1);
});

it('preserves existing options and retries the failed next page', async () => {
  const fetchOptions = vi
    .fn()
    .mockResolvedValueOnce(page('first', true))
    .mockRejectedValueOnce(new Error('temporary failure'))
    .mockResolvedValueOnce(page('second'));
  const { result } = renderHook(() => usePaginatedSearch({ fetchOptions }));
  await act(async () => {});
  await act(async () => result.current.loadMore());
  expect(result.current.options).toEqual(['first']);
  expect(result.current.error).toBe('Failed to load results');
  await act(async () => result.current.retry());
  expect(fetchOptions).toHaveBeenLastCalledWith('', 2);
  expect(result.current.options).toEqual(['first', 'second']);
  expect(result.current.error).toBeNull();
});

it('blocks concurrent duplicate pages and stops after the final page', async () => {
  const second = deferred<Response>();
  const fetchOptions = vi
    .fn()
    .mockResolvedValueOnce(page('first', true))
    .mockReturnValueOnce(second.promise);
  const { result } = renderHook(() => usePaginatedSearch({ fetchOptions }));
  await act(async () => {});
  act(() => {
    result.current.loadMore();
    result.current.loadMore();
  });
  expect(fetchOptions).toHaveBeenCalledTimes(2);
  await act(async () => second.resolve(page('second')));
  act(() => result.current.loadMore());
  expect(fetchOptions).toHaveBeenCalledTimes(2);
  expect(result.current.options).toEqual(['first', 'second']);
});

it('uses the latest callback without restarting the debounce on a parent render', async () => {
  const initialFetch = vi.fn().mockResolvedValue(page('default'));
  const latestFetch = vi.fn().mockResolvedValue(page('latest'));
  const { result, rerender } = renderHook(
    ({ fetchOptions }) => usePaginatedSearch({ fetchOptions }),
    {
      initialProps: { fetchOptions: initialFetch },
    }
  );
  await act(async () => {});
  act(() => result.current.handleInputChange('Alpha'));
  await act(() => vi.advanceTimersByTimeAsync(200));
  rerender({ fetchOptions: latestFetch });
  await act(() => vi.advanceTimersByTimeAsync(200));
  expect(latestFetch).toHaveBeenCalledWith('Alpha', 1);
  expect(initialFetch).toHaveBeenCalledTimes(1);
});

it('cancels scheduled searches when the picker unmounts', async () => {
  const fetchOptions = vi.fn().mockResolvedValue(page('default'));
  const { result, unmount } = renderHook(() => usePaginatedSearch({ fetchOptions }));
  await act(async () => {});
  act(() => result.current.handleInputChange('Alpha'));
  unmount();
  await act(() => vi.advanceTimersByTimeAsync(400));
  expect(fetchOptions).toHaveBeenCalledTimes(1);
});
