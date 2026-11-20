import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { libraryReceivingApi } from './receiving-api';

import type { ReceivingInput } from './receiving-types';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
beforeEach(clearCachedAuthSession);
const makeStore = () =>
  configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
const receipt: ReceivingInput = {
  receivedOn: '2026-11-18',
  source: 1,
  sourceName: 'Community library',
  reference: null,
  lines: [
    {
      bookId: 'book-id',
      sectionId: 'section-id',
      shelfId: 'shelf-id',
      quantity: 2,
      unitCost: '9999999999999998.99',
      currency: 'INR',
      accessions: null,
    },
  ],
};

it('posts exact monetary strings and preserves the server preview totals and revision', async () => {
  let sent: unknown;
  mswServer.use(
    http.post('http://library.test/api/library/receiving/preview', async ({ request }) => {
      sent = await request.json();
      return HttpResponse.json({
        canReceive: true,
        revision: 'preview-revision',
        errors: [],
        lines: [],
        knownCostCopyCount: 2,
        unknownCostCopyCount: 0,
        knownTotals: [{ currency: 'INR', amount: '19999999999999997.98' }],
      });
    })
  );
  const store = makeStore();
  const result = await store.dispatch(
    libraryReceivingApi.endpoints.previewReceiving.initiate(receipt)
  );
  expect(result).toMatchObject({
    data: {
      canReceive: true,
      revision: 'preview-revision',
      knownTotals: [{ currency: 'INR', amount: '19999999999999997.98' }],
      errors: [],
    },
  });
  expect(sent).toEqual(receipt);
});

it('posts the exact revision/idempotency envelope to the base route and reads its saved record', async () => {
  const command = { idempotencyKey: 'same-attempt', revision: 'preview-revision', receipt };
  const saved = {
    id: 'receipt-id',
    receivedOn: '2026-11-18',
    source: 1,
    copyCount: 2,
    sourceName: 'Community library',
    reference: null,
    recordedBy: 'actor-id',
    recordedAt: '2026-11-18T04:30:00Z',
    lines: [
      {
        id: 'line-id',
        lineNumber: 1,
        bookId: 'book-id',
        sectionId: 'section-id',
        shelfId: 'shelf-id',
        unitCost: '9999999999999998.99',
        currency: 'INR',
        copies: [
          { copyId: 'new-1', accessionNumber: 'પુસ્તક-૧', copyNumber: 81 },
          { copyId: 'new-2', accessionNumber: 'પુસ્તક-૨', copyNumber: 82 },
        ],
      },
    ],
  };
  let sent: unknown;
  mswServer.use(
    http.post('http://library.test/api/library/receiving', async ({ request }) => {
      sent = await request.json();
      return HttpResponse.json(saved);
    }),
    http.get('http://library.test/api/library/receiving/receipt-id', () => HttpResponse.json(saved))
  );
  const store = makeStore();
  expect(
    await store.dispatch(libraryReceivingApi.endpoints.receiveLibraryStock.initiate(command))
  ).toMatchObject({ data: saved });
  expect(sent).toEqual(command);
  expect(
    await store.dispatch(
      libraryReceivingApi.endpoints.getLibraryStockReceipt.initiate({ id: saved.id })
    )
  ).toMatchObject({ data: saved });
});
