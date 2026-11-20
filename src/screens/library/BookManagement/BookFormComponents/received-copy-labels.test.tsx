import type { ComponentType, ComponentProps } from 'react';

import React from 'react';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, beforeEach } from 'vitest';
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

const ScopedLabels: ComponentType<
  ComponentProps<typeof SavedCopyLabelsDialog> & {
    copyIds: string[];
  }
> = SavedCopyLabelsDialog;

function openLabels(copyIds: string[]) {
  const store = configureStore({
    reducer: { confirmPopup: () => ({ isChanges: false }), [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  render(
    <Provider store={store}>
      <ScopedLabels open bookId="book-id" copyIds={copyIds} onClose={vi.fn()} />
    </Provider>
  );
}

function savedLabels(ids: string[]) {
  mswServer.use(
    http.get('http://library.test/api/library/books/book-id/copy-labels', () =>
      HttpResponse.json({
        title: 'Stories',
        labels: ids.map((id, index) => ({
          copyId: id,
          copyNumber: index + 1,
          accessionNumber: `ACCESSION-${id}`,
          barcodeValue: `SCAN-${id}`,
          sectionName: 'Fiction',
          shelfName: 'Shelf 1',
        })),
      })
    )
  );
}

it('prints only actual new receipt copy IDs when the title already has other saved copies', async () => {
  savedLabels(['old-copy', 'new-copy-1', 'new-copy-2']);
  openLabels(['new-copy-1', 'new-copy-2']);
  await waitFor(() =>
    expect(
      screen.getByRole('button', {
        name: 'Print saved labels',
      })
    ).toBeEnabled()
  );
  const printRoot = document.getElementById('library-saved-copy-print-root');
  expect(printRoot).toHaveTextContent('ACCESSION-new-copy-1');
  expect(printRoot).toHaveTextContent('ACCESSION-new-copy-2');
  expect(printRoot).not.toHaveTextContent('ACCESSION-old-copy');
});

it('blocks printing if any receipt copy ID is missing from persisted label results', async () => {
  savedLabels(['old-copy', 'new-copy-1']);
  openLabels(['new-copy-1', 'missing-copy']);
  expect(
    await screen.findByText(/Some received copies are missing from saved label results/)
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Print saved labels' })).toBeDisabled();
  expect(document.getElementById('library-saved-copy-print-root')).toBeNull();
});

it('never expands an explicitly empty receipt copy selection to all title labels', async () => {
  savedLabels(['old-copy']);
  openLabels([]);
  expect(
    await screen.findByText('No received copies were selected for printing.')
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Print saved labels' })).toBeDisabled();
  expect(document.getElementById('library-saved-copy-print-root')).toBeNull();
});
