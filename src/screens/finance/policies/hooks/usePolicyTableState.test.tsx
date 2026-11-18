import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { usePolicyTableState } from './usePolicyTableState';

describe('policy table scope paging', () => {
  it('requests the first page immediately in a new year and preserves search and page size', () => {
    const { result, rerender } = renderHook(({ scope }) => usePolicyTableState(scope), {
      initialProps: { scope: 'collection:year-1' },
    });
    act(() => result.current[1]((prev) => ({ ...prev, page: 5, pageSize: 25, search: 'Late' })));
    expect(result.current[0].page).toBe(5);
    rerender({ scope: 'collection:year-2' });
    expect(result.current[0]).toEqual({ page: 1, pageSize: 25, search: 'Late', status: '' });
    act(() => result.current[1]((prev) => ({ ...prev, page: 2 })));
    expect(result.current[0].page).toBe(2);
    rerender({ scope: 'collection:year-1' });
    expect(result.current[0].page).toBe(1);
  });
});
