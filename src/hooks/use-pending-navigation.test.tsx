import { it, vi, expect, describe } from 'vitest';
import { act, waitFor, renderHook } from '@testing-library/react';

import { usePendingNavigation } from './use-pending-navigation';

describe('pending record navigation', () => {
  it('announces the requested record and accepts only one navigation until it settles', async () => {
    let finish!: () => void;
    const push = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        })
    );
    const { result } = renderHook(() => usePendingNavigation(push));
    act(() => {
      result.current.navigate('one', '/records/one', { scroll: false });
      result.current.navigate('one', '/records/one');
      result.current.navigate('two', '/records/two');
    });
    expect(push).toHaveBeenCalledTimes(1);
    expect(result.current.pendingKey).toBe('one');
    expect(result.current.isPending).toBe(true);
    await act(async () => finish());
    await waitFor(() => expect(result.current.pendingKey).toBeNull());
    act(() => result.current.navigate('two', '/records/two'));
    expect(push).toHaveBeenCalledTimes(2);
    await act(async () => finish());
  });

  it('releases the pending record after an unsuccessful navigation', async () => {
    const failure = new Error('Navigation unavailable');
    const push = vi.fn().mockRejectedValueOnce(failure).mockResolvedValue(undefined);
    const onError = vi.fn();
    const { result } = renderHook(() => usePendingNavigation(push, onError));
    await act(async () => result.current.navigate('one', '/records/one'));
    expect(onError).toHaveBeenCalledWith(failure);
    await waitFor(() => expect(result.current.isPending).toBe(false));
    await act(async () => result.current.navigate('one', '/records/one'));
    expect(push).toHaveBeenCalledTimes(2);
  });
});
