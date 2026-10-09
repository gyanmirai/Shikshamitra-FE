import { it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useUrlFilterValue } from './use-url-filter-value';

it('retains rapid selections before the URL catches up and accepts subsequent URL navigation', () => {
  const { result, rerender } = renderHook(({ url }) => useUrlFilterValue(url), {
    initialProps: { url: '' },
  });
  act(() => result.current[1]('class-1'));
  expect(result.current[0]).toBe('class-1');
  act(() => result.current[1](`${result.current[0]},class-10`));
  expect(result.current[0]).toBe('class-1,class-10');
  rerender({ url: 'class-1,class-10' });
  expect(result.current[0]).toBe('class-1,class-10');
  rerender({ url: 'class-2' });
  expect(result.current[0]).toBe('class-2');
});
