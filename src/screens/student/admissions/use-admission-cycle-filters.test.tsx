import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { useAdmissionCycleFilters } from './use-admission-cycle-filters';

const mocks = vi.hoisted(() => ({
  pathname: '/student/admissions/settings/cycles',
  query: '',
  replace: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
  usePathname: () => mocks.pathname,
  useSearchParams: () => new URLSearchParams(mocks.query),
}));

describe('useAdmissionCycleFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.query = '';
  });

  it('restores shareable cycle filters and paging from the URL', () => {
    mocks.query = 'year=year-1&status=1&window=0&search=fresh&page=3&size=25';

    const { result } = renderHook(() => useAdmissionCycleFilters());

    expect(result.current.filters).toEqual({
      academicYearId: 'year-1',
      status: 1,
      windowStatus: 0,
      search: 'fresh',
      page: 2,
      rowsPerPage: 25,
    });
  });

  it('writes a changed filter to the current route and resets the page', () => {
    mocks.query = 'page=4&size=25';
    const { result } = renderHook(() => useAdmissionCycleFilters());

    act(() => result.current.update({ academicYearId: 'year-2' }));

    expect(mocks.replace).toHaveBeenCalledWith(
      '/student/admissions/settings/cycles?year=year-2&size=25',
      { scroll: false }
    );
  });

  it('clears search and domain filters while preserving the page size', () => {
    mocks.query = 'year=year-1&status=2&window=3&search=closed&page=2&size=100';
    const { result } = renderHook(() => useAdmissionCycleFilters());

    act(() => result.current.clear());

    expect(mocks.replace).toHaveBeenCalledWith('/student/admissions/settings/cycles?size=100', {
      scroll: false,
    });
  });

  it('ignores invalid status, window, page, and page size values', () => {
    mocks.query = 'status=&window=-1&page=zero&size=500';

    const { result } = renderHook(() => useAdmissionCycleFilters());

    expect(result.current.filters.status).toBe('');
    expect(result.current.filters.windowStatus).toBe('');
    expect(result.current.filters.page).toBe(0);
    expect(result.current.filters.rowsPerPage).toBe(10);
  });
});
