import { it, vi, expect, describe } from 'vitest';
import { renderHook } from '@testing-library/react';

import { useNavItem } from './hooks';

vi.mock('src/routes/components', () => ({ RouterLink: () => null }));
vi.mock('src/routes/hooks', () => ({ useSearchParams: () => new URLSearchParams() }));

describe('navigation groups without destinations', () => {
  it.each([undefined, ''])('keeps a group with path %s renderable', (path) => {
    const { result } = renderHook(() => useNavItem({ path, hasChild: true, depth: 1 }));

    expect(result.current.baseProps).toEqual({ component: 'div' });
  });
});
