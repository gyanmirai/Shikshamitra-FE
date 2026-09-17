import { renderHook } from '@testing-library/react';
import { it, vi, expect, describe } from 'vitest';

import useQueryAndMutation, { shouldShowQueryMutationError } from './customQueryAndMutation';

describe('custom query and mutation error ownership', () => {
  it('suppresses the automatic toast only when the caller explicitly disables it', () => {
    expect(shouldShowQueryMutationError(true, false)).toBe(false);
  });

  it('preserves automatic error feedback regardless of legacy throw intent', () => {
    expect(shouldShowQueryMutationError(true, true)).toBe(true);
  });
});

describe('custom query subscription defaults', () => {
  const createQueryHook = () =>
    vi.fn(() => ({
      data: undefined,
      error: undefined,
      isError: false,
      isSuccess: false,
    }));

  it('does not refetch every mounted query when the browser regains focus', () => {
    const queryHook = createQueryHook();

    renderHook(() =>
      useQueryAndMutation({
        type: 'query',
        currentQueryAndMutation: queryHook,
        params: { id: 'timetable-id' },
      })
    );

    expect(queryHook).toHaveBeenCalledWith(
      { id: 'timetable-id' },
      expect.objectContaining({
        refetchOnMountOrArgChange: true,
        refetchOnFocus: false,
        refetchOnReconnect: true,
      })
    );
  });

  it('allows screens with live data requirements to opt into focus refetching', () => {
    const queryHook = createQueryHook();

    renderHook(() =>
      useQueryAndMutation({
        type: 'query',
        currentQueryAndMutation: queryHook,
        options: { skip: true, refetchOnFocus: true },
      })
    );

    expect(queryHook).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        skip: true,
        refetchOnFocus: true,
      })
    );
  });
});
