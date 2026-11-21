import { it, expect } from 'vitest';
import {
  getNodePermissionActions,
  getAffectedNodePermissionNames,
} from 'src/screens/security/role/account-settings-permissions';

import libraryModule, { libraryPaths, libraryPermissions } from './library-menus';

it('shows stock verification for the exact read pair and reserves opening and scanning for their own actions', () => {
  const items = Object.values(libraryModule).flatMap((groups) =>
    groups.flatMap((group) => group.items)
  );
  expect(libraryPaths.stockVerification).toBe('/library/stock-verification');
  expect(libraryPaths.stockVerificationNew).toBe('/library/stock-verification/new');
  expect(libraryPermissions.stockVerificationAdd).toBe('Library.InventoryVerification.Add');
  expect(libraryPermissions.stockVerificationUpdate).toBe('Library.InventoryVerification.Update');
  const item = items.find((row) => row.path === libraryPaths.stockVerification);
  expect(item).toMatchObject({
    permissionName: 'Library.InventoryVerification.View',
    requiredAllPermissions: ['Library.InventoryVerification.View', 'Library.AllBooks.View'],
  });
  expect(item).not.toHaveProperty('visibilityPermissionName');
});

it('exposes approval as an independent editable stock verification action', () => {
  const base = 'Library.InventoryVerification';
  const permissions = ['View', 'Add', 'Update', 'Approve'].map((action) => ({
    name: `${base}.${action}`,
    isGranted: false,
  }));
  const node = { permissionName: libraryPermissions.stockVerification };
  expect(libraryPermissions.stockVerificationApprove).toBe(`${base}.Approve`);
  expect(getNodePermissionActions(node.permissionName, permissions)).toContain('Approve');
  expect(getAffectedNodePermissionNames(node, 'Update', true, permissions)).toEqual(
    new Set([`${base}.Update`])
  );
  expect(getAffectedNodePermissionNames(node, 'Approve', true, permissions)).toEqual(
    new Set([`${base}.Approve`])
  );
});
