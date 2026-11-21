import { it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useCommandAttempt } from './useCommandAttempt';

it('retains each uncertain payload independently when a user revisits an earlier draft', () => {
  const { result } = renderHook(() => useCommandAttempt<{ copyId: string; revision: string }>());
  const first = result.current.prepare('first', { copyId: 'copy-A', revision: 'revision-A' });
  act(() => result.current.failed('first', { status: 'FETCH_ERROR' }));
  result.current.prepare('second', { copyId: 'copy-B', revision: 'revision-B' });
  act(() => result.current.failed('second', { status: 'FETCH_ERROR' }));
  expect(result.current.retry('first')).toEqual(first);
  expect(result.current.retry('second')).toMatchObject({
    copyId: 'copy-B',
    revision: 'revision-B',
  });
});
