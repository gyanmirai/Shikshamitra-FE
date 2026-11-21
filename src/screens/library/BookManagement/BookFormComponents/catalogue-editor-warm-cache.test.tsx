import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { libraryBookEditorApi } from 'src/redux/library/book-editor-api';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';
import { catalogueSchool } from 'src/screens/library/settings/catalogue-configuration/catalogue-test-data';
import {
  catalogueTestStore,
  catalogueTestWrapper,
} from 'src/screens/library/settings/catalogue-configuration/catalogue-test-fixture';

import { BookEditor } from './BookEditor';
import {
  editorOptions,
  editorSessionValues,
  serveSavedCatalogueBook,
} from './catalogue-editor-session-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
// Only unrelated cover/table presentation is replaced; real Formik, stepper, schemas and requests run.
vi.mock('./BookCoverUpload', () => ({ BookCoverUpload: () => null }));
vi.mock('./BookCopiesTable', () => ({ BookCopiesTable: () => null }));
beforeEach(clearCachedAuthSession);
const makeStore = () => catalogueTestStore(['Library.AllBooks.View', 'Library.AllBooks.Add']);

it('opens from the forced fulfilled options response instead of a warm old revision', async () => {
  const store = makeStore();
  mswServer.use(
    http.get('http://library.test/api/library/books/editor-options', () =>
      HttpResponse.json(
        editorOptions({
          ...catalogueSchool,
          revision: 'OLD',
          requiredFields: ['author', 'language'],
        })
      )
    )
  );
  await store
    .dispatch(
      libraryBookEditorApi.endpoints.getLibraryBookEditorOptions.initiate(
        { academicYearId: 'year-id' },
        { subscribe: false }
      )
    )
    .unwrap();
  let release!: () => void;
  let freshReads = 0;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  mswServer.use(
    http.get('http://library.test/api/library/books/editor-options', async () => {
      freshReads += 1;
      await pending;
      return HttpResponse.json(editorOptions({ ...catalogueSchool, revision: 'NEW' }));
    })
  );
  let sent: Record<string, unknown> | undefined;
  serveSavedCatalogueBook((body) => {
    sent = body;
  });
  render(
    <BookEditor initialValues={editorSessionValues()} academicYearId="year-id" onClose={vi.fn()} />,
    { wrapper: catalogueTestWrapper(store) }
  );
  await waitFor(() => expect(freshReads).toBeGreaterThan(0));
  try {
    expect(
      screen
        .queryAllByRole('button', { name: 'Next' })
        .filter((button) => !(button as HTMLButtonElement).disabled)
    ).toHaveLength(0);
  } finally {
    await act(async () => {
      release();
    });
  }
  await waitFor(() => expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled());
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(await screen.findByText('Copy Locations')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() =>
    expect(sent).toMatchObject({ expectedCatalogueConfigurationRevision: 'NEW' })
  );
});
