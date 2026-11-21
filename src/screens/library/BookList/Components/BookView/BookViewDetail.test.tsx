import React from 'react';
import { api } from 'src/redux/service';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { libraryModuleType } from 'src/redux/tagTypes';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import BookViewDetail from './BookViewDetail';
import { statusCopy, makeStatusTestWrapper } from '../../../circulation/copy-status-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('./BookBasicDetails', () => ({
  default: ({ book }: { book?: { title?: string } }) => <span>{book?.title}</span>,
}));
vi.mock('./BookCopyCard', () => ({
  default: ({ onInventoryActions }: { onInventoryActions?: () => void }) => (
    <button type="button" onClick={onInventoryActions}>Inventory actions</button>
  ),
}));
vi.mock('../../../circulation/CopyLifecycleDialogs', () => ({
  CopyLifecycleDialogs: () => <input aria-label="Open move draft" defaultValue="" />,
}));
const callbacks = {
  handleChangeStatus: vi.fn(),
  handleIssueBook: vi.fn(),
  handleReturnBook: vi.fn(),
  handleBookHistory: vi.fn(),
};

it('keeps an open copy action draft mounted through refresh and removal from current rows', async () => {
  let reads = 0;
  let release: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  mswServer.use(
    http.get('http://library.test/api/library/books/book-id', async () => {
      reads += 1;
      if (reads > 1) await pending;
      return HttpResponse.json({
        ...statusCopy.book,
        copies:
          reads === 1
            ? [{ copyId: 'copy-id', copyNumber: 1, accessionNumber: 'SCHOOL/1', status: 0 }]
            : [],
      });
    })
  );
  const { store, wrapper } = makeStatusTestWrapper();
  render(<BookViewDetail book={statusCopy.book} {...callbacks} />, { wrapper });
  fireEvent.click(await screen.findByRole('button', { name: 'Inventory actions' }));
  fireEvent.change(screen.getByLabelText('Open move draft'), {
    target: { value: 'Keep this reason' },
  });
  act(() => {
    store.dispatch(api.util.invalidateTags([libraryModuleType.books]));
  });
  await waitFor(() => expect(reads).toBe(2));
  expect(screen.getByLabelText('Open move draft')).toHaveValue('Keep this reason');
  await act(async () => {
    release?.();
    await pending;
  });
  await waitFor(() =>
    expect(screen.queryByRole('button', { name: 'Inventory actions' })).not.toBeInTheDocument()
  );
  expect(screen.getByLabelText('Open move draft')).toHaveValue('Keep this reason');
});

it('hides the previous book immediately when the requested book identity changes', async () => {
  let release: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  mswServer.use(
    http.get('http://library.test/api/library/books/:bookId', async ({ params }) => {
      if (params.bookId === 'other-book') await pending;
      return HttpResponse.json({
        ...statusCopy.book,
        id: params.bookId,
        title: params.bookId === 'book-id' ? 'First saved title' : 'Second saved title',
        copies: [],
      });
    })
  );
  const { wrapper } = makeStatusTestWrapper();
  const { rerender } = render(<BookViewDetail book={statusCopy.book} {...callbacks} />, {
    wrapper,
  });
  await screen.findByText('First saved title');
  rerender(<BookViewDetail book={{ ...statusCopy.book, id: 'other-book' }} {...callbacks} />);
  expect(screen.queryByText('First saved title')).not.toBeInTheDocument();
  await act(async () => {
    release?.();
    await pending;
  });
  expect(await screen.findByText('Second saved title')).toBeInTheDocument();
});
