import React from 'react';
import { api } from 'src/redux/service';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { libraryModuleType } from 'src/redux/tagTypes';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import { CopyWriteOffDialog } from './CopyWriteOffDialog';
import { copyIdentity } from './copy-command-test-fixtures';
import { statusState, makeStatusTestWrapper } from './copy-status-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('@iconify/react', async (original) => ({
  ...(await original<typeof import('@iconify/react')>()),
  Icon: () => null,
}));

it('locks the decision while saving and retains reason and frozen revision after conflict', async () => {
  let reads = 0;
  let posts = 0;
  let submitted: unknown;
  let release: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  mswServer.use(
    http.get('http://library.test/api/library/books/book-id/copies/copy-id/state', () => {
      reads += 1;
      return HttpResponse.json({
        ...statusState,
        canWriteOff: true,
        revision: reads === 1 ? 'revision-1' : 'revision-2',
      });
    }),
    http.post(
      'http://library.test/api/library/books/book-id/copies/copy-id/write-off',
      async ({ request }) => {
        posts += 1;
        submitted = await request.json();
        await pending;
        return HttpResponse.json(
          { detail: 'This copy changed. Review its current state.' },
          { status: 409 }
        );
      }
    )
  );
  const { store, wrapper } = makeStatusTestWrapper(['View', 'Delete']);
  const onClose = vi.fn();
  render(<CopyWriteOffDialog {...copyIdentity} onClose={onClose} />, { wrapper });
  await waitFor(() => expect(screen.getByLabelText(/^Reason/)).toBeEnabled());
  fireEvent.change(screen.getByLabelText(/^Reason/), {
    target: { value: 'Retain this approved reason' },
  });
  act(() => {
    store.dispatch(api.util.invalidateTags([libraryModuleType.copies]));
  });
  await waitFor(() =>
    expect(
      Object.values(store.getState()[api.reducerPath].queries).some(
        (query) => (query?.data as { revision?: string })?.revision === 'revision-2'
      )
    ).toBe(true)
  );
  const submit = screen.getByRole('button', { name: 'Write off copy' });
  fireEvent.click(submit);
  fireEvent.click(submit);
  await waitFor(() => expect(posts).toBe(1));
  expect(screen.getByLabelText(/^Reason/)).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
  expect(onClose).not.toHaveBeenCalled();
  await act(async () => {
    release?.();
    await pending;
  });
  await screen.findByText(/This copy changed/);
  expect(submitted).toEqual({ reason: 'Retain this approved reason', revision: 'revision-1' });
  expect(screen.getByLabelText(/^Reason/)).toHaveValue('Retain this approved reason');
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Keep editing' }));
  expect(screen.getByLabelText(/^Reason/)).toHaveValue('Retain this approved reason');
  expect(onClose).not.toHaveBeenCalled();
});

it('blocks a forbidden write-off even when the actor has delete permission', async () => {
  mswServer.use(
    http.get('http://library.test/api/library/books/book-id/copies/copy-id/state', () =>
      HttpResponse.json({ ...statusState, canWriteOff: false })
    )
  );
  render(
    <CopyWriteOffDialog {...copyIdentity} onClose={vi.fn()} />,
    makeStatusTestWrapper(['View', 'Delete'])
  );
  await screen.findByText(/This copy cannot be written off/);
  expect(screen.getByRole('button', { name: 'Write off copy' })).toBeDisabled();
  expect(screen.getByLabelText(/^Reason/)).toBeDisabled();
});

it('requires a recorded reason before sending the destructive decision', async () => {
  const save = vi.fn(() => HttpResponse.json({ ...statusState, status: 6 }));
  mswServer.use(
    http.get('http://library.test/api/library/books/book-id/copies/copy-id/state', () =>
      HttpResponse.json({ ...statusState, canWriteOff: true })
    ),
    http.post('http://library.test/api/library/books/book-id/copies/copy-id/write-off', save)
  );
  render(
    <CopyWriteOffDialog {...copyIdentity} onClose={vi.fn()} />,
    makeStatusTestWrapper(['View', 'Delete'])
  );
  await waitFor(() => expect(screen.getByRole('button', { name: 'Write off copy' })).toBeEnabled());
  fireEvent.click(screen.getByRole('button', { name: 'Write off copy' }));
  expect(await screen.findByText('Explain the reason for this write-off')).toBeInTheDocument();
  expect(save).not.toHaveBeenCalled();
});
