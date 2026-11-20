import React from 'react';
import { api } from 'src/redux/service';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { libraryModuleType } from 'src/redux/tagTypes';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import { CopyMoveDialog } from './CopyMoveDialog';
import { makeStatusTestWrapper } from './copy-status-test-fixture';
import { moveOptions, copyIdentity } from './copy-command-test-fixtures';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('@iconify/react', async (original) => ({
  ...(await original<typeof import('@iconify/react')>()),
  Icon: () => null,
}));

it('retains the selected destination, reason and opening revision after refresh and conflict', async () => {
  let reads = 0;
  let submitted: unknown;
  mswServer.use(
    http.get('http://library.test/api/library/books/book-id/copies/copy-id/move-options', () => {
      reads += 1;
      return HttpResponse.json(
        reads === 1
          ? moveOptions
          : {
              ...moveOptions,
              state: {
                ...moveOptions.state,
                revision: 'revision-2',
                sectionId: 'section-b',
                shelfId: 'shelf-b',
              },
            }
      );
    }),
    http.post(
      'http://library.test/api/library/books/book-id/copies/copy-id/move',
      async ({ request }) => {
        submitted = await request.json();
        return HttpResponse.json(
          { detail: 'The copy moved in another session. Reload and review.' },
          { status: 409 }
        );
      }
    )
  );
  const { store, wrapper } = makeStatusTestWrapper();
  const onClose = vi.fn();
  render(<CopyMoveDialog {...copyIdentity} onClose={onClose} />, { wrapper });
  await waitFor(() => expect(screen.getByLabelText(/^Reason/)).toBeEnabled());
  fireEvent.mouseDown(screen.getByRole('combobox', { name: /Destination section/ }));
  fireEvent.click(screen.getByRole('option', { name: 'Reference room' }));
  fireEvent.mouseDown(screen.getByRole('combobox', { name: /Destination shelf/ }));
  fireEvent.click(screen.getByRole('option', { name: 'Shelf B' }));
  fireEvent.change(screen.getByLabelText(/^Reason/), {
    target: { value: 'Preserve this transfer reason' },
  });
  act(() => {
    store.dispatch(api.util.invalidateTags([libraryModuleType.copies]));
  });
  await waitFor(() =>
    expect(
      Object.values(store.getState()[api.reducerPath].queries).some(
        (query) =>
          (query?.data as { state?: { revision?: string } })?.state?.revision === 'revision-2'
      )
    ).toBe(true)
  );
  fireEvent.click(screen.getByRole('button', { name: 'Move copy' }));
  expect(await screen.findByText(/The copy moved in another session/)).toBeInTheDocument();
  expect(submitted).toEqual({
    sectionId: 'section-b',
    shelfId: 'shelf-b',
    reason: 'Preserve this transfer reason',
    revision: 'revision-1',
  });
  expect(screen.getByLabelText(/^Reason/)).toHaveValue('Preserve this transfer reason');
  expect(onClose).not.toHaveBeenCalled();
});

it('does not enable a move when server authority blocks it despite update permission', async () => {
  mswServer.use(
    http.get('http://library.test/api/library/books/book-id/copies/copy-id/move-options', () =>
      HttpResponse.json({
        ...moveOptions,
        state: { ...moveOptions.state, canMove: false },
        sections: [],
      })
    )
  );
  render(<CopyMoveDialog {...copyIdentity} onClose={vi.fn()} />, makeStatusTestWrapper());
  await screen.findByText(/This copy cannot be moved/);
  expect(screen.getByLabelText(/^Reason/)).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Move copy' })).toBeDisabled();
});

it('offers retry without inventing destinations after the feature lookup fails', async () => {
  let reads = 0;
  mswServer.use(
    http.get('http://library.test/api/library/books/book-id/copies/copy-id/move-options', () => {
      reads += 1;
      return reads === 1
        ? HttpResponse.json({ detail: 'Unavailable' }, { status: 503 })
        : HttpResponse.json(moveOptions);
    })
  );
  render(<CopyMoveDialog {...copyIdentity} onClose={vi.fn()} />, makeStatusTestWrapper());
  await screen.findByText(/Could not load the current copy state and move destinations/);
  expect(screen.getByRole('button', { name: 'Move copy' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  await waitFor(() => expect(screen.getByLabelText(/^Reason/)).toBeEnabled());
  expect(reads).toBe(2);
});
