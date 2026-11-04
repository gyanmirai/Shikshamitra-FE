import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { LOGIN_TAGLINES, useLoginTypewriter } from './use-login-typewriter';

describe('login typewriter messages', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function nextTick() {
    act(() => vi.advanceTimersToNextTimer());
  }

  function until(matches: () => boolean) {
    for (let step = 0; step < 500 && !matches(); step += 1) nextTick();
    expect(matches()).toBe(true);
  }

  it('types, holds, erases, changes messages and repeats from the start', () => {
    const { result } = renderHook(() =>
      useLoginTypewriter({ paused: false, reducedMotion: false })
    );
    expect(result.current).toBe('');
    nextTick();
    expect(result.current).toBe('A');
    nextTick();
    expect(result.current).toBe('Ac');
    until(() => result.current === LOGIN_TAGLINES[0]);
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(LOGIN_TAGLINES[0]);
    until(() => result.current === '');
    until(() => result.current === LOGIN_TAGLINES[1]);
    until(() => result.current === LOGIN_TAGLINES[2]);
    until(() => result.current === LOGIN_TAGLINES[0]);
  });

  it('suspends hidden-page typing, resumes automatically and clears its timer on unmount', () => {
    const { result, rerender, unmount } = renderHook((props) => useLoginTypewriter(props), {
      initialProps: { paused: false, reducedMotion: false },
    });
    nextTick();
    const partial = result.current;
    rerender({ paused: true, reducedMotion: false });
    act(() => vi.advanceTimersByTime(10000));
    expect(result.current).toBe(partial);
    expect(vi.getTimerCount()).toBe(0);
    rerender({ paused: false, reducedMotion: false });
    nextTick();
    expect(result.current.length).toBeGreaterThan(partial.length);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('shows a complete stable sentence without scheduling typing for reduced motion', () => {
    const { result } = renderHook(() => useLoginTypewriter({ paused: true, reducedMotion: true }));
    expect(result.current).toBe(LOGIN_TAGLINES[0]);
    act(() => vi.advanceTimersByTime(30000));
    expect(result.current).toBe(LOGIN_TAGLINES[0]);
    expect(vi.getTimerCount()).toBe(0);
  });
});
