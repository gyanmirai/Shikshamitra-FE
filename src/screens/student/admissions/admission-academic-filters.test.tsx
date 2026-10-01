import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { useAdmissionAcademicFilters } from './admission-academic-filters';

const mocks = vi.hoisted(() => ({
  query: 'board=board-1&medium=medium-1&class=class-1&search=ada',
  replace: vi.fn(),
}));

vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ globalState: { currentYear: { id: 'year-1' } } }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
  usePathname: () => '/student/admissions/pipeline',
  useSearchParams: () => new URLSearchParams(mocks.query),
}));

describe('admission academic filters', () => {
  beforeEach(() => {
    mocks.replace.mockClear();
    mocks.query = 'board=board-1&medium=medium-1&class=class-1&search=ada';
  });

  it('uses the global year and clears dependent filters when the board changes', () => {
    const { result } = renderHook(() => useAdmissionAcademicFilters());

    expect(result.current.academicYearId).toBe('year-1');
    act(() => result.current.update('board', 'board-2'));

    expect(mocks.replace).toHaveBeenCalledWith(
      '/student/admissions/pipeline?board=board-2&search=ada',
      { scroll: false }
    );
  });

  it('clears the class with its medium and preserves unrelated search', () => {
    const { result } = renderHook(() => useAdmissionAcademicFilters());

    act(() => result.current.update('medium', '__all__'));

    expect(mocks.replace).toHaveBeenCalledWith(
      '/student/admissions/pipeline?board=board-1&search=ada',
      { scroll: false }
    );
  });

  it('clears academic scope without removing the table search', () => {
    const { result } = renderHook(() => useAdmissionAcademicFilters());

    act(() => result.current.clear());

    expect(mocks.replace).toHaveBeenCalledWith(
      '/student/admissions/pipeline?search=ada',
      { scroll: false }
    );
  });
});
