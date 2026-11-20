import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { booksApi } from './bookList/bookList-api';
import { issueAndReturnApi } from './issueAndReturnApi/issueAndReturnApi';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
beforeEach(clearCachedAuthSession);

const cleanupStores: (() => void)[] = [];
afterEach(() => {
  cleanupStores.forEach((cleanup) => cleanup());
  cleanupStores.length = 0;
});

function setup() {
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  cleanupStores.push(() => store.dispatch(api.util.resetApiState()));
  return store;
}

const accession = 'પુસ્તક/2026 #1?A+B';

it('sends the full accession as a query value when looking up a book', async () => {
  mswServer.use(
    http.get('http://library.test/api/library/books/accession', ({ request }) => {
      expect(new URL(request.url).searchParams.get('accessionNo')).toBe(accession);
      return HttpResponse.json({ accessionNo: accession });
    })
  );
  const store = setup();

  const result = await store
    .dispatch(
      issueAndReturnApi.endpoints.getBookDetailsByAccession.initiate({ accessionNo: accession })
    )
    .unwrap();

  expect(result.accessionNo).toBe(accession);
  store.dispatch(api.util.resetApiState());
});

it('keeps accession punctuation intact when looking up the issued member', async () => {
  mswServer.use(
    http.get('http://library.test/api/library/issuedBook/member', ({ request }) => {
      expect(new URL(request.url).searchParams.get('accessionNo')).toBe(accession);
      return HttpResponse.json({ id: 'actual-member' });
    })
  );
  const store = setup();

  const result = await store
    .dispatch(
      issueAndReturnApi.endpoints.getMemberDetailsByAccession.initiate({ accessionNo: accession })
    )
    .unwrap();

  expect(result.id).toBe('actual-member');
  store.dispatch(api.util.resetApiState());
});

it('sends copy condition changes without treating an accession as URL syntax', async () => {
  mswServer.use(
    http.put('http://library.test/api/library/books/book-id/copies/status', async ({ request }) => {
      expect(new URL(request.url).searchParams.get('accessionNumber')).toBe(accession);
      expect(await request.json()).toEqual({ status: 3, remarks: 'Cover torn' });
      return HttpResponse.json({ id: 'copy-id' });
    })
  );
  const store = setup();

  const result = await store
    .dispatch(
      booksApi.endpoints.updateBookCopyStatus.initiate({
        bookId: 'book-id',
        accessionNumber: accession,
        body: { status: 3, remarks: 'Cover torn' },
      })
    )
    .unwrap();

  expect(result.id).toBe('copy-id');
  store.dispatch(api.util.resetApiState());
});
