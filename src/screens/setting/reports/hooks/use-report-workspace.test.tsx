import { createElement } from 'react';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { act, cleanup, waitFor, renderHook } from '@testing-library/react';

import { useReportWorkspace } from './use-report-workspace';

vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000'; });

describe('report status polling', () => {
  beforeEach(() => {
    clearCachedAuthSession();
    mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
  });
  afterEach(() => { cleanup(); clearCachedAuthSession(); });

  it('retains typed search when sorting before the search debounce fires', async () => {
    const urls: URL[] = [];
    mswServer.use(
      http.get('*/api/app/institute-setup-report/options', () => HttpResponse.json({ reportTypes: [], choices: {} })),
      http.get('*/api/app/institute-setup-report/history', ({ request }) => { urls.push(new URL(request.url)); return HttpResponse.json({ items: [], totalCount: 0 }); }),
    );
    const auth = { permissionsInitialized: true, permissions: [{ name: 'InstituteSetup.Reports.View', isGranted: true }] };
    const store = configureStore({ reducer: { [api.reducerPath]: api.reducer, auth: () => auth }, middleware: (defaults) => defaults().concat(api.middleware) });
    const wrapper = ({ children }: { children: React.ReactNode }) => createElement(Provider, { store, children });
    const { result, unmount } = renderHook(useReportWorkspace, { wrapper });
    await waitFor(() => expect(urls.length).toBe(1));
    expect(urls[0].searchParams.get('timeZone')).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone);
    act(() => { result.current.setSearchInput?.('Shift'); });
    await waitFor(() => expect(result.current.searchInput).toBe('Shift'));
    act(() => { result.current.changeSort([{ column: 'reportType', direction: 'asc' }]); });
    await waitFor(() => expect(urls.at(-1)?.searchParams.get('filter')).toBe('Shift'));
    expect(result.current.searchInput).toBe('Shift');
    expect(urls.at(-1)?.searchParams.get('sorting')).toBe('reportType asc');
    unmount(); store.dispatch(api.util.resetApiState());
  });

  it('sends history search and sort criteria to the server and resets the page', async () => {
    const urls: URL[] = [];
    mswServer.use(
      http.get('*/api/app/institute-setup-report/options', () => HttpResponse.json({ reportTypes: [], choices: {} })),
      http.get('*/api/app/institute-setup-report/history', ({ request }) => { urls.push(new URL(request.url)); return HttpResponse.json({ items: [], totalCount: 0 }); }),
    );
    const auth = { permissionsInitialized: true, permissions: [{ name: 'InstituteSetup.Reports.View', isGranted: true }] };
    const store = configureStore({ reducer: { [api.reducerPath]: api.reducer, auth: () => auth }, middleware: (defaults) => defaults().concat(api.middleware) });
    const wrapper = ({ children }: { children: React.ReactNode }) => createElement(Provider, { store, children });
    const { result, unmount } = renderHook(useReportWorkspace, { wrapper });
    await waitFor(() => expect(urls.length).toBe(1));
    act(() => { result.current.setPagination(2, 10); });
    await waitFor(() => expect(urls.at(-1)?.searchParams.get('skipCount')).toBe('20'));
    act(() => { result.current.changeSearch?.('document'); result.current.changeSort?.([{ column: 'creationTime', direction: 'asc' }]); });
    await waitFor(() => expect(urls.at(-1)?.searchParams.get('filter')).toBe('document'));
    expect(urls.at(-1)?.searchParams.get('sorting')).toBe('creationTime asc');
    expect(urls.at(-1)?.searchParams.get('skipCount')).toBe('0');
    unmount(); store.dispatch(api.util.resetApiState());
  });

  it('polls only pending IDs and refreshes history once completion arrives', async () => {
    const pending = { id: 'pending-job', reportTypeId: 'shift-register', status: 'Queued' };
    const complete = { id: 'old-job', reportTypeId: 'shift-register', status: 'Completed' };
    let historyCalls = 0;
    const bodies: unknown[] = [];
    mswServer.use(
      http.get('*/api/app/institute-setup-report/options', () => HttpResponse.json({
        reportTypes: [{ id: 'shift-register', label: 'Shifts', requiredPermissions: ['Source.View'], academic: false, columns: [] }], choices: {},
      })),
      http.get('*/api/app/institute-setup-report/history', () => {
        historyCalls += 1;
        return HttpResponse.json({ totalCount: 2, items: [historyCalls > 1 ? { ...pending, status: 'Completed' } : pending, complete] });
      }),
      http.post('*/api/app/institute-setup-report/statuses', async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json([{ ...pending, status: 'Completed' }]);
      }),
    );
    const auth = { permissionsInitialized: true, permissions: ['InstituteSetup.Reports.View', 'Source.View'].map((name) => ({ name, isGranted: true })) };
    const store = configureStore({
      reducer: { [api.reducerPath]: api.reducer, auth: () => auth },
      middleware: (defaults) => defaults().concat(api.middleware),
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => createElement(Provider, { store, children });
    const { result, unmount } = renderHook(useReportWorkspace, { wrapper });
    await waitFor(() => expect(result.current.history.data?.items[0]?.status).toBe('Completed'));
    await waitFor(() => expect(historyCalls).toBe(2));
    expect(bodies).toEqual([['pending-job']]);
    unmount(); store.dispatch(api.util.resetApiState());
  });
});
