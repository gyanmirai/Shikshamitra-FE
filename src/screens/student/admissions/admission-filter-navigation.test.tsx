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
});
