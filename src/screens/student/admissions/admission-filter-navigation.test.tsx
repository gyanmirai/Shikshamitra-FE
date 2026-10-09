import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { useWorkflowFilters } from './workflow-list/use-workflow-filters';
import { useAdmissionOfferingFilters } from './use-admission-offering-filters';

const mocks = vi.hoisted(() => ({
  pathname: '/student/admissions/settings/workflows',
  query: '',
  replace: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
  usePathname: () => mocks.pathname,
  useSearchParams: () => new URLSearchParams(mocks.query),
}));

describe('admission filter navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.query = '';
  });

  it('does not replace the workflow route when a table search repeats the current filters', () => {
    const { result } = renderHook(() => useWorkflowFilters());

    act(() => result.current.update({ search: '' }));

    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it('replaces the workflow route when a filter actually changes', () => {
    const { result } = renderHook(() => useWorkflowFilters());

    act(() => result.current.update({ search: 'entrance exam' }));

    expect(mocks.replace).toHaveBeenCalledOnce();
    expect(mocks.replace).toHaveBeenCalledWith(
      '/student/admissions/settings/workflows?search=entrance+exam',
      { scroll: false }
    );
  });

  it('does not replace the offering route when a table search repeats the current filters', () => {
    mocks.pathname = '/student/admissions/settings/offerings';
    const { result } = renderHook(() => useAdmissionOfferingFilters());

    act(() => result.current.update({ search: '' }));

    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it('treats legacy All parent links as unselected and reads only one Board and Medium', () => {
    mocks.query = 'board=__all__&medium=__all__';
    const all = renderHook(() => useAdmissionOfferingFilters());
    expect(all.result.current.filters.boardId).toBe('');
    expect(all.result.current.filters.mediumId).toBe('');
    all.unmount();

    mocks.query = 'board=board-1,board-2&medium=medium-1,medium-2&standard=class-1,class-10';
    const selected = renderHook(() => useAdmissionOfferingFilters());
    expect(selected.result.current.filters.boardId).toBe('board-1');
    expect(selected.result.current.filters.mediumId).toBe('medium-1');
    expect(selected.result.current.filters.standardId).toBe('class-1,class-10');
  });

  it('replaces the offering route when a filter actually changes', () => {
    mocks.pathname = '/student/admissions/settings/offerings';
    const { result } = renderHook(() => useAdmissionOfferingFilters());

    act(() => result.current.update({ search: 'class 1' }));

    expect(mocks.replace).toHaveBeenCalledOnce();
    expect(mocks.replace).toHaveBeenCalledWith(
      '/student/admissions/settings/offerings?search=class+1',
      { scroll: false }
    );
  });

  it('clears offering criteria while preserving cycle, sorting, and page size context', () => {
    mocks.pathname = '/student/admissions/settings/offerings';
    mocks.query =
      'cycle=cycle-1&campus=campus-1&board=board-1&active=true&availability=2&search=grade&page=3&size=25&sort=code+asc';
    const { result } = renderHook(() => useAdmissionOfferingFilters());

    act(() => result.current.clearFilters());

    expect(mocks.replace).toHaveBeenCalledWith(
      '/student/admissions/settings/offerings?cycle=cycle-1&board=board-1&sort=code+asc&size=25',
      { scroll: false }
    );
  });
});
