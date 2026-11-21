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
import { editorOptions, editorSessionValues } from './catalogue-editor-session-fixture';

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

it('keeps the opened rule and entered fields when real background options return another revision', async () => {
  const store = makeStore();
  let revision = 'OPENED';
  mswServer.use(
    http.get('http://library.test/api/library/books/editor-options', () =>
      HttpResponse.json(
        editorOptions({
          ...catalogueSchool,
          revision,
          requiredFields: revision === 'OPENED' ? ['language'] : ['author', 'language'],
        })
      )
    )
  );
  render(
    <BookEditor initialValues={editorSessionValues()} academicYearId="year-id" onClose={vi.fn()} />,
    { wrapper: catalogueTestWrapper(store) }
  );
  const author = await screen.findByRole('textbox', { name: /^Author/ });
  await waitFor(() => expect(author).not.toBeRequired());
  fireEvent.change(screen.getByRole('textbox', { name: /^Publisher/ }), {
    target: { value: 'Retained publisher draft' },
  });
  revision = 'BACKGROUND';
  await act(async () => {
    await store
      .dispatch(
        libraryBookEditorApi.endpoints.getLibraryBookEditorOptions.initiate(
          { academicYearId: 'year-id' },
          { subscribe: false, forceRefetch: true }
        )
      )
      .unwrap();
  });
  expect(screen.getByRole('textbox', { name: /^Publisher/ })).toHaveValue(
    'Retained publisher draft'
  );
  expect(screen.getByRole('textbox', { name: /^Author/ })).not.toBeRequired();
});

it('uses the same school rules in the actual stepper validation as its required marker', async () => {
  mswServer.use(
    http.get('http://library.test/api/library/books/editor-options', () =>
      HttpResponse.json(editorOptions(catalogueSchool))
    )
  );
  render(
    <BookEditor
      initialValues={{ ...editorSessionValues(), author: '' }}
      academicYearId="year-id"
      onClose={vi.fn()}
    />,
    { wrapper: catalogueTestWrapper(makeStore()) }
  );
  await waitFor(() => expect(screen.getByRole('textbox', { name: /^Author/ })).not.toBeRequired());
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(await screen.findByText('Copy Locations')).toBeVisible();
});
