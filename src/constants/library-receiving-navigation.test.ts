import { it, expect } from 'vitest';

import libraryModule, { libraryPaths, libraryPermissions } from './library-menus';

it('exposes receiving under its existing server View permission without creating a visibility flag', () => {
  const paths = libraryPaths as unknown as Record<string, string>;
  const permissions = libraryPermissions as unknown as Record<string, string>;
  const items = Object.values(libraryModule).flatMap((groups) =>
    groups.flatMap((group) => group.items)
  );
  expect(paths.receiving).toBe('/library/receiving');
  expect(permissions.receiving).toBe('Library.Receiving.View');
  expect(items.find((item) => item.path === '/library/receiving')).toMatchObject({
    title: 'Stock Receiving',
    permissionName: 'Library.Receiving.View',
  });
  expect(items.find((item) => item.path === '/library/receiving')).not.toHaveProperty(
    'visibilityPermissionName'
  );
});

it('declares both exact read prerequisites for receiving navigation while keeping Add separate', () => {
  const items = Object.values(libraryModule).flatMap((groups) =>
    groups.flatMap((group) => group.items)
  );
  expect(items.find((item) => item.path === '/library/receiving')).toMatchObject({
    requiredAllPermissions: ['Library.Receiving.View', 'Library.AllBooks.View'],
  });
});
