import { it, vi, expect, describe } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useRefreshFinancePrerequisites } from './useRefreshFinancePrerequisites';

describe('refresh after prerequisite setup', () => {
  it('uses the latest callback on return and removes its listener after close', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender, unmount } = renderHook(
      ({ refresh }) => useRefreshFinancePrerequisites(refresh),
      { initialProps: { refresh: first } }
    );
    rerender({ refresh: second });
    act(() => window.dispatchEvent(new Event('focus')));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
    unmount();
    act(() => window.dispatchEvent(new Event('focus')));
    expect(second).toHaveBeenCalledOnce();
  });
});
