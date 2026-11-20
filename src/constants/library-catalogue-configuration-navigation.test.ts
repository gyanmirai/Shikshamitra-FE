import { it, expect } from 'vitest';
import { hasNavigationPermission } from 'src/utils/permissions';

import libraryModule, { libraryPaths, libraryPermissions } from './library-menus';

it('declares the dedicated catalogue configuration URL and exact View permission', () => {
  const paths = libraryPaths.settings as unknown as Record<string, string>;
  const permissions = libraryPermissions.settings as unknown as Record<string, string>;
  expect(paths.catalogueConfiguration).toBe('/library/settings/catalogue-configuration');
  expect(permissions.catalogueConfiguration).toBe('Library.Settings.CatalogueConfiguration.View');
});

it('makes the owned destination discoverable without Settings or BookCategories aggregate grants', () => {
  const rootItems = Object.values(libraryModule).flatMap((groups) =>
    groups.flatMap((group) => group.items)
  );
  const item = rootItems.find(
    (entry) => entry.path === '/library/settings/catalogue-configuration'
  );
  expect(item).toBeDefined();
  expect(item).toMatchObject({ permissionName: 'Library.Settings.CatalogueConfiguration.View' });
  expect(
    hasNavigationPermission(
      [{ name: 'Library.Settings.CatalogueConfiguration.View', isGranted: true }],
      item?.permissionName
    )
  ).toBe(true);
  expect(item).not.toHaveProperty('visibilityPermissionName');
});
