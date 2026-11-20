import { api } from 'src/redux/service';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';

import { booksApi } from './bookList/bookList-api';
import { libraryCopyLifecycleApi } from './copy-lifecycle-api';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));

it.each(['move', 'write-off'] as const)(
  'refreshes subscribed copy state, events and book detail after %s',
  async (action) => {
    const calls = { state: 0, events: 0, book: 0 };
    let revision = 'revision-1';
    mswServer.use(
      http.get('http://library.test/api/library/books/book-id/copies/copy-id/state', () => {
        calls.state += 1;
        return HttpResponse.json({ revision });
      }),
      http.get('http://library.test/api/library/books/book-id/copies/copy-id/events', () => {
        calls.events += 1;
        return HttpResponse.json({
          items: [],
          totalCount: 0,
          currentPage: 1,
          pageSize: 20,
          totalPages: 0,
        });
      }),
      http.get('http://library.test/api/library/books/book-id', () => {
        calls.book += 1;
        return HttpResponse.json({ id: 'book-id', title: 'Stories', copies: [] });
      }),
      http.post(`http://library.test/api/library/books/book-id/copies/copy-id/${action}`, () => {
        revision = 'revision-2';
        return HttpResponse.json({ revision });
      })
    );
    const store = configureStore({
      reducer: { [api.reducerPath]: api.reducer },
      middleware: (defaults) => defaults().concat(api.middleware),
    });
    const identity = { bookId: 'book-id', copyId: 'copy-id' };
    const subscriptions = [
      store.dispatch(libraryCopyLifecycleApi.endpoints.getLibraryCopyState.initiate(identity)),
      store.dispatch(
        libraryCopyLifecycleApi.endpoints.getLibraryCopyEvents.initiate({
          ...identity,
          page: 1,
          pageSize: 20,
        })
      ),
      store.dispatch(booksApi.endpoints.viewBookDetails.initiate({ bookId: 'book-id' })),
    ];
    try {
      await Promise.all(subscriptions.map((subscription) => subscription.unwrap()));
      const body = { reason: 'Approved inventory change', revision: 'revision-1' };
      if (action === 'move')
        await store
          .dispatch(
            libraryCopyLifecycleApi.endpoints.moveLibraryCopy.initiate({
              ...identity,
              body: { ...body, sectionId: 'section-b', shelfId: 'shelf-b' },
            })
          )
          .unwrap();
      else
        await store
          .dispatch(
            libraryCopyLifecycleApi.endpoints.writeOffLibraryCopy.initiate({ ...identity, body })
          )
          .unwrap();
      await waitFor(() => expect(calls).toEqual({ state: 2, events: 2, book: 2 }));
      await waitFor(() =>
        expect(
          libraryCopyLifecycleApi.endpoints.getLibraryCopyState.select(identity)(store.getState())
            .data?.revision
        ).toBe('revision-2')
      );
    } finally {
      subscriptions.forEach((subscription) => subscription.unsubscribe());
    }
  }
);
