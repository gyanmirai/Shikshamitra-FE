import React from 'react';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { SavedCopyLabelsDialog } from './SavedCopyLabelsDialog';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('@iconify/react', async (original) => ({
  ...(await original<typeof import('@iconify/react')>()),
  Icon: () => null,
}));
beforeEach(clearCachedAuthSession);

describe('saved copy label printing', () => {
  it('renders validated saved labels outside the dialog scroll ancestors for printing', async () => {
    mswServer.use(
      http.get('http://library.test/api/library/books/book-id/copy-labels', () =>
        HttpResponse.json({
          title: 'Stories',
          labels: [
            {
              copyId: 'copy-id',
              copyNumber: 81,
              accessionNumber: 'ગુજરાતી-૮૧',
              barcodeValue: 'SM-LIB-COPY:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
              sectionName: 'Fiction',
              shelfName: 'Shelf 1',
            },
          ],
        })
      )
    );
    const store = configureStore({
      reducer: { confirmPopup: () => ({ isChanges: false }), [api.reducerPath]: api.reducer },
      middleware: (defaults) => defaults().concat(api.middleware),
    });
    render(
      <Provider store={store}>
        <SavedCopyLabelsDialog open bookId="book-id" onClose={vi.fn()} />
      </Provider>
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Print saved labels' })).toBeEnabled()
    );
    const printRoot = document.getElementById('library-saved-copy-print-root');
    expect(printRoot?.parentElement).toBe(document.body);
    expect(printRoot?.closest('[role="dialog"]')).toBeNull();
    expect(printRoot).toHaveTextContent('ગુજરાતી-૮૧');
    expect(printRoot?.querySelector('svg g rect')).not.toBeNull();
  });
  it('disables printing after a backend failure instead of substituting draft labels', async () => {
    mswServer.use(
      http.get('http://library.test/api/library/books/book-id/copy-labels', () =>
        HttpResponse.json({ detail: 'Unavailable' }, { status: 500 })
      )
    );
    const store = configureStore({
      reducer: { confirmPopup: () => ({ isChanges: true }), [api.reducerPath]: api.reducer },
      middleware: (defaults) => defaults().concat(api.middleware),
    });
    render(
      <Provider store={store}>
        <SavedCopyLabelsDialog open bookId="book-id" onClose={vi.fn()} />
      </Provider>
    );
    expect(
      await screen.findByText('Could not load saved labels. No draft labels will be printed.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Print saved labels' })).toBeDisabled();
  });

  it('blocks unsupported barcode values while preserving the exact human accession', async () => {
    mswServer.use(
      http.get('http://library.test/api/library/books/book-id/copy-labels', () =>
        HttpResponse.json({
          title: 'વાર્તાઓ',
          labels: [
            {
              copyId: 'copy-id',
              copyNumber: 9,
              accessionNumber: 'ગુજરાતી-૯',
              barcodeValue: 'ગુજરાતી-૯',
            },
          ],
        })
      )
    );
    const store = configureStore({
      reducer: { confirmPopup: () => ({ isChanges: false }), [api.reducerPath]: api.reducer },
      middleware: (defaults) => defaults().concat(api.middleware),
    });
    render(
      <Provider store={store}>
        <SavedCopyLabelsDialog open bookId="book-id" onClose={vi.fn()} />
      </Provider>
    );
    expect(await screen.findByText(/Some saved scan values cannot be encoded/)).toBeInTheDocument();
    expect(screen.getByText('ગુજરાતી-૯')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Print saved labels' })).toBeDisabled();
  });
});
