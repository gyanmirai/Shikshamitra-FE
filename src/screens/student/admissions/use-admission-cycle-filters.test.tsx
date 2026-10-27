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
      columnFilters: '',
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

  it('preserves header criteria across paging and removes them when clearing', () => {
    const criteria =
      '[{"column":"endDate","type":"before","value":"01-04-2027","valueType":"date"}]';
    mocks.query = `filters=${encodeURIComponent(criteria)}&page=3&size=25`;
    const { result } = renderHook(() => useAdmissionCycleFilters());

    expect(result.current.filters.columnFilters).toBe(criteria);
    act(() => result.current.update({ status: 0 }));
    const query = new URL(mocks.replace.mock.lastCall![0], 'http://localhost').searchParams;
    expect(query.get('filters')).toBe(criteria);
    expect(query.get('status')).toBe('0');
    expect(query.has('page')).toBe(false);
    act(() => result.current.clear());
    expect(result.current.filters.columnFilters).toBe('');
    expect(mocks.replace).toHaveBeenLastCalledWith('/student/admissions/settings/cycles?size=25', {
      scroll: false,
    });
  });
});
