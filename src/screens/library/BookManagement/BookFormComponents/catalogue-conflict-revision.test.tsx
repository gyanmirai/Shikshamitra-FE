import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, waitFor, renderHook } from '@testing-library/react';
import { useGetBookByIdQuery } from 'src/redux/library/bookList/bookList-api';
import { catalogueDefaults } from 'src/screens/library/settings/catalogue-configuration/catalogue-test-data';
import { catalogueTestWrapper } from 'src/screens/library/settings/catalogue-configuration/catalogue-test-fixture';

import { useBookEditor } from './useBookEditor';
import { getInitialBookData } from '../Components/BookManageInitialValues';
import { revisionBook, revisionBookId, readRevisionBook } from './catalogue-revision.fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
beforeEach(clearCachedAuthSession);

it('retains a409 draft and its original token after an actual fulfilled background detail refresh', async () => {
  let saved = revisionBook();
  const writes: Record<string, unknown>[] = [];
  mswServer.use(
    http.get(`http://library.test/api/library/books/${revisionBookId}`, () =>
      HttpResponse.json(saved)
    ),
    http.put(`http://library.test/api/library/books/${revisionBookId}`, async ({ request }) => {
      writes.push((await request.json()) as Record<string, unknown>);
      return HttpResponse.json(
        { status: 409, detail: 'The catalogue changed. Reload and review.' },
        { status: 409 }
      );
    })
  );
  const { source, store } = await readRevisionBook();
  expect(source.metadataRevision).toBe('metadata-1');
  const editor = renderHook(
    () => {
      const query = useGetBookByIdQuery({ bookId: revisionBookId });
      const state = useBookEditor(
        getInitialBookData(query.currentData || source),
        'year-id',
        false,
        true,
        () => undefined,
        catalogueDefaults
      );
      return {
        ...state,
        refresh: query.refetch,
        loadedRevision: query.currentData?.metadataRevision,
      };
    },
    { wrapper: catalogueTestWrapper(store) }
  );
  await act(async () => {
    await editor.result.current.formik.setFieldValue('publisher', 'Retained librarian draft');
  });
  await act(async () => {
    await editor.result.current.saveCurrent(editor.result.current.formik.values, false);
  });
  expect(writes).toHaveLength(1);
  expect(editor.result.current.error).toMatch(/catalogue changed/);
  saved = {
    ...saved,
    publisher: 'Other operators saved publisher',
    metadataRevision: 'metadata-2',
  };
  await act(async () => {
    await editor.result.current.refresh().unwrap();
  });
  await waitFor(() => expect(editor.result.current.loadedRevision).toBe('metadata-2'));
  expect(editor.result.current.formik.values.publisher).toBe('Retained librarian draft');
  expect(editor.result.current.formik.dirty).toBe(true);
  expect(writes).toHaveLength(1);
  await act(async () => {
    await editor.result.current.saveCurrent(editor.result.current.formik.values, false);
  });
  expect(writes).toHaveLength(2);
  expect(writes.map((body) => body.expectedMetadataRevision)).toEqual(['metadata-1', 'metadata-1']);
  expect(editor.result.current.formik.values.publisher).toBe('Retained librarian draft');
});
