import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { act, cleanup, waitFor, renderHook } from '@testing-library/react';

import { usePayrollPreviewRun } from './use-payroll-preview-run';

const mocks = vi.hoisted(() => ({
  params: new URLSearchParams('month=2026-08'), replace: vi.fn(), start: vi.fn(),
  status: {} as any, page: {} as any, statusHook: vi.fn(), pageHook: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
  usePathname: () => '/hr/payroll/run-payroll', useSearchParams: () => mocks.params,
}));
vi.mock('src/redux/runPayroll/payroll-preview-run-api', () => ({
  useStartPayrollPreviewMutation: () => [mocks.start, { isLoading: false }],
  usePayrollPreviewStatusQuery: (id: string, options: unknown) => { mocks.statusHook(id, options); return mocks.status; },
  usePayrollPreviewEmployeesQuery: (input: unknown, options: unknown) => { mocks.pageHook(input, options); return mocks.page; },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.params = new URLSearchParams('month=2026-08');
  mocks.status = { refetch: vi.fn() };
  mocks.page = { refetch: vi.fn() };
  mocks.start.mockReturnValue({ unwrap: () => Promise.resolve({ id: 'run-1' }) });
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('background payroll preview', () => {
  it('merges a refresh result with a search while router updates are still pending', async () => {
    mocks.params = new URLSearchParams('month=2026-08&previewRunId=old');
    const { result, rerender } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
    await act(async () => result.current.loadPreview(true));
    act(() => result.current.updateQuery({ search: 'Admin', page: 0 }));
    let last = new URL(mocks.replace.mock.calls.at(-1)![0], 'http://localhost');
    expect(last.searchParams.get('previewRunId')).toBe('run-1');
    // The router can acknowledge the earlier refresh before the search navigation.
    mocks.params = new URLSearchParams('month=2026-08&previewRunId=run-1');
    rerender();
    act(() => result.current.updateQuery({ pageSize: 50 }));
    last = new URL(mocks.replace.mock.calls.at(-1)![0], 'http://localhost');
    expect(last.searchParams.get('search')).toBe('Admin');
    expect(last.searchParams.get('previewRunId')).toBe('run-1');
  });

  it('respects browser back after the latest local URL is acknowledged', () => {
    mocks.params = new URLSearchParams('month=2026-08&previewRunId=old');
    const { result, rerender } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
    act(() => result.current.updateQuery({ previewRunId: 'new' }));
    mocks.params = new URLSearchParams('month=2026-08&previewRunId=new');
    rerender();
    mocks.params = new URLSearchParams('month=2026-08&previewRunId=old');
    rerender();
    act(() => result.current.updateQuery({ search: 'Admin' }));
    expect(mocks.replace.mock.calls.at(-1)![0]).toContain('previewRunId=old');
  });
  it('starts automatically once and puts the run in URL state', async () => {
    renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith(expect.stringContaining('previewRunId=run-1'), { scroll: false }));
    expect(mocks.start).toHaveBeenCalledTimes(1);
    expect(mocks.start).toHaveBeenCalledWith({ month: '2026-08', academicYearId: 'year-1', refresh: false });
  });

  it('resumes an existing run and requests only its server page', () => {
    mocks.params = new URLSearchParams('month=2026-08&previewRunId=run-1&page=2&pageSize=10&search=Patel');
    mocks.status.currentData = { id: 'run-1', month: '2026-08', academicYearId: 'year-1', status: 'SUCCEEDED', isCurrent: true };
    mocks.page.currentData = { previewRunId: 'run-1', isCurrent: true, items: [], readiness: { employeeCount: 100 } };
    const { result } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
    expect(mocks.start).not.toHaveBeenCalled();
    expect(mocks.pageHook).toHaveBeenCalledWith({ id: 'run-1', page: 2, pageSize: 10, search: 'Patel' }, expect.anything());
    expect(result.current.isCurrent).toBe(true);
    expect(mocks.statusHook).toHaveBeenLastCalledWith('run-1', expect.objectContaining({ pollingInterval: 0 }));
  });

  it('keeps completed results visible but unreviewable while calculating a replacement', () => {
    mocks.params = new URLSearchParams('month=2026-08&previewRunId=run-1');
    mocks.status.currentData = { month: '2026-08', academicYearId: 'year-1', status: 'SUCCEEDED', isCurrent: true };
    mocks.page.currentData = { previewRunId: 'run-1', isCurrent: true, items: [{ employeeName: 'Synthetic' }] };
    const { result, rerender } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
    mocks.params = new URLSearchParams('month=2026-08&previewRunId=run-2');
    mocks.status.currentData = { month: '2026-08', academicYearId: 'year-1', status: 'RUNNING', isCurrent: false };
    rerender();
    expect(result.current.data?.items).toHaveLength(1);
    expect(result.current.busy).toBe(true);
    expect(result.current.isCurrent).toBe(false);
  });

  it('rejects stale results and late responses for a previous month', async () => {
    let resolve!: (value: { id: string }) => void;
    mocks.start.mockReturnValueOnce({ unwrap: () => new Promise((done) => { resolve = done; }) });
    const { rerender } = renderHook(({ month }) => usePayrollPreviewRun(month, 'year-1'), { initialProps: { month: '2026-08' } });
    rerender({ month: '2026-09' });
    await act(async () => resolve({ id: 'old-month' }));
    expect(mocks.replace.mock.calls.some(([url]) => url.includes('old-month'))).toBe(false);
  });

  it('debounces a trimmed search and resets pagination', async () => {
    vi.useFakeTimers();
    mocks.params = new URLSearchParams('month=2026-08&previewRunId=run-1&page=4');
    const { result } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
    act(() => result.current.setSearchInput('  Patel  '));
    expect(mocks.replace).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(350));
    expect(mocks.replace).toHaveBeenCalledWith(expect.stringContaining('page=0&search=Patel'), { scroll: false });
  });
});
