import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { libraryReceivingApi } from './receiving-api';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
beforeEach(clearCachedAuthSession);

it('requests the scoped receipt register with exact stored-date/source/copy filters and no academic origin year', async () => {
  let params: URLSearchParams | undefined;
  const page = {
    items: [
      {
        id: 'receipt-id',
        receivedOn: '2026-11-18',
        source: 0,
        sourceName: 'School supplier',
        reference: 'தமிழ்/INV#?+',
        recordedBy: 'actor-id',
        recordedAt: '2026-11-18T04:30:00Z',
        lineCount: 2,
        copyCount: 20,
      },
    ],
    totalCount: 12,
    currentPage: 2,
    pageSize: 10,
    totalPages: 2,
  };
  mswServer.use(
    http.get('http://library.test/api/library/receiving', ({ request }) => {
      params = new URL(request.url).searchParams;
      return HttpResponse.json(page);
    })
  );
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  const result = await store.dispatch(
    libraryReceivingApi.endpoints.getLibraryReceivingHistory.initiate({
      page: 2,
      pageSize: 10,
      source: 0,
      receivedFrom: '2026-11-01',
      receivedTo: '2026-11-18',
      search: 'தமிழ்/INV#?+',
      copyId: 'copy-id',
    })
  );
  expect(result).toMatchObject({ data: page });
  expect(Object.fromEntries(params!)).toEqual({
    page: '2',
    pageSize: '10',
    source: '0',
    receivedFrom: '2026-11-01',
    receivedTo: '2026-11-18',
    search: 'தமிழ்/INV#?+',
    copyId: 'copy-id',
  });
  expect(params?.has('academicYearId')).toBe(false);
});
