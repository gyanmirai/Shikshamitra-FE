import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { instituteReportsApi } from './instituteReportsApi';

vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000'; });

describe('Institute Setup report history transport', () => {
  beforeEach(() => {
    clearCachedAuthSession();
    mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
  });
  afterEach(() => { clearCachedAuthSession(); });

  it('requests a bounded history page without downloading every saved request', async () => {
    const urls: URL[] = [];
    mswServer.use(http.get('*/api/app/institute-setup-report/history', ({ request }) => {
      urls.push(new URL(request.url));
      return HttpResponse.json({ items: [], totalCount: 120 });
    }));
    const store = configureStore({ reducer: { [api.reducerPath]: api.reducer }, middleware: (defaults) => defaults().concat(api.middleware) });
    const call = store.dispatch(instituteReportsApi.endpoints.instituteReportHistory.initiate({ skipCount: 10, maxResultCount: 10, timeZone: 'Asia/Kolkata' }));
    const result = await call.unwrap();
    expect(result).toEqual({ items: [], totalCount: 120 });
    expect(urls[0].searchParams.get('skipCount')).toBe('10');
    expect(urls[0].searchParams.get('maxResultCount')).toBe('10');
    expect(urls[0].searchParams.get('timeZone')).toBe('Asia/Kolkata');
    call.unsubscribe(); store.dispatch(api.util.resetApiState());
  });

  it('refreshes the cached first history page after queuing from a later page', async () => {
    let queued = false;
    mswServer.use(
      http.get('*/api/app/institute-setup-report/history', () => HttpResponse.json({ items: queued ? [{ id: 'new-job' }] : [], totalCount: queued ? 1 : 0 })),
      http.post('*/api/app/institute-setup-report/exports', () => { queued = true; return HttpResponse.json({ id: 'new-job' }); }),
    );
    const store = configureStore({ reducer: { [api.reducerPath]: api.reducer }, middleware: (defaults) => defaults().concat(api.middleware) });
    const first = store.dispatch(instituteReportsApi.endpoints.instituteReportHistory.initiate({ skipCount: 0, maxResultCount: 10 }));
    await first.unwrap(); first.unsubscribe();
    const later = store.dispatch(instituteReportsApi.endpoints.instituteReportHistory.initiate({ skipCount: 10, maxResultCount: 10 }));
    await later.unwrap();
    await store.dispatch(instituteReportsApi.endpoints.instituteReportExport.initiate({ reportType: 'shift-register', format: 'pdf', page: 1, pageSize: 25, filters: {}, columns: [], conditions: [], descending: false })).unwrap();
    const refreshed = store.dispatch(instituteReportsApi.endpoints.instituteReportHistory.initiate({ skipCount: 0, maxResultCount: 10 }));
    expect((await refreshed.unwrap()).items).toEqual([{ id: 'new-job' }]);
    later.unsubscribe(); refreshed.unsubscribe(); store.dispatch(api.util.resetApiState());
  });
});
