import { it, expect } from 'vitest';
import { hasNavigationPermission } from 'src/utils/permissions';
import { getAllItems } from 'src/layouts/components/searchbar/utils';

import libraryModule from './library-menus';

const data = Object.values(libraryModule).flat();
const settings = data
  .flatMap((group) => group.items)
  .find((item) => item._action === 'library-settings')!;
const children = settings.children!;
const grants = (name: string) => [{ name, isGranted: true }];

it.each(children)('exposes the Settings group for the exact $title reader', (child) => {
  expect(
    hasNavigationPermission(grants(child.permissionName as string), settings.permissionName)
  ).toBe(true);
});

it('does not expose a Settings group through only its obsolete aggregate permission', () => {
  expect(hasNavigationPermission(grants('Library.Settings.View'), settings.permissionName)).toBe(
    false
  );
});

it.each(children)(
  'offers $title in search without exposing unauthorized sibling settings',
  (child) => {
    const permission = child.permissionName as string;
    const visible = getAllItems({ data, permissions: grants(permission) }).map((item) => item.path);
    const allowed = children
      .filter((item) => item.permissionName === permission)
      .map((item) => item.path);
    expect(visible.filter((path) => children.some((item) => item.path === path))).toEqual(allowed);
  }
);

it('does not offer backed setting destinations to aggregate-only or anonymous search', () => {
  [grants('Library.Settings.View'), []].forEach((permissions) => {
    const visible = getAllItems({ data, permissions }).map((item) => item.path);
    expect(visible.filter((path) => children.some((item) => item.path === path))).toEqual([]);
  });
});
