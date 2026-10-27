import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { act, cleanup, waitFor, renderHook } from '@testing-library/react';
import { exportTable } from 'src/components/customizabaleTable/table-export';

import { useReportWorkspace } from './use-report-workspace';
import { exportRows, exportRequest, historyExportFixture } from './report-history-export.fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.mock('src/components/customizabaleTable/table-export', () => ({ exportTable: vi.fn() }));

describe('explicit report history exports', () => {
  beforeEach(() => {
    clearCachedAuthSession();
    vi.mocked(exportTable).mockReset();
  });
  afterEach(() => {
    cleanup();
    clearCachedAuthSession();
  });

  it('loads all matching rows only on export and snapshots the latest draft, criteria and selected columns', async () => {
    const urls: URL[] = [];
    mswServer.use(
      http.get('*/api/app/institute-setup-report/history', ({ request }) => {
        const url = new URL(request.url);
        urls.push(url);
        const skip = Number(url.searchParams.get('skipCount'));
        const size = Number(url.searchParams.get('maxResultCount'));
        return HttpResponse.json({
          items: exportRows.slice(skip, skip + size),
          totalCount: exportRows.length,
        });
      })
    );
    const { store, wrapper } = historyExportFixture();
    const { result, unmount } = renderHook(useReportWorkspace, { wrapper });
    await waitFor(() => expect(result.current.options.data?.reportTypes).toHaveLength(1));
    await waitFor(() => expect(result.current.history.data?.items).toHaveLength(10));
    expect(urls).toHaveLength(1);
    expect(exportTable).not.toHaveBeenCalled();
    act(() => result.current.setSearchInput('Shift'));
    await act(() => result.current.exportHistory({ ...exportRequest, searchTerm: '' }));
    const pages = urls.slice(1);
    expect(pages.map((url) => url.searchParams.get('skipCount'))).toEqual(['0', '100', '200']);
    pages.forEach((url) => {
      expect(url.searchParams.get('maxResultCount')).toBe('100');
      expect(url.searchParams.get('filter')).toBe('Shift');
      expect(url.searchParams.get('sorting')).toBe('creationTime desc');
      expect(JSON.parse(url.searchParams.get('columnFilters')!)).toEqual([
        { column: 'status', type: 'equals', value: 'Completed' },
      ]);
      expect(url.searchParams.get('timeZone')).toBe(
        Intl.DateTimeFormat().resolvedOptions().timeZone
      );
    });
    expect(exportTable).toHaveBeenCalledOnce();
    expect(vi.mocked(exportTable).mock.calls[0][0]).toMatchObject({
      rows: exportRows,
      columns: exportRequest.columns,
      columnVisibility: { fileName: true },
    });
    expect(
      Object.values(store.getState().api.queries).filter(
        (query) => query?.endpointName === 'instituteReportHistory'
      )
    ).toHaveLength(1);
    unmount();
    store.dispatch(api.util.resetApiState());
  });

  it.each(['cancel', 'session', 'school', 'unmount'])(
    'does not download or request more pages after %s',
    async (change) => {
      let release!: () => void;
      let started = false;
      let aborted = false;
      let exportCalls = 0;
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      mswServer.use(
        http.get('*/api/app/institute-setup-report/history', async ({ request }) => {
          if (new URL(request.url).searchParams.get('maxResultCount') === '100') {
            exportCalls += 1;
            started = true;
            request.signal.addEventListener('abort', () => {
              aborted = true;
            });
            await gate;
          }
          return HttpResponse.json({ items: exportRows.slice(0, 100), totalCount: 205 });
        })
      );
      const { store, wrapper } = historyExportFixture();
      const { result, unmount } = renderHook(useReportWorkspace, { wrapper });
      await waitFor(() => expect(result.current.options.data?.reportTypes).toHaveLength(1));
      const controller = new AbortController();
      let pending!: Promise<void>;
      act(() => {
        pending = result.current.exportHistory({ ...exportRequest, signal: controller.signal });
      });
      await waitFor(() => expect(started).toBe(true));
      act(() => {
        if (change === 'cancel') controller.abort();
        if (change === 'session') clearCachedAuthSession();
        if (change === 'school') store.dispatch({ type: 'test/switch-school' });
        if (change === 'unmount') unmount();
        release();
      });
      await act(() => pending);
      expect(exportTable).not.toHaveBeenCalled();
      expect(exportCalls).toBe(1);
      if (change !== 'session') expect(aborted).toBe(true);
      unmount();
      store.dispatch(api.util.resetApiState());
    }
  );
});
