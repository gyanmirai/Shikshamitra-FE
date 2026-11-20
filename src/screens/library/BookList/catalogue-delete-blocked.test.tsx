import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, screen, within, waitFor, fireEvent } from '@testing-library/react';

import {
  deletionId,
  deletionRow,
  deletionBook,
  deletionStore,
  serveDeletionList,
  warmDeletionDetail,
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

it('checks fresh title eligibility before confirmation despite a warm previously allowed detail', async () => {
  serveDeletionList();
  const store = deletionStore();
  mswServer.use(
    http.get(`http://library.test/api/library/books/${deletionId}`, () =>
      HttpResponse.json(deletionBook())
    )
  );
  expect((await warmDeletionDetail(store)).canDelete).toBe(true);
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  let reads = 0;
  let deletes = 0;
  const reason = 'This title has retained receiving history and cannot be deleted.';
  mswServer.use(
    http.get(`http://library.test/api/library/books/${deletionId}`, async () => {
      reads += 1;
      await pending;
      return HttpResponse.json({
        ...deletionBook(),
        canDelete: false,
        deletionBlockedReason: reason,
      });
    }),
    http.delete(`http://library.test/api/library/books/${deletionId}`, () => {
      deletes += 1;
      return HttpResponse.json({});
    })
  );
  renderDeletionCatalogue(store);
  fireEvent.click(await screen.findByRole('button', { name: 'Delete title from row' }));
  try {
    await waitFor(() => expect(reads).toBe(1));
    expect(screen.getByRole('progressbar', { name: 'Checking title deletion' })).toBeVisible();
    expect(screen.queryByRole('button', { name: /^Delete$/ })).not.toBeInTheDocument();
  } finally {
    await act(async () => {
      release();
    });
  }
  expect(await screen.findByText(reason)).toBeVisible();
  expect(within(screen.getByTestId('catalogue-rows')).getByText(deletionRow.title)).toBeVisible();
  expect(deletes).toBe(0);
});
