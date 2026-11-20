import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';
import { catalogueTestWrapper } from 'src/screens/library/settings/catalogue-configuration/catalogue-test-fixture';

import BookFormStepper from './BookForm';
import {
  revisionBook,
  revisionBookId,
  revisionResult,
  readRevisionBook,
  revisionEditorOptions,
} from './catalogue-revision.fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('./BookCoverUpload', () => ({ BookCoverUpload: () => null }));
vi.mock('./BookCopiesTable', () => ({ BookCopiesTable: () => null }));
beforeEach(clearCachedAuthSession);

it('blocks a warm old detail snapshot until its explicit fresh opening read fulfills', async () => {
  const old = revisionBook();
  mswServer.use(
    http.get(`http://library.test/api/library/books/${revisionBookId}`, () =>
      HttpResponse.json(old)
    )
  );
  const { source, store } = await readRevisionBook();
  expect(source.metadataRevision).toBe('metadata-1');
  const fresh = {
    ...old,
    title: 'Fresh saved title',
    metadataRevision: 'metadata-2',
    copiesRevision: 'copies-2',
  };
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  let reads = 0;
  let sent: Record<string, unknown> | undefined;
  mswServer.use(
    http.get(`http://library.test/api/library/books/${revisionBookId}`, async () => {
      reads += 1;
      await pending;
      return HttpResponse.json(fresh);
    }),
    http.get('http://library.test/api/library/books/editor-options', () =>
      HttpResponse.json(revisionEditorOptions(fresh))
    ),
    http.get('https://openlibrary.org/search.json', () => HttpResponse.json({ docs: [] })),
    http.put(`http://library.test/api/library/books/${revisionBookId}`, async ({ request }) => {
      sent = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json(revisionResult({ ...fresh, metadataRevision: 'metadata-3' }));
    })
  );
  render(<BookFormStepper editData={source} onClose={vi.fn()} />, {
    wrapper: catalogueTestWrapper(store),
  });
  await waitFor(() => expect(reads).toBe(1));
  try {
    expect(screen.getByRole('progressbar', { name: 'Loading book details' })).toBeVisible();
    expect(
      screen
        .queryAllByRole('button', { name: /Save.*next|Submit/i })
        .filter((button) => !(button as HTMLButtonElement).disabled)
    ).toHaveLength(0);
  } finally {
    await act(async () => {
      release();
    });
  }
  expect(await screen.findByRole('combobox', { name: /^Title/i })).toHaveValue('Fresh saved title');
  fireEvent.change(screen.getByRole('textbox', { name: /^Publisher/i }), {
    target: { value: 'Reviewed fresh publisher' },
  });
  fireEvent.click(screen.getByRole('button', { name: /^Save$/ }));
  await waitFor(() =>
    expect(sent).toMatchObject({
      expectedMetadataRevision: 'metadata-2',
      title: 'Fresh saved title',
    })
  );
});
