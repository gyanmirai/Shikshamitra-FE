import { it, vi, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  catalogueTestStore,
  catalogueTestWrapper,
} from 'src/screens/library/settings/catalogue-configuration/catalogue-test-fixture';

import BookList from './index';
import { deletionRow, serveDeletionList } from './catalogue-delete.fixture';

const navigation = vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
  return { view: 'list' };
});

vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('next/navigation', () => ({
  usePathname: () => '/library/book-list',
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams({ view: navigation.view }),
}));

beforeEach(() => {
  clearCachedAuthSession();
  serveDeletionList();
});

it.each([
  { view: 'list', grant: undefined, add: false, edit: false },
  { view: 'cover', grant: undefined, add: false, edit: false },
  { view: 'summary', grant: undefined, add: false, edit: false },
  { view: 'list', grant: 'Library.AllBooks.Add', add: true, edit: false },
  { view: 'list', grant: 'Library.AllBooks.Update', add: false, edit: true },
  { view: 'cover', grant: 'Library.AllBooks.Update', add: false, edit: true },
  { view: 'summary', grant: 'Library.AllBooks.Update', add: false, edit: true },
])('shows catalogue actions for $grant in $view view', async ({ view, grant, add, edit }) => {
  navigation.view = view;
  const grants = grant ? ['Library.AllBooks.View', grant] : ['Library.AllBooks.View'];
  const store = catalogueTestStore(grants);
  render(<BookList />, { wrapper: catalogueTestWrapper(store) });

  await screen.findByText(deletionRow.title);
  if (view === 'cover') {
    fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
    expect(screen.getByRole('menuitem', { name: 'View' })).toBeInTheDocument();
  }

  expect(Boolean(screen.queryByRole('button', { name: 'Book', hidden: true }))).toBe(add);
  const editRole = view === 'cover' ? 'menuitem' : 'button';
  expect(Boolean(screen.queryByRole(editRole, { name: 'Edit', hidden: true }))).toBe(edit);
});
