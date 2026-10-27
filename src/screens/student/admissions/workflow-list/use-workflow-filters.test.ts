import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { useWorkflowFilters } from './use-workflow-filters';

const navigation = vi.hoisted(() => ({ params: '', replace: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: navigation.replace }),
  usePathname: () => '/student/admissions/settings/workflows',
  useSearchParams: () => new URLSearchParams(navigation.params),
}));

describe('workflow filter state', () => {
  beforeEach(() => {
    navigation.params = '';
    vi.clearAllMocks();
  });

  it('replaces a header version range when the advanced version equality changes', () => {
    navigation.params = `page=3&columns=${encodeURIComponent('[{"column":"version","type":"between","value":{"min":1,"max":3},"valueType":"number"}]')}`;
    const { result } = renderHook(useWorkflowFilters);
    act(() => result.current.update({ version: '4' }));
    expect(result.current.filters).toMatchObject({ version: '4', columnFilters: '', page: 0 });
    expect(navigation.replace).toHaveBeenCalledWith(
      '/student/admissions/settings/workflows?version=4',
      { scroll: false }
    );
  });

  it('restores one version predicate from a conflicting legacy URL', () => {
    navigation.params = `version=2&columns=${encodeURIComponent('[{"column":"version","type":"greaterThan","value":3,"valueType":"number"}]')}`;
    const { result } = renderHook(useWorkflowFilters);
    expect(result.current.filters).toMatchObject({ version: '2', columnFilters: '' });
  });
});
