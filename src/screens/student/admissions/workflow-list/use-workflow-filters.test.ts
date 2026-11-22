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

  it('keeps a header version predicate when applying date filters', () => {
    const columnFilters =
      '[{"column":"version","type":"greaterThan","value":3,"valueType":"number"}]';
    navigation.params = `columns=${encodeURIComponent(columnFilters)}`;
    const { result } = renderHook(useWorkflowFilters);
    act(() => result.current.update({ version: '', createdFrom: '2026-11-17' }));
    expect(result.current.filters).toMatchObject({
      version: '',
      columnFilters,
      createdFrom: '2026-11-17',
    });
  });

  it('restores only supported page sizes and rejects a reversed date range', () => {
    navigation.params = 'size=19&from=2026-11-29&to=2026-11-17';
    const { result } = renderHook(useWorkflowFilters);
    expect(result.current.filters).toMatchObject({
      rowsPerPage: 10,
      createdFrom: '',
      createdTo: '',
    });
    act(() => result.current.update({ rowsPerPage: 50, createdFrom: '2026-11-17' }));
    expect(result.current.filters).toMatchObject({ rowsPerPage: 50, createdFrom: '2026-11-17' });
    act(() => result.current.update({ createdTo: '2026-11-16' }));
    expect(result.current.filters).toMatchObject({ createdFrom: '2026-11-17', createdTo: '' });
  });

  it('clears advanced and column filters together while preserving search and sort', () => {
    navigation.params =
      'search=Spring&status=0&version=2&usage=used&from=2026-11-17&to=2026-11-28&page=3&size=25&sort=name';
    const { result } = renderHook(useWorkflowFilters);
    act(() => result.current.clearFilters());
    expect(result.current.filters).toMatchObject({
      search: 'Spring',
      sorting: 'name',
      rowsPerPage: 25,
      page: 0,
      status: 'all',
      version: '',
      usage: 'all',
      createdFrom: '',
      createdTo: '',
      columnFilters: '',
    });
    expect(navigation.replace).toHaveBeenCalledWith(
      '/student/admissions/settings/workflows?search=Spring&size=25&sort=name',
      { scroll: false }
    );
  });
});
