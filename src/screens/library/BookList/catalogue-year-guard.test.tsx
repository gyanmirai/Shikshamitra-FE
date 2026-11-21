import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { guardAcademicContextChange } from 'src/hooks/academic-context-change';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';
import { catalogueSchool } from 'src/screens/library/settings/catalogue-configuration/catalogue-test-data';
import {
  catalogueTestStore,
  catalogueTestWrapper,
} from 'src/screens/library/settings/catalogue-configuration/catalogue-test-fixture';

import BookList from './index';
import { editorOptions } from '../BookManagement/BookFormComponents/catalogue-editor-session-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('./Components/LIbraryMainScreen', () => ({ default: () => null }));
vi.mock('../BookManagement/BookFormComponents/BookCoverUpload', () => ({
  BookCoverUpload: () => null,
}));
beforeEach(clearCachedAuthSession);

it('keeps the actual catalogue draft/year when its existing context guard declines a year change', async () => {
  mswServer.use(
    http.get('http://library.test/api/library/books/editor-options', () =>
      HttpResponse.json(editorOptions(catalogueSchool))
    ),
    http.get('https://openlibrary.org/search.json', () => HttpResponse.json({ docs: [] }))
  );
  const store = catalogueTestStore(['Library.AllBooks.View', 'Library.AllBooks.Add']);
  render(<BookList />, { wrapper: catalogueTestWrapper(store) });
  fireEvent.click(screen.getByRole('button', { name: 'Book' }));
  const title = await screen.findByRole('combobox', { name: /^Title/ });
  await waitFor(() => expect(title).toBeEnabled());
  fireEvent.change(title, { target: { value: 'Retained title draft' } });
  await waitFor(() => expect(store.getState().confirmPopup.isChanges).toBe(true));
  const proceed = vi.fn();
  let intercepted = false;
  act(() => {
    intercepted = guardAcademicContextChange(proceed);
  });
  expect(intercepted).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(proceed).not.toHaveBeenCalled();
  expect(screen.getByRole('combobox', { name: /^Title/ })).toHaveValue('Retained title draft');
  expect(store.getState().globalState.currentYear.id).toBe('year-id');
});
