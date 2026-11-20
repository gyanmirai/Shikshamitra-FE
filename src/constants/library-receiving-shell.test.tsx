import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import LibraryLayout from 'src/app/(auth-route)/library/layout';
import AllBooksLayout from 'src/app/(auth-route)/library/book-list/layout';

const auth = vi.hoisted(() => ({
  permissions: [] as { name: string; isGranted: boolean }[],
  loading: false,
  permissionsInitialized: true,
}));
vi.mock('react-redux', () => ({ useSelector: (select: any) => select({ auth }) }));
vi.mock('src/sections/error', () => ({ View403: () => <div>Access denied</div> }));
vi.mock('src/components/loading-screen', () => ({
  SplashScreen: () => <div>Loading permissions</div>,
}));
beforeEach(() => {
  auth.permissions = [];
});
const grant = (...names: string[]) => {
  auth.permissions = names.map((name) => ({ name, isGranted: true }));
};

it('allows the visible Library shell without requiring the legacy aggregate grant', () => {
  grant(
    'ShikshaMitra.Module.Library',
    'Library.Receiving.View',
    'Library.Receiving.Add',
    'Library.AllBooks.View'
  );
  render(
    <LibraryLayout>
      <div>Receiving workspace</div>
    </LibraryLayout>
  );
  expect(screen.getByText('Receiving workspace')).toBeVisible();
});

it('leaves direct route authorization to exact child actions when navigation visibility is absent', () => {
  grant('Library.Receiving.View', 'Library.Receiving.Add', 'Library.AllBooks.View');
  render(
    <LibraryLayout>
      <div>Receiving workspace</div>
    </LibraryLayout>
  );
  expect(screen.getByText('Receiving workspace')).toBeVisible();
});

it('does not let module visibility or receiving grants bypass a child catalogue action', () => {
  grant('ShikshaMitra.Module.Library', 'Library.Receiving.View', 'Library.Receiving.Add');
  render(
    <LibraryLayout>
      <AllBooksLayout>
        <div>Catalogue workspace</div>
      </AllBooksLayout>
    </LibraryLayout>
  );
  expect(screen.getByText('Access denied')).toBeVisible();
  expect(screen.queryByText('Catalogue workspace')).not.toBeInTheDocument();
});
