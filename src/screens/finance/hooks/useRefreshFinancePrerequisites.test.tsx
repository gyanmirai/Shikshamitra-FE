import { it, vi, expect, describe } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useRefreshFinancePrerequisites } from './useRefreshFinancePrerequisites';

describe('refresh after prerequisite setup', () => {
  it('does not refresh when a read-only dialog restores focus within the same page', () => {
    const refresh = vi.fn();
    renderHook(() => useRefreshFinancePrerequisites(refresh));
    act(() => window.dispatchEvent(new Event('focus')));
    expect(refresh).not.toHaveBeenCalled();
  });

  it('uses the latest callback on return and removes its listener after close', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender, unmount } = renderHook(
      ({ refresh }) => useRefreshFinancePrerequisites(refresh),
      { initialProps: { refresh: first } }
    );
    rerender({ refresh: second });
    act(() => window.dispatchEvent(new Event('blur')));
    act(() => window.dispatchEvent(new Event('focus')));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
    unmount();
    act(() => window.dispatchEvent(new Event('focus')));
    expect(second).toHaveBeenCalledOnce();
  });

  it('refreshes once when returning from another tab even if visibility and focus both fire', () => {
    const refresh = vi.fn();
    const visibility = vi.spyOn(document, 'visibilityState', 'get');
    visibility.mockReturnValue('visible');
    const { unmount } = renderHook(() => useRefreshFinancePrerequisites(refresh));
    try {
      visibility.mockReturnValue('hidden');
      act(() => document.dispatchEvent(new Event('visibilitychange')));
      expect(refresh).not.toHaveBeenCalled();
      visibility.mockReturnValue('visible');
      act(() => document.dispatchEvent(new Event('visibilitychange')));
      act(() => window.dispatchEvent(new Event('focus')));
      expect(refresh).toHaveBeenCalledOnce();
    } finally {
      unmount();
      visibility.mockRestore();
    }
  });

  it('ignores focus events from fields and does not refresh while disabled', () => {
    const refresh = vi.fn();
    const { rerender } = renderHook(
      ({ enabled }) => useRefreshFinancePrerequisites(refresh, enabled),
      {
        initialProps: { enabled: true },
      }
    );
    const input = document.createElement('input');
    document.body.appendChild(input);
    try {
      act(() => {
        input.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
        input.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
      });
      expect(refresh).not.toHaveBeenCalled();
      rerender({ enabled: false });
      act(() => {
        window.dispatchEvent(new Event('blur'));
        window.dispatchEvent(new Event('focus'));
      });
      expect(refresh).not.toHaveBeenCalled();
    } finally {
      input.remove();
    }
  });
});
