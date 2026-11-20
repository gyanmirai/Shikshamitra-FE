import { it, vi, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useReviewedStockAction } from '../circulation/useReviewedStockAction';

it('retains the reviewed subset and replays the exact receipt after an uncertain response', async () => {
  const previewRequest = vi.fn(async () => ({ revision: 'reviewed', copies: [], errors: [] }));
  const commitRequest = vi
    .fn()
    .mockRejectedValueOnce(Object.assign(new Error('Connection closed'), { status: 'FETCH_ERROR' }))
    .mockResolvedValueOnce({ id: 'accepted-receipt' });
  const { result, rerender } = renderHook(
    ({ copyIds }: { copyIds: string[] }) =>
      useReviewedStockAction({
        input: { copyIds },
        allowed: true,
        previewRequest,
        commitRequest,
      }),
    { initialProps: { copyIds: ['first'] } }
  );
  await act(async () => {
    await result.current.preview();
  });
  expect(result.current.canCommit).toBe(true);
  rerender({ copyIds: ['second'] });
  expect(result.current.review).toBeUndefined();
  expect(result.current.canCommit).toBe(false);
  await act(async () => {
    await result.current.preview();
  });
  await act(async () => {
    await result.current.commit();
  });
  expect(result.current.uncertain).toBe(true);
  const initialCommand = commitRequest.mock.calls[0][0];
  expect(initialCommand.details.copyIds).toEqual(['second']);
  await act(async () => {
    await result.current.commit();
  });
  expect(commitRequest).toHaveBeenLastCalledWith(initialCommand);
  expect(result.current.saved).toEqual({ id: 'accepted-receipt' });
});

it('refreshes current stock and requires another preview after a definite stale receipt', async () => {
  const refresh = vi.fn();
  const { result } = renderHook(() =>
    useReviewedStockAction({
      input: { copyIds: ['selected-copy'] },
      allowed: true,
      previewRequest: async () => ({ revision: 'old', copies: [], errors: [] }),
      commitRequest: async () => {
        throw { status: 403, data: { errorCode: 'Library:Custody:010099' } };
      },
      onConflict: refresh,
    })
  );
  await act(async () => {
    await result.current.preview();
  });
  await act(async () => {
    await result.current.commit();
  });
  expect(refresh).toHaveBeenCalledOnce();
  expect(result.current.review).toBeUndefined();
  expect(result.current.canCommit).toBe(false);
  expect(result.current.uncertain).toBe(false);
});
