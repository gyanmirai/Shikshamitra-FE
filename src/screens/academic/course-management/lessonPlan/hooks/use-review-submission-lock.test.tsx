import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useReviewSubmissionLock } from './use-review-submission-lock';

describe('useReviewSubmissionLock', () => {
  it('ignores a second action while the first review submission is pending', async () => {
    let resolveFirst: ((value: boolean) => void) | undefined;
    const firstResult = new Promise<boolean>((resolve) => {
      resolveFirst = resolve;
    });
    const action = vi.fn(() => firstResult);

    const { result } = renderHook(() => useReviewSubmissionLock());

    let pendingResult: Promise<boolean | null> | undefined;
    await act(async () => {
      pendingResult = result.current.runLocked(action);
      const duplicateResult = await result.current.runLocked(action);

      expect(duplicateResult).toBeNull();
      expect(action).toHaveBeenCalledTimes(1);
      resolveFirst?.(true);
      await pendingResult;
    });

    expect(await pendingResult).toBe(true);
    expect(result.current.isLocked).toBe(false);
  });
});
