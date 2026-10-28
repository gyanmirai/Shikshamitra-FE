import type { PropsWithChildren } from 'react';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { useAcademicReportDownload } from './useAcademicReportDownload';

vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000'; });

beforeEach(() => {
  clearCachedAuthSession();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
});
afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  clearCachedAuthSession();
});

it('stops queued report polling when its owning screen unmounts', async () => {
  let requests = 0;
  mswServer.use(http.get('*/api/app/academic-report/exports/:jobId', () => {
    requests += 1;
    return HttpResponse.json({ id: 'job', status: 'Processing' });
  }));
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  const wrapper = ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>;
  const hook = renderHook(useAcademicReportDownload, { wrapper });
  try {
    await act(() => hook.result.current.handleDownload('job', 'Queued'));
    await act(() => vi.advanceTimersByTimeAsync(2000));
    await vi.waitFor(() => expect(requests).toBe(1));
    hook.unmount();
    await act(() => vi.advanceTimersByTimeAsync(4000));
    expect(requests).toBe(1);
  } finally {
    hook.result.current.stopPolling();
    store.dispatch(api.util.resetApiState());
  }
});
