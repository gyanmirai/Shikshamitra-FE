import { it, vi, expect, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useReportingSearchParams } from './useReportingSearchParams';

const mocks = vi.hoisted(() => ({ query: new URLSearchParams(), push: vi.fn() }));
vi.mock('next/navigation', () => ({
  useSearchParams: () => mocks.query,
  useRouter: () => ({ push: mocks.push }),
}));
afterEach(() => {
  mocks.query = new URLSearchParams();
  vi.clearAllMocks();
});

it('merges rapid search and filter edits before Next commits a navigation', () => {
  const { result, rerender } = renderHook(useReportingSearchParams);
  act(() => {
    result.current.updateQuery({ category: 'Attendance', page: '0' });
    result.current.updateQuery({ search: 'staff', page: '0' });
  });
  expect(mocks.push).toHaveBeenLastCalledWith('?category=Attendance&page=0&search=staff', {
    scroll: false,
  });
  // An intermediate route commit must not drop a more recent pending search.
  mocks.query = new URLSearchParams('category=Attendance&page=0');
  rerender();
  act(() => result.current.updateQuery({ library: 'builtin' }));
  expect(mocks.push).toHaveBeenLastCalledWith(
    '?category=Attendance&page=0&search=staff&library=builtin',
    { scroll: false }
  );
});
it('uses browser Back state rather than an abandoned pending filter', () => {
  const { result, rerender } = renderHook(useReportingSearchParams);
  act(() => result.current.updateQuery({ category: 'Attendance' }));
  mocks.query = new URLSearchParams('category=Payroll');
  act(() => window.dispatchEvent(new PopStateEvent('popstate')));
  rerender();
  act(() => result.current.updateQuery({ search: 'salary' }));
  expect(mocks.push).toHaveBeenLastCalledWith('?category=Payroll&search=salary', { scroll: false });
});
