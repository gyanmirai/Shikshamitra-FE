import { it, expect } from 'vitest';

import { hasNavigationPermission } from './permissions';

import type { PermissionName, GrantedPermission } from './permissions';

const navigationAccess: (
  grants: GrantedPermission[],
  permission: PermissionName,
  requiredAll?: readonly string[]
) => boolean = hasNavigationPermission;
const granted = (...names: string[]) => names.map((name) => ({ name, isGranted: true }));

it('requires every declared exact navigation prerequisite', () => {
  expect(
    navigationAccess(granted('Library.Receiving.View'), 'Library.Receiving.View', [
      'Library.Receiving.View',
      'Library.AllBooks.View',
    ])
  ).toBe(false);
  expect(
    navigationAccess(
      granted('Library.Receiving.View', 'Library.AllBooks.View'),
      'Library.Receiving.View',
      ['Library.Receiving.View', 'Library.AllBooks.View']
    )
  ).toBe(true);
});

it('keeps existing alternative permission arrays and parent navigation defaults unchanged', () => {
  expect(
    navigationAccess(granted('Legacy.Second.View'), ['Legacy.First.View', 'Legacy.Second.View'])
  ).toBe(true);
  expect(navigationAccess(granted('Legacy.Second.View'), 'Legacy.Second')).toBe(true);
  expect(navigationAccess([], ['Legacy.First.View', 'Legacy.Second.View'])).toBe(false);
});
