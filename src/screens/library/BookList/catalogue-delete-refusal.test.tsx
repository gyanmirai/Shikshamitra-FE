import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { shikshaMitraToast } from 'src/components/toast';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { screen, within, waitFor, fireEvent } from '@testing-library/react';

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

it('permits Delete without Update but retains the row and real late-command error without early success', async () => {
  serveDeletionList();
  const allowed = deletionBook();
  expect(allowed.canDelete).toBe(true);
  expect(allowed.copies[0].canRemove).toBe(false);
  let reads = 0;
  let deletes = 0;
  const reason = 'A receiving record was added. This title cannot be deleted.';
  mswServer.use(
    http.get(`http://library.test/api/library/books/${deletionId}`, () => {
      reads += 1;
      return HttpResponse.json(allowed);
    }),
    http.delete(`http://library.test/api/library/books/${deletionId}`, () => {
      deletes += 1;
      return HttpResponse.json({ status: 400, detail: reason }, { status: 400 });
    })
  );
  renderDeletionCatalogue();
  fireEvent.click(await screen.findByRole('button', { name: 'Delete title from row' }));
  await waitFor(() => expect(reads).toBe(1));
  const dialog = await screen.findByRole('dialog');
  fireEvent.click(within(dialog).getByRole('button', { name: /^Delete$/ }));
  await waitFor(() => expect(deletes).toBe(1));
  expect(await screen.findByText(reason)).toBeVisible();
  expect(within(screen.getByTestId('catalogue-rows')).getByText(deletionRow.title)).toBeVisible();
  expect(shikshaMitraToast.success).not.toHaveBeenCalled();
  expect(shikshaMitraToast.info).not.toHaveBeenCalled();
});
