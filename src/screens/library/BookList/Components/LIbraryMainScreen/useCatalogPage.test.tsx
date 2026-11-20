import React from 'react';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { mswServer } from 'src/test/mswServer';
import { http, delay, HttpResponse } from 'msw';
import { configureStore } from '@reduxjs/toolkit';
import { libraryModuleType } from 'src/redux/tagTypes';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, waitFor, renderHook } from '@testing-library/react';
import globalReducer, { setCurrentYear } from 'src/redux/globalState/globalSlice';

import { useCatalogPage } from './useCatalogPage';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('year=year-1&page=2'),
  usePathname: () => '/library/book-list',
  useRouter: () => ({ replace: vi.fn() }),
}));

function setup() {
  const store = configureStore({
    reducer: { globalState: globalReducer, [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  store.dispatch(setCurrentYear({ id: 'year-1' }));
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return { store, ...renderHook(() => useCatalogPage(), { wrapper }) };
}

beforeEach(clearCachedAuthSession);

describe('catalog server pages', () => {
  it('replaces a refreshed page without accumulating duplicate rows', async () => {
    let revision = 0;
    mswServer.use(
      http.get('http://library.test/api/library/books', ({ request }) => {
        const params = new URL(request.url).searchParams;
        expect(params.get('page')).toBe('2');
        revision += 1;
        return HttpResponse.json({
          items: [{ id: 'book-2', title: `Revision ${revision}` }],
          totalCount: 20,
          pageSize: 10,
        });
      })
    );
    const { result, store } = setup();
    await waitFor(() => expect(result.current.currentData?.items[0].title).toBe('Revision 1'));
    act(() => {
      store.dispatch(api.util.invalidateTags([libraryModuleType.books]));
    });
    await waitFor(() => expect(result.current.currentData?.items[0].title).toBe('Revision 2'));
    expect(result.current.currentData?.items).toHaveLength(1);
  });

  it('hides prior-year records immediately and requests the first page of the new year', async () => {
    mswServer.use(
      http.get('http://library.test/api/library/books', async ({ request }) => {
        const params = new URL(request.url).searchParams;
        const year = params.get('academicYearId');
        if (year === 'year-2') {
          expect(params.get('page')).toBe('1');
          await delay(75);
        }
        return HttpResponse.json({
          items: [{ id: year, title: year }],
          totalCount: 20,
          pageSize: 10,
        });
      })
    );
    const { result, store } = setup();
    await waitFor(() => expect(result.current.currentData?.items[0].id).toBe('year-1'));
    act(() => {
      store.dispatch(setCurrentYear({ id: 'year-2' }));
    });
    expect(result.current.currentData).toBeUndefined();
    await waitFor(() => expect(result.current.currentData?.items[0].id).toBe('year-2'));
    expect(result.current.currentData?.items).toHaveLength(1);
  });
});
