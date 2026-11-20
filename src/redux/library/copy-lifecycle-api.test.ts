import { api } from 'src/redux/service';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';

import { libraryCopyLifecycleApi } from './copy-lifecycle-api';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));

const makeStore = () =>
  configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
const identity = { bookId: 'book-id', copyId: 'copy-id' };

it('posts a move by stable copy identity with the original revision, destination and reason', async () => {
  let submitted: unknown;
  mswServer.use(
    http.post(
      'http://library.test/api/library/books/book-id/copies/copy-id/move',
      async ({ request }) => {
        submitted = await request.json();
        return HttpResponse.json({ ...identity, revision: 'revision-2' });
      }
    )
  );
  const body = {
    sectionId: 'section-b',
    shelfId: 'shelf-b',
    reason: 'Reading room transfer',
    revision: 'revision-1',
  };
  const result = await makeStore()
    .dispatch(libraryCopyLifecycleApi.endpoints.moveLibraryCopy.initiate({ ...identity, body }))
    .unwrap();
  expect(submitted).toEqual(body);
  expect(result.revision).toBe('revision-2');
});

it('uses the explicit write-off route and preserves the reason and frozen revision', async () => {
  let submitted: unknown;
  mswServer.use(
    http.post(
      'http://library.test/api/library/books/book-id/copies/copy-id/write-off',
      async ({ request }) => {
        submitted = await request.json();
        return HttpResponse.json({ ...identity, status: 6, revision: 'revision-2' });
      }
    )
  );
  const body = { reason: 'Approved inventory retirement', revision: 'revision-1' };
  const result = await makeStore()
    .dispatch(libraryCopyLifecycleApi.endpoints.writeOffLibraryCopy.initiate({ ...identity, body }))
    .unwrap();
  expect(submitted).toEqual(body);
  expect(result.status).toBe(6);
});

it('requests the actual events page and preserves numeric statuses, timestamps and scoped loan IDs', async () => {
  let requested: string | null = null;
  const event = {
    id: 'event-id',
    sequence: 4,
    ...identity,
    eventType: 'Moved',
    occurredAt: '2026-11-17T08:20:00Z',
    actorId: 'actor-id',
    reason: 'Reading room transfer',
    previousStatus: 0,
    nextStatus: 0,
    fromSectionId: 'section-a',
    fromShelfId: 'shelf-a',
    toSectionId: 'section-b',
    toShelfId: 'shelf-b',
    relatedLoanId: null,
  };
  mswServer.use(
    http.get(
      'http://library.test/api/library/books/book-id/copies/copy-id/events',
      ({ request }) => {
        requested = new URL(request.url).search;
        return HttpResponse.json({
          items: [event],
          totalCount: 7,
          currentPage: 2,
          pageSize: 1,
          totalPages: 7,
        });
      }
    )
  );
  const result = await makeStore()
    .dispatch(
      libraryCopyLifecycleApi.endpoints.getLibraryCopyEvents.initiate({
        ...identity,
        page: 2,
        pageSize: 1,
      })
    )
    .unwrap();
  expect(requested).toBe('?page=2&pageSize=1');
  expect(result.items[0]).toEqual(event);
  expect(result.totalCount).toBe(7);
  expect(result.currentPage).toBe(2);
});
