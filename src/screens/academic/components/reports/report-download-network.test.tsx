import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { act } from '@testing-library/react';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { deferred, mountReportDownload } from './report-download-test-utils';

vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000'; });

beforeEach(() => {
  clearCachedAuthSession();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
});
afterEach(() => {
  vi.clearAllTimers(); vi.useRealTimers(); vi.restoreAllMocks(); clearCachedAuthSession();
});

it('waits for a slow status response before scheduling the next poll', async () => {
  const slow = deferred();
  let requests = 0;
  mswServer.use(http.get('*/api/app/academic-report/exports/:jobId', async () => {
    requests += 1;
    await slow.promise;
    return HttpResponse.json({ id: 'job', status: 'Processing' });
  }));
  const { hook, store, cleanup } = mountReportDownload();
  try {
    await act(() => hook.result.current.handleDownload('job', 'Queued'));
    await act(() => vi.advanceTimersByTimeAsync(12000));
    await vi.waitFor(() => expect(requests).toBe(1));
    expect(hook.result.current.downloadPhase).toBe('polling');
    await act(async () => { slow.resolve(); await Promise.all(store.dispatch(api.util.getRunningQueriesThunk())); });
    expect(hook.result.current.jobStatusLabel).toBe('Processing');
    await act(() => vi.advanceTimersByTimeAsync(1999));
    expect(requests).toBe(1);
    await act(() => vi.advanceTimersByTimeAsync(1));
    await vi.waitFor(() => expect(requests).toBe(2));
  } finally { slow.resolve(); cleanup(); }
});

it.each(['user', 'tenant'] as const)('cancels export creation when the %s changes', async (kind) => {
  const slow = deferred();
  let creates = 0;
  let aborted = false;
  let statuses = 0;
  mswServer.use(
    http.post('*/api/app/academic-report/exports', async ({ request }) => {
      creates += 1;
      request.signal.addEventListener('abort', () => { aborted = true; });
      await slow.promise;
      return HttpResponse.json({ jobId: 'stale-job', status: 'Queued' });
    }),
    http.get('*/api/app/academic-report/exports/:jobId', () => {
      statuses += 1;
      return HttpResponse.json({ id: 'stale-job', status: 'Processing' });
    }),
  );
  const { hook, cleanup, switchAccount } = mountReportDownload();
  try {
    let creation!: Promise<void>;
    act(() => { creation = hook.result.current.handleCreateDownload({ reportType: 'test-report' }); });
    await vi.waitFor(() => expect(creates).toBe(1));
    expect(hook.result.current.downloadPhase).toBe('creating');
    act(() => switchAccount(kind));
    await act(async () => { slow.resolve(); await creation; });
    await act(() => vi.advanceTimersByTimeAsync(6000));
    expect(aborted).toBe(true);
    expect(statuses).toBe(0);
    expect(hook.result.current.downloadPhase).toBe('idle');
    expect(hook.result.current.downloadingJobId).toBeNull();
  } finally { slow.resolve(); cleanup(); }
});

it('cancels an in-flight download and never saves it after unmount', async () => {
  const slow = deferred();
  let requests = 0;
  let aborted = false;
  mswServer.use(http.get('*/api/app/academic-report/exports/:jobId/download', async ({ request }) => {
    requests += 1;
    request.signal.addEventListener('abort', () => { aborted = true; });
    await slow.promise;
    return new HttpResponse('%PDF-stale', { headers: { 'Content-Type': 'application/pdf' } });
  }));
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
  const { hook, cleanup } = mountReportDownload();
  try {
    let download!: Promise<void>;
    act(() => { download = hook.result.current.handleDownload('job', 'Completed'); });
    await vi.waitFor(() => expect(requests).toBe(1));
    expect(hook.result.current.downloadPhase).toBe('downloading');
    hook.unmount();
    await act(async () => { slow.resolve(); await download; });
    expect(aborted).toBe(true);
    expect(click).not.toHaveBeenCalled();
  } finally { slow.resolve(); cleanup(); }
});

it.each(['unmount', 'user', 'tenant'] as const)('ignores a late completed status after %s', async (change) => {
  const slow = deferred();
  let statuses = 0;
  let files = 0;
  mswServer.use(
    http.get('*/api/app/academic-report/exports/:jobId', async () => {
      statuses += 1;
      await slow.promise;
      return HttpResponse.json({ id: 'stale-job', status: 'Completed' });
    }),
    http.get('*/api/app/academic-report/exports/:jobId/download', () => {
      files += 1;
      return new HttpResponse('%PDF-stale');
    }),
  );
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
  const { hook, cleanup, switchAccount } = mountReportDownload();
  try {
    await act(() => hook.result.current.handleDownload('stale-job', 'Queued', true));
    await act(() => vi.advanceTimersByTimeAsync(2000));
    await vi.waitFor(() => expect(statuses).toBe(1));
    act(() => { if (change === 'unmount') hook.unmount(); else switchAccount(change); });
    await act(async () => { slow.resolve(); await vi.advanceTimersByTimeAsync(6000); });
    expect(files).toBe(0);
    expect(statuses).toBe(1);
    expect(click).not.toHaveBeenCalled();
  } finally { slow.resolve(); cleanup(); }
});
