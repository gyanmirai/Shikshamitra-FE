import { useFormik } from 'formik';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import {
  catalogueBook,
  catalogueSchool,
} from 'src/screens/library/settings/catalogue-configuration/catalogue-test-data';
import {
  catalogueTestStore,
  catalogueTestWrapper,
} from 'src/screens/library/settings/catalogue-configuration/catalogue-test-fixture';

import { BookIdentityFields } from './BookIdentityFields';
import { BookClassificationFields } from './BookClassificationFields';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
beforeEach(clearCachedAuthSession);

function Harness() {
  const formik = useFormik({ initialValues: catalogueBook(), onSubmit: () => undefined });
  return (
    <>
      <BookIdentityFields formik={formik} disabled={false} />
      <BookClassificationFields formik={formik} disabled={false} />
      <output data-testid="catalogue-language">{JSON.stringify(formik.values)}</output>
    </>
  );
}

it('uses only editor-owned rules for required markers and actual custom language/material choices', async () => {
  let editorReads = 0;
  const settingsRead = vi.fn(() =>
    HttpResponse.json({ detail: 'Settings denied.' }, { status: 403 })
  );
  mswServer.use(
    http.get('http://library.test/api/library/books/editor-options', ({ request }) => {
      editorReads += 1;
      expect(new URL(request.url).searchParams.get('academicYearId')).toBe('year-id');
      return HttpResponse.json({
        bookCategories: [{ id: 'category-id', name: 'Fiction' }],
        sections: [],
        catalogueConfiguration: { ...catalogueSchool, canManageConfiguration: false },
      });
    }),
    http.get('http://library.test/api/library/catalogue/configuration', settingsRead),
    http.get('http://library.test/api/library/book-categories', settingsRead)
  );
  const store = catalogueTestStore(['Library.AllBooks.View', 'Library.AllBooks.Add']);
  render(<Harness />, { wrapper: catalogueTestWrapper(store) });
  await waitFor(() => expect(editorReads).toBe(1));
  expect(screen.getByRole('textbox', { name: /^Author/ })).not.toBeRequired();
  fireEvent.mouseDown(screen.getByRole('combobox', { name: /^Language/ }));
  fireEvent.click(await screen.findByRole('option', { name: 'Bengali (বাংলা)' }));
  fireEvent.mouseDown(screen.getByRole('combobox', { name: /^Material/ }));
  fireEvent.click(await screen.findByRole('option', { name: 'Picture book' }));
  await waitFor(() =>
    expect(screen.getByTestId('catalogue-language')).toHaveTextContent('"languageCode":"bn"')
  );
  expect(screen.getByTestId('catalogue-language')).toHaveTextContent('"language":null');
  expect(screen.getByTestId('catalogue-language')).toHaveTextContent(
    '"materialCode":"picturebook"'
  );
  expect(settingsRead).not.toHaveBeenCalled();
});
