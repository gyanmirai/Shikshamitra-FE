import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { act, cleanup, waitFor, renderHook } from '@testing-library/react';

import { usePayrollPreviewRun } from './use-payroll-preview-run';

const mocks = vi.hoisted(() => ({
  params: new URLSearchParams('month=2026-08'),
  replace: vi.fn(),
  start: vi.fn(),
  lookup: {} as any,
  status: {} as any,
  page: {} as any,
  opening: {} as any,
  statusHook: vi.fn(),
  pageHook: vi.fn(),
  registerHook: vi.fn(),
  openingHook: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
  usePathname: () => '/hr/payroll/run-payroll',
  useSearchParams: () => mocks.params,
}));
vi.mock('src/redux/runPayroll/payroll-preview-run-api', () => ({
  usePayrollPreviewLookupQuery: () => mocks.lookup,
  usePayrollRegisterQuery: (input: unknown, options: unknown) => {
    mocks.registerHook(input, options);
    return mocks.page;
  },
  usePayrollRegisterQueryState: () => mocks.page,
  usePayrollRegisterRowsQuery: (input: unknown, options: unknown) => {
    mocks.openingHook(input, options);
    return mocks.opening;
  },
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
  mocks.lookup = { currentData: { currentRun: null }, refetch: vi.fn() };
  mocks.status = { refetch: vi.fn() };
  mocks.page = { refetch: vi.fn() };
  mocks.opening = { currentData: {} };
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
  it('opens the first register page with saved rows before fetching review details', () => {
    mocks.opening = {};
    const { result, rerender } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1', true));
    expect(mocks.openingHook).toHaveBeenLastCalledWith(
      expect.objectContaining({ month: '2026-08', academicYearId: 'year-1', page: 0, pageSize: 25 }),
      { skip: false }
    );
    expect(mocks.registerHook.mock.lastCall?.[1]).toMatchObject({ skip: true });
    expect(result.current.fetching).toBe(true);

    const registerRows = [{ employeeId: '1', employeeName: 'Asha Rao' }];
    mocks.opening = { currentData: { registerRows } };
    rerender();
    expect(result.current.openingRows).toEqual(registerRows);
    expect(result.current.data).toBeUndefined();
    expect(result.current.isCurrent).toBe(false);
    expect(mocks.registerHook.mock.lastCall?.[1]).toMatchObject({ skip: false });

    completedPreview();
    rerender();
    expect(result.current.openingRows).toBeUndefined();
    expect(result.current.isCurrent).toBe(true);
    expect(mocks.openingHook.mock.lastCall?.[1]).toEqual({ skip: true });
  });

  it('falls back to the full register when the opening read fails', () => {
    mocks.opening = { isError: true, error: { status: 503 } };
    const { result } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1', true));
    expect(mocks.registerHook.mock.lastCall?.[1]).toMatchObject({ skip: false });
    expect(result.current.openingRows).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  it('does not fetch the same register again when lookup finds its already loaded preview', () => {
    completedPreview();
    mocks.params.delete('previewRunId');
    const status = mocks.status.currentData;
    delete mocks.status.currentData;
    const { result, rerender } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1', true));
    const initialRegisterArgs = mocks.registerHook.mock.calls[0][0];
    mocks.lookup.currentData = { currentRun: status };
    rerender();
    expect(mocks.registerHook.mock.calls.at(-1)?.[0]).toEqual(initialRegisterArgs);
    expect(initialRegisterArgs).not.toHaveProperty('completedId');
    expect(mocks.page.refetch).not.toHaveBeenCalled();
    expect(result.current.isCurrent).toBe(true);
  });

  it('reconciles a stale register once after a newer run completes', () => {
    completedPreview('run-2');
    mocks.page.currentData = { ...mocks.page.currentData, previewRunId: 'run-1' };
    mocks.page.isFetching = true;
    const { result, rerender } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1', true));
    expect(mocks.page.refetch).not.toHaveBeenCalled();
    expect(result.current.isCurrent).toBe(false);
    mocks.page.isFetching = false;
    rerender();
    rerender();
    expect(mocks.page.refetch).toHaveBeenCalledOnce();
    expect(result.current.isCurrent).toBe(false);
    mocks.page.currentData = { ...mocks.page.currentData, previewRunId: 'run-2' };
    rerender();
    expect(result.current.isCurrent).toBe(true);
  });

  it.each(['month', 'year', 'return', 'unmount'])(
    'rejects an old refresh callback invoked after a context %s',
    async (change) => {
      completedPreview();
      const { result, rerender, unmount } = renderHook(
        ({ month, year }) => usePayrollPreviewRun(month, year),
        { initialProps: { month: '2026-08', year: 'year-1' } }
      );
      const oldRefresh = result.current.loadPreview;
      if (change === 'unmount') unmount();
      else {
        const next = {
          month: change === 'year' ? '2026-08' : '2026-09',
          year: change === 'year' ? 'year-2' : 'year-1',
        };
        mocks.params.set('month', next.month);
        Object.assign(mocks.status.currentData, { month: next.month, academicYearId: next.year });
        rerender(next);
        if (change === 'return') {
          mocks.params.set('month', '2026-08');
          Object.assign(mocks.status.currentData, { month: '2026-08', academicYearId: 'year-1' });
          rerender({ month: '2026-08', year: 'year-1' });
        }
      }
      mocks.start.mockClear();
      mocks.replace.mockClear();
      await act(async () => {
        expect(await oldRefresh(true)).toBeNull();
      });
      expect(mocks.start).not.toHaveBeenCalled();
      expect(mocks.replace).not.toHaveBeenCalled();
      if (change !== 'unmount') {
        await act(async () => {
          await result.current.loadPreview(true);
        });
        expect(mocks.start).toHaveBeenCalledTimes(1);
      }
    }
  );
  it('refreshes an existing preview and its reviews using reads only', async () => {
    completedPreview();
    mocks.status.refetch.mockResolvedValue({ data: mocks.status.currentData });
    mocks.page.refetch.mockResolvedValue({ data: mocks.page.currentData });
    const { result } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
    await act(async () => result.current.refreshStatus());
    expect(mocks.status.refetch).toHaveBeenCalledOnce();
    expect(mocks.page.refetch).toHaveBeenCalledOnce();
    expect(mocks.start).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
    expect(result.current.refreshingStatus).toBe(false);
    expect(result.current.isCurrent).toBe(true);
  });

  it('retains a status refresh error without starting a replacement generation', async () => {
    completedPreview();
    mocks.status.refetch.mockResolvedValue({ error: { status: 503 } });
    const { result } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
    await act(async () => result.current.refreshStatus());
    expect(mocks.page.refetch).not.toHaveBeenCalled();
    expect(mocks.start).not.toHaveBeenCalled();
    expect(result.current.refreshingStatus).toBe(false);
  });

  it('does not refetch old employee results after changing payroll context', async () => {
    completedPreview();
    let resolve!: (value: any) => void;
    mocks.status.refetch.mockReturnValue(
      new Promise((done) => {
        resolve = done;
      })
    );
    const { result, rerender } = renderHook(({ month }) => usePayrollPreviewRun(month, 'year-1'), {
      initialProps: { month: '2026-08' },
    });
    let pending!: ReturnType<typeof result.current.refreshStatus>;
    act(() => {
      pending = result.current.refreshStatus();
    });
    expect(result.current.refreshingStatus).toBe(true);
    rerender({ month: '2026-09' });
    await act(async () => {
      resolve({ data: mocks.status.currentData });
      await pending;
    });
    expect(mocks.page.refetch).not.toHaveBeenCalled();
  });

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
    completedPreview('old');
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
  it('waits for explicit generation when the lookup confirms no saved payroll', async () => {
    const { result } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
    expect(mocks.start).not.toHaveBeenCalled();
    expect(result.current.canRequestPreview).toBe(true);
    await act(async () => result.current.loadPreview());
    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith(expect.stringContaining('previewRunId=run-1'), {
        scroll: false,
      })
    );
    expect(mocks.start).toHaveBeenCalledTimes(1);
    expect(mocks.start).toHaveBeenCalledWith({
      commandKey: expect.any(String),
      month: '2026-08',
      academicYearId: 'year-1',
      refresh: false,
    });
  });

  it('opens saved payroll from month lookup without generating or rewriting the URL', () => {
    completedPreview();
    mocks.params.delete('previewRunId');
    mocks.lookup.currentData.currentRun = mocks.status.currentData;
    const { result } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
    expect(result.current.isCurrent).toBe(true);
    expect(result.current.runId).toBe('run-1');
    expect(mocks.start).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it('clears a saved link from a different academic year without starting payroll', () => {
    completedPreview();
    renderHook(() => usePayrollPreviewRun('2026-08', 'year-2'));
    expect(mocks.replace).toHaveBeenCalledWith('/hr/payroll/run-payroll?month=2026-08', {
      scroll: false,
    });
    expect(mocks.start).not.toHaveBeenCalled();
  });

  it('retries a failed lookup as a read and keeps generation disabled until lookup succeeds', async () => {
    mocks.lookup.isError = true;
    mocks.lookup.error = { status: 503 };
    mocks.lookup.refetch.mockResolvedValue({ data: { currentRun: null } });
    const { result } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
    expect(result.current.lookupFailed).toBe(true);
    expect(result.current.canRequestPreview).toBe(false);
    await act(async () => {
      expect(await result.current.loadPreview()).toBeNull();
      expect(await result.current.refreshStatus()).toBe(true);
    });
    expect(mocks.lookup.refetch).toHaveBeenCalledOnce();
    expect(mocks.start).not.toHaveBeenCalled();
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
    const { result, rerender } = renderHook(({ month }) => usePayrollPreviewRun(month, 'year-1'), {
      initialProps: { month: '2026-08' },
    });
    let pending!: ReturnType<typeof result.current.loadPreview>;
    act(() => {
      pending = result.current.loadPreview();
    });
    rerender({ month: '2026-09' });
    await act(async () => {
      resolve({ id: 'old-month' });
      await pending;
    });
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

  it('reconnects with a read when polling the accepted run fails', async () => {
    completedPreview();
    mocks.status.currentData.status = 'RUNNING';
    mocks.status.isError = true;
    mocks.status.error = { data: { detail: 'Service unavailable' } };
    mocks.status.refetch.mockResolvedValue({ data: mocks.status.currentData });
    const { result } = renderHook(() => usePayrollPreviewRun('2026-08', 'year-1'));
    expect(result.current.isPreparing).toBe(false);
    await act(async () => {
      expect(await result.current.loadPreview(true)).toBeNull();
      await result.current.refreshStatus();
    });
    expect(mocks.start).not.toHaveBeenCalled();
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
    const { result, rerender } = renderHook(({ month }) => usePayrollPreviewRun(month, 'year-1'), {
      initialProps: { month: '2026-08' },
    });
    let pending!: ReturnType<typeof result.current.loadPreview>;
    act(() => {
      pending = result.current.loadPreview();
    });
    rerender({ month: '2026-09' });
    rerender({ month: '2026-08' });
    await act(async () => {
      resolve({ id: 'late-original-month' });
      await pending;
    });
    expect(mocks.replace.mock.calls.some(([url]) => url.includes('late-original-month'))).toBe(
      false
    );
    expect(mocks.start).toHaveBeenCalledOnce();
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
