import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, afterEach } from 'vitest';

import { useLoginCompanion } from './use-login-companion';

describe('login companion reactions', () => {
  afterEach(() => vi.useRealTimers());

  it('welcomes briefly, then introduces school activities without an endless loop', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() =>
      useLoginCompanion({ isSubmitting: false, loginSucceeded: false })
    );
    expect(result.current.state).toBe('welcome');
    act(() => vi.advanceTimersByTime(1800));
    expect(result.current.state).toBe('helper');
    act(() => vi.advanceTimersByTime(10000));
    expect(result.current.state).toBe('helper');
  });

  it('covers its eyes immediately on password focus and returns after focus leaves', () => {
    const { result } = renderHook(() =>
      useLoginCompanion({ isSubmitting: false, loginSucceeded: false })
    );
    act(() => result.current.onPasswordFocusChange(true));
    expect(result.current.state).toBe('password');
    act(() => result.current.onPasswordFocusChange(false));
    expect(result.current.state).toBe('helper');
  });

  it('shows real submission and confirmed success ahead of the focused-field pose', () => {
    const { result, rerender } = renderHook((props) => useLoginCompanion(props), {
      initialProps: { isSubmitting: false, loginSucceeded: false },
    });
    act(() => result.current.onPasswordFocusChange(true));
    rerender({ isSubmitting: true, loginSucceeded: false });
    expect(result.current.state).toBe('signing-in');
    rerender({ isSubmitting: false, loginSucceeded: false });
    expect(result.current.state).toBe('password');
    rerender({ isSubmitting: false, loginSucceeded: true });
    expect(result.current.state).toBe('success');
  });
});
