import type { PropsWithChildren } from 'react';
import type { ReceivingInput } from 'src/redux/library/receiving-types';

import dayjs from 'dayjs';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { configureStore } from '@reduxjs/toolkit';

import { createReceivingValues } from './receiving-form';

export function validReceivingDraft() {
  const draft = createReceivingValues();
  draft.receivedOn = dayjs('2026-11-18');
  draft.source = 1;
  Object.assign(draft.lines[0], {
    book: { id: 'book-id', title: 'Stories' },
    sectionId: 'section-id',
    shelfId: 'shelf-id',
    quantity: '2',
    costKnown: true,
    unitCost: '9999999999999998.99',
    currency: 'INR',
  });
  return draft;
}
export const receivingPreview = {
  canReceive: true,
  revision: 'revision-A',
  errors: [],
  knownCostCopyCount: 2,
  unknownCostCopyCount: 0,
  knownTotals: [{ currency: 'INR', amount: '19999999999999997.98' }],
  lines: [
    {
      lineIndex: 0,
      bookId: 'book-id',
      bookTitle: 'Stories',
      sectionId: 'section-id',
      sectionName: 'Fiction',
      shelfId: 'shelf-id',
      shelfName: 'Shelf 1',
      quantity: 2,
      unitCost: '9999999999999998.99',
      currency: 'INR',
    },
  ],
};
export const savedReceiving = {
  id: 'receipt-id',
  receivedOn: '2026-11-18',
  source: 1,
  sourceName: null,
  reference: null,
  recordedBy: 'actor-id',
  recordedAt: '2026-11-18T04:30:00Z',
  copyCount: 2,
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
export function receivingWrapper(canReceive = true) {
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      auth: () => ({
        permissionsInitialized: true,
        loading: false,
        permissions: [
          'ShikshaMitra.Module.Library',
          'Library.AllBooks.View',
          'Library.Receiving.View',
          ...(canReceive ? ['Library.Receiving.Add'] : []),
        ].map((name) => ({ name, isGranted: true })),
      }),
      globalState: () => ({ currentYear: { id: 'year-id' } }),
      confirmPopup: () => ({ isChanges: false }),
    },
    middleware: (defaults) => defaults({ serializableCheck: false }).concat(api.middleware),
  });
  return ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>;
}
export function previewInput(body: ReceivingInput) {
  return {
    ...receivingPreview,
    lines: receivingPreview.lines.map((line) => ({
      ...line,
      bookId: body.lines[0].bookId,
    })),
  };
}
