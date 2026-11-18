import { it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useAccountSettingHistoryPage } from './useAccountSettingHistoryPage';

it('pages beyond the newest 50 versions and resets when switching or reopening records', () => {
  const { result, rerender } = renderHook(({ id }: { id?: string }) => useAccountSettingHistoryPage(id), { initialProps: { id: 'bank-a' } as { id?: string } });
  act(() => result.current.onPageChange(1));
  expect(result.current.query).toEqual({ id: 'bank-a', skipCount: 50, maxResultCount: 50 });
  rerender({ id: 'bank-b' });
  expect(result.current.query).toEqual({ id: 'bank-b', skipCount: 0, maxResultCount: 50 });
  act(() => result.current.onPageChange(2));
  rerender({ id: undefined });
  rerender({ id: 'bank-b' });
  expect(result.current.query.skipCount).toBe(0);
});
