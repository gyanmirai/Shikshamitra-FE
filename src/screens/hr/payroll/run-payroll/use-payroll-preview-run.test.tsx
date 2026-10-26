import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { act, cleanup, waitFor, renderHook } from '@testing-library/react';

import { usePayrollPreviewRun } from './use-payroll-preview-run';

const mocks = vi.hoisted(() => ({
  params: new URLSearchParams('month=2026-08'),
  replace: vi.fn(),
  start: vi.fn(),
  status: {} as any,
  page: {} as any,
  statusHook: vi.fn(),
  pageHook: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
  usePathname: () => '/hr/payroll/run-payroll',
  useSearchParams: () => mocks.params,
}));
vi.mock('src/redux/runPayroll/payroll-preview-run-api', () => ({
  useStartPayrollPreviewMutation: () => [mocks.start, { isLoading: false }],
  usePayrollPreviewStatusQuery: (id: string, options: unknown) => {
    mocks.statusHook(id, options);
    return mocks.status;
  },
  usePayrollPreviewEmployeesQuery: (input: unknown, options: unknown) => {
    mocks.pageHook(input, options);
    return mocks.page;
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.params = new URLSearchParams('month=2026-08');
  mocks.status = { refetch: vi.fn() };
  mocks.page = { refetch: vi.fn() };
  mocks.start.mockReturnValue({ unwrap: () => Promise.resolve({ id: 'run-1' }) });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function completedPreview(id = 'run-1') {
  mocks.params = new URLSearchParams(`month=2026-08&previewRunId=${id}`);
  mocks.status.currentData = {
    id,
    month: '2026-08',
    academicYearId: 'year-1',
    status: 'SUCCEEDED',
    isCurrent: true,
  };
  mocks.page.currentData = {
    previewRunId: id,
    isCurrent: true,
    items: [],
    readiness: { employeeCount: 0 },
  };
}

describe('background payroll preview', () => {
  it('prioritizes a current polling access failure over a cached FAILED job setup action', () => {
    completedPreview();
    Object.assign(mocks.status.currentData, { status: 'FAILED', errorCode: 'HR:Payroll:030039' });
    Object.assign(mocks.status, {
      isError: true,
      error: { status: 403, data: { detail: 'private diagnostics' } },
    });
    const { result } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
    expect(result.current.error).toMatchObject({
      title: 'Access Required',
      message: 'You do not have access to complete this action.',
    });
    expect(result.current.error?.setup).toBeUndefined();
    expect(mocks.start).not.toHaveBeenCalled();
  });

  it('retains the FAILED job reason and known setup without automatically starting another job', () => {
    completedPreview();
    Object.assign(mocks.status.currentData, {
      status: 'FAILED',
      isCurrent: false,
      errorCode: 'HR:Payroll:030039',
      errorMessage: 'Record the establishment registration before calculating payroll.',
    });
    const { result } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
    expect(result.current.error).toMatchObject({
      message: 'Record the establishment registration before calculating payroll.',
      setup: 'statutory',
      errorCode: 'HR:Payroll:030039',
    });
    expect(result.current.isCurrent).toBe(false);
    expect(mocks.start).not.toHaveBeenCalled();
  });

  it('explains a known business code when the status API returns its generic job failure message', () => {
    completedPreview();
    Object.assign(mocks.status.currentData, {
      status: 'FAILED',
      errorCode: 'HR:Payroll:030039',
      errorMessage:
        'Payroll calculation could not finish. Retry the calculation or contact support with the run reference.',
    });
    const { result } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
    expect(result.current.error).toMatchObject({
      message: 'The statutory establishment setup is not ready.',
      setup: 'statutory',
    });
  });

  it.each(['status', 'page'])('preserves safe %s query reasons and known setup codes', (source) => {
    completedPreview();
    const query = source === 'status' ? mocks.status : mocks.page;
    query.isError = true;
    query.error = {
      status: 400,
      data: {
        error: {
          code: 'HR:Payroll:030039',
          data: { Reason: 'Complete the establishment registration.' },
        },
      },
    };
    const { result } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
    expect(result.current.error).toMatchObject({
      message: 'Complete the establishment registration.',
      setup: 'statutory',
    });
    expect(result.current.isPreparing).toBe(false);
    expect(result.current.isCurrent).toBe(false);
    expect(mocks.start).not.toHaveBeenCalled();
  });

  it.each(['FAILED', 'status', 'page'])(
    'filters unsafe %s diagnostics and still offers only the known setup',
    (source) => {
      completedPreview();
      const diagnostic =
        'System.InvalidOperationException: password=private at C:\\server\\payroll.cs';
      if (source === 'FAILED')
        Object.assign(mocks.status.currentData, {
          status: 'FAILED',
          errorMessage: diagnostic,
          errorCode: 'HR:Payroll:030039',
        });
      else
        Object.assign(source === 'status' ? mocks.status : mocks.page, {
          isError: true,
          error: { status: 400, data: { detail: diagnostic, errorCode: 'HR:Payroll:030039' } },
        });
      const { result } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
      expect(result.current.error).toMatchObject({
        message: 'The statutory establishment setup is not ready.',
        setup: 'statutory',
      });
      expect(JSON.stringify(result.current.error)).not.toContain('private');
      expect(mocks.start).not.toHaveBeenCalled();
    }
  );

  it.each([403, 500, 'FETCH_ERROR'])(
    'does not suggest setup or leak diagnostics after a %s polling failure',
    (status) => {
      completedPreview();
      Object.assign(mocks.status, {
        isError: true,
        error: { status, data: { detail: 'password=private', errorCode: 'HR:Payroll:030039' } },
      });
      const { result } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
      expect(result.current.error?.setup).toBeUndefined();
      expect(JSON.stringify(result.current.error)).not.toContain('private');
      expect(mocks.start).not.toHaveBeenCalled();
    }
  );

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
    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith(expect.stringContaining('previewRunId=run-1'), {
        scroll: false,
      })
    );
    expect(mocks.start).toHaveBeenCalledTimes(1);
    expect(mocks.start).toHaveBeenCalledWith({
      month: '2026-08',
      academicYearId: 'year-1',
      refresh: false,
    });
  });

  it('resumes an existing run and requests only its server page', () => {
    mocks.params = new URLSearchParams(
      'month=2026-08&previewRunId=run-1&page=2&pageSize=10&search=Patel'
    );
    mocks.status.currentData = {
      id: 'run-1',
      month: '2026-08',
      academicYearId: 'year-1',
      status: 'SUCCEEDED',
      isCurrent: true,
    };
    mocks.page.currentData = {
      previewRunId: 'run-1',
      isCurrent: true,
      items: [],
      readiness: { employeeCount: 100 },
    };
    const { result } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
    expect(mocks.start).not.toHaveBeenCalled();
    expect(mocks.pageHook).toHaveBeenCalledWith(
      { id: 'run-1', page: 2, pageSize: 10, search: 'Patel' },
      expect.anything()
    );
    expect(result.current.isCurrent).toBe(true);
    expect(mocks.statusHook).toHaveBeenLastCalledWith(
      'run-1',
      expect.objectContaining({ pollingInterval: 0 })
    );
  });

  it('keeps completed results visible but unreviewable while calculating a replacement', () => {
    mocks.params = new URLSearchParams('month=2026-08&previewRunId=run-1');
    mocks.status.currentData = {
      month: '2026-08',
      academicYearId: 'year-1',
      status: 'SUCCEEDED',
      isCurrent: true,
    };
    mocks.page.currentData = {
      previewRunId: 'run-1',
      isCurrent: true,
      items: [{ employeeName: 'Synthetic' }],
    };
    const { result, rerender } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
    mocks.params = new URLSearchParams('month=2026-08&previewRunId=run-2');
    mocks.status.currentData = {
      month: '2026-08',
      academicYearId: 'year-1',
      status: 'RUNNING',
      isCurrent: false,
    };
    rerender();
    expect(result.current.data?.items).toHaveLength(1);
    expect(result.current.busy).toBe(true);
    expect(result.current.isCurrent).toBe(false);
  });

  it('rejects stale results and late responses for a previous month', async () => {
    let resolve!: (value: { id: string }) => void;
    mocks.start.mockReturnValueOnce({
      unwrap: () =>
        new Promise((done) => {
          resolve = done;
        }),
    });
    const { rerender } = renderHook(({ month }) => usePayrollPreviewRun(month, 'year-1'), {
      initialProps: { month: '2026-08' },
    });
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
    expect(mocks.replace).toHaveBeenCalledWith(expect.stringContaining('page=0&search=Patel'), {
      scroll: false,
    });
  });

  it('separates pagination loading from preparation and stale payroll', () => {
    completedPreview();
    const { result, rerender } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
    mocks.params = new URLSearchParams('month=2026-08&previewRunId=run-1&page=1');
    mocks.page.currentData = undefined;
    mocks.page.isFetching = true;
    rerender();
    expect(result.current.fetching).toBe(true);
    expect(result.current.isPreparing).toBe(false);
    expect(result.current.isStale).toBe(false);
    expect(result.current.isCurrent).toBe(false);
    expect(result.current.data?.previewRunId).toBe('run-1');
  });

  it.each(['status', 'page'])('recognizes a server-confirmed stale %s', (source) => {
    completedPreview();
    if (source === 'status') mocks.status.currentData.isCurrent = false;
    else mocks.page.currentData.isCurrent = false;
    const { result } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
    expect(result.current.isStale).toBe(true);
    expect(result.current.isPreparing).toBe(false);
    expect(result.current.isCurrent).toBe(false);
  });

  it.each(['FAILED', 'SUPERSEDED'])('does not automatically restart a %s run', (status) => {
    completedPreview();
    mocks.status.currentData = { ...mocks.status.currentData, status, isCurrent: false };
    const { result } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
    expect(mocks.start).not.toHaveBeenCalled();
    expect(result.current.isPreparing).toBe(false);
    expect(result.current.isCurrent).toBe(false);
    expect(result.current.isStale).toBe(status === 'SUPERSEDED');
    expect(Boolean(result.current.error)).toBe(status === 'FAILED');
  });

  it('blocks a superseded run even if its cached freshness flags are still true', () => {
    completedPreview();
    mocks.status.currentData.status = 'SUPERSEDED';
    const { result } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
    expect(result.current.isStale).toBe(true);
    expect(result.current.isCurrent).toBe(false);
    expect(result.current.isPreparing).toBe(false);
    expect(mocks.start).not.toHaveBeenCalled();
  });

  it('waits for the first matching result page after calculation succeeds', () => {
    completedPreview();
    mocks.page.currentData = undefined;
    mocks.page.isFetching = true;
    const { result, rerender } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
    expect(result.current.isPreparing).toBe(true);
    mocks.page.currentData = { previewRunId: 'run-1', isCurrent: true, items: [], readiness: {} };
    rerender();
    expect(result.current.isPreparing).toBe(true);
    mocks.page.isFetching = false;
    rerender();
    expect(result.current.isPreparing).toBe(false);
    expect(result.current.isCurrent).toBe(true);
  });

  it('blocks duplicate starts before and after acceptance until the URL acknowledges the run', async () => {
    completedPreview('old');
    let resolve!: (value: { id: string }) => void;
    mocks.start.mockReturnValue({
      unwrap: () =>
        new Promise((done) => {
          resolve = done;
        }),
    });
    const { result } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
    let first!: ReturnType<typeof result.current.loadPreview>;
    await act(async () => {
      first = result.current.loadPreview(true);
      expect(await result.current.loadPreview(true)).toBeNull();
    });
    expect(result.current.isPreparing).toBe(true);
    await act(async () => {
      resolve({ id: 'new' });
      await first;
    });
    expect(result.current.requestedRunId).toBe('new');
    await act(async () => {
      expect(await result.current.loadPreview(true)).toBeNull();
    });
    expect(mocks.start).toHaveBeenCalledTimes(1);
  });

  it('returns the accepted run and retains completed rows while loading its replacement', async () => {
    completedPreview('old');
    mocks.start.mockReturnValue({ unwrap: () => Promise.resolve({ id: 'new', status: 'QUEUED' }) });
    const { result, rerender } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
    await act(async () => {
      expect(await result.current.loadPreview(true)).toEqual({ id: 'new', status: 'QUEUED' });
    });
    mocks.status.currentData = {
      id: 'new',
      month: '2026-08',
      academicYearId: 'year-1',
      status: 'SUCCEEDED',
      isCurrent: true,
    };
    mocks.page.currentData = undefined;
    mocks.page.isFetching = true;
    rerender();
    expect(result.current.data?.previewRunId).toBe('old');
    expect(result.current.isPreparing).toBe(true);
    expect(result.current.isCurrent).toBe(false);
  });

  it('handles start failure and permits an explicit retry', async () => {
    completedPreview();
    mocks.start.mockReturnValueOnce({
      unwrap: () =>
        Promise.reject(Object.assign(new Error('Try again'), { data: { detail: 'Try again' } })),
    });
    const { result } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
    await act(async () => {
      expect(await result.current.loadPreview(true)).toBeNull();
    });
    expect(result.current.error?.message).toBe('Try again');
    expect(result.current.isPreparing).toBe(false);
    await act(async () => {
      expect(await result.current.loadPreview(true)).toEqual({ id: 'run-1' });
    });
    expect(mocks.start).toHaveBeenCalledTimes(2);
  });

  it.each(['status', 'page'])('ends preparation after a %s query failure', (source) => {
    completedPreview();
    const query = source === 'status' ? mocks.status : mocks.page;
    query.currentData = undefined;
    query.isError = true;
    query.error = { data: { detail: 'Service unavailable' } };
    const { result } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
    expect(result.current.error?.message).toBe('Service unavailable');
    expect(result.current.isPreparing).toBe(false);
    expect(result.current.isStale).toBe(false);
  });

  it('retries a polling failure while the accepted run is still running', async () => {
    completedPreview();
    mocks.status.currentData.status = 'RUNNING';
    mocks.status.isError = true;
    mocks.status.error = { data: { detail: 'Service unavailable' } };
    const { result } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
    expect(result.current.isPreparing).toBe(false);
    await act(async () => {
      expect(await result.current.loadPreview(true)).toEqual({ id: 'run-1' });
    });
    expect(mocks.start).toHaveBeenCalledTimes(1);
    expect(mocks.status.refetch).toHaveBeenCalled();
  });

  it('ignores the previous result-fetch failure while a retry calculates a replacement', async () => {
    completedPreview('old');
    const { result, rerender } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
    mocks.page.isError = true;
    mocks.page.error = { data: { detail: 'Previous fetch failed' } };
    rerender();
    expect(result.current.error?.message).toBe('Previous fetch failed');
    mocks.start.mockReturnValue({ unwrap: () => Promise.resolve({ id: 'new', status: 'QUEUED' }) });
    await act(async () => result.current.loadPreview(true));
    mocks.status.currentData = {
      ...mocks.status.currentData,
      id: 'new',
      status: 'QUEUED',
      isCurrent: false,
      lastCompletedRunId: 'old',
    };
    rerender();
    expect(result.current.error).toBeNull();
    expect(result.current.isPreparing).toBe(true);
    expect(result.current.data?.previewRunId).toBe('old');
    expect(result.current.isCurrent).toBe(false);
  });

  it('does not retain a previous query error while retry results are fetching', () => {
    completedPreview();
    mocks.page.error = { data: { detail: 'Previous fetch failed' } };
    mocks.page.isError = false;
    mocks.page.isFetching = true;
    const { result } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
    expect(result.current.error).toBeNull();
    expect(result.current.isPreparing).toBe(true);
    expect(result.current.isCurrent).toBe(false);
  });

  it('ignores late acceptance even after returning to the original context', async () => {
    let resolve!: (value: { id: string }) => void;
    mocks.start.mockReturnValueOnce({
      unwrap: () =>
        new Promise((done) => {
          resolve = done;
        }),
    });
    const { rerender } = renderHook(({ month }) => usePayrollPreviewRun(month, 'year-1'), {
      initialProps: { month: '2026-08' },
    });
    rerender({ month: '2026-09' });
    rerender({ month: '2026-08' });
    await act(async () => resolve({ id: 'late-original-month' }));
    expect(mocks.replace.mock.calls.some(([url]) => url.includes('late-original-month'))).toBe(
      false
    );
    expect(mocks.start).toHaveBeenCalledTimes(3);
  });

  it('does not retain rows from a different academic year', () => {
    completedPreview();
    const { result, rerender } = renderHook(({ year }) => usePayrollPreviewRun('2026-08', year), {
      initialProps: { year: 'year-1' },
    });
    mocks.status.currentData = undefined;
    mocks.page.currentData = undefined;
    rerender({ year: 'year-2' });
    expect(result.current.data).toBeUndefined();
  });

  it('ignores an accepted run after unmount', async () => {
    completedPreview();
    let resolve!: (value: { id: string }) => void;
    mocks.start.mockReturnValue({
      unwrap: () =>
        new Promise((done) => {
          resolve = done;
        }),
    });
    const { result, unmount } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
    let pending!: ReturnType<typeof result.current.loadPreview>;
    act(() => {
      pending = result.current.loadPreview(true);
    });
    unmount();
    await act(async () => {
      resolve({ id: 'new' });
      expect(await pending).toBeNull();
    });
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});

// This screen test isolates its owning reader; typed criteria transport is covered by the adapter suite.
vi.mock('src/redux/hr/hrOperationalTableApi', () => ({
  useHrOperationalTableQuery: () => ({
    currentData: undefined,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));
