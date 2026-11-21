import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { shikshaMitraToast } from 'src/components/toast';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, screen, within, waitFor, fireEvent } from '@testing-library/react';

import {
  deletionId,
  deletionRow,
  deletionBook,
  serveDeletionList,
  renderDeletionCatalogue,
} from './catalogue-delete.fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));
vi.mock('./Components/LIbraryMainScreen', async () => {
  const { useGetAllBooksQuery } = await import('src/redux/library/bookList/bookList-api');
  return {
    default: function CatalogueRows({
      onDelete,
    }: {
      onDelete?: (row: { id: string; title: string }) => void;
    }) {
      const query = useGetAllBooksQuery({ academicYearId: 'year-id', page: 1, pageSize: 20 });
      return (
        <div data-testid="catalogue-rows">
          {query.currentData?.items.map((row: { id: string; title: string }) => (
            <div key={row.id}>
              <span>{row.title}</span>
              <button type="button" disabled={!onDelete} onClick={() => onDelete?.(row)}>
                Delete title from row
              </button>
            </div>
          ))}
        </div>
      );
    },
  };
});
beforeEach(() => {
  clearCachedAuthSession();
  vi.clearAllMocks();
});

it('keeps a failed check safe, retries fresh, and reports deletion only after the real commit', async () => {
  const state = serveDeletionList();
  let reads = 0;
  let deletes = 0;
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  mswServer.use(
    http.get(`http://library.test/api/library/books/${deletionId}`, () => {
      reads += 1;
      return reads === 1
        ? HttpResponse.json({ detail: 'Could not check title deletion.' }, { status: 500 })
        : HttpResponse.json(deletionBook());
    }),
    http.delete(`http://library.test/api/library/books/${deletionId}`, async () => {
      deletes += 1;
      await pending;
      state.exists = false;
      return HttpResponse.json({ id: deletionId, message: 'Book deleted.' });
    })
  );
  renderDeletionCatalogue();
  fireEvent.click(await screen.findByRole('button', { name: 'Delete title from row' }));
  expect(await screen.findByText('Could not check title deletion.')).toBeVisible();
  expect(screen.queryByRole('button', { name: /^Delete$/ })).not.toBeInTheDocument();
  expect(deletes).toBe(0);
  fireEvent.click(screen.getByRole('button', { name: /^Retry(?: check)?$/ }));
  await waitFor(() => expect(reads).toBe(2));
  fireEvent.click(
    within(await screen.findByRole('dialog')).getByRole('button', { name: /^Delete$/ })
  );
  try {
    await waitFor(() => expect(deletes).toBe(1));
    expect(within(screen.getByTestId('catalogue-rows')).getByText(deletionRow.title)).toBeVisible();
    expect(shikshaMitraToast.success).not.toHaveBeenCalled();
    expect(shikshaMitraToast.info).not.toHaveBeenCalled();
  } finally {
    await act(async () => {
      release();
    });
  }
  await waitFor(() => expect(shikshaMitraToast.success).toHaveBeenCalledOnce());
  expect(shikshaMitraToast.success).toHaveBeenCalledWith({ message: 'Book deleted.' });
  await waitFor(() =>
    expect(
      within(screen.getByTestId('catalogue-rows')).queryByText(deletionRow.title)
    ).not.toBeInTheDocument()
  );
});
