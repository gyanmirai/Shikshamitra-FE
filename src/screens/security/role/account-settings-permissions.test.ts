import { it, expect, describe } from 'vitest';

import { setPermissionGrants, getChangedPermissionGrants } from './permission-grants';
import {
  getActionPermissionBase,
  getNodePermissionActions,
  getNodeActionPermissionNames,
} from './account-settings-permissions';

describe.each(['AccountHead', 'IncomeCategory', 'ExpenseCategory', 'BankAccount'])(
  '%s permission editor',
  (setting) => {
    const base = `Finance.Accounts.Settings.${setting}`;
    const actions = ['View', 'Add', 'Edit', 'ChangeStatus', 'Delete'];
    const catalog = actions.map((action) => ({ name: `${base}.${action}`, isGranted: false }));

    it('uses canonical action names when a menu is guarded with .View', () => {
      expect(getActionPermissionBase(`${base}.View`)).toBe(base);
      expect(getNodePermissionActions(`${base}.View`, catalog)).toEqual(actions);
      const targets = getNodeActionPermissionNames({ permissionName: `${base}.View` }, catalog);
      const changed = getChangedPermissionGrants(
        setPermissionGrants(catalog, targets, true),
        catalog
      );
      expect(changed).toEqual(catalog.map((permission) => ({ ...permission, isGranted: true })));
      expect(changed.some((permission) => permission.name.includes('.View.'))).toBe(false);
    });

    it('does not invent actions missing from an older server catalog', () => {
      const oldCatalog = catalog.filter((permission) =>
        /\.(View|Add|Delete)$/.test(permission.name)
      );
      expect(getNodePermissionActions(`${base}.View`, oldCatalog)).toEqual([
        'View',
        'Add',
        'Delete',
      ]);
      expect(getNodePermissionActions(`${base}.View`, [])).toEqual([]);
    });

    it('collects all five actions through the nested Accounts settings menu', () => {
      const node = { children: [{ children: [{ permissionName: `${base}.View` }] }] };
      expect(getNodeActionPermissionNames(node, catalog)).toEqual(
        catalog.map((permission) => permission.name)
      );
    });
  }
);

it('preserves the existing action names for other modules', () => {
  expect(getActionPermissionBase('Finance.Settings.FeeCategory')).toBe(
    'Finance.Settings.FeeCategory'
  );
  expect(getNodePermissionActions('Finance.Settings.FeeCategory', [])).toEqual([
    'View',
    'Add',
    'Delete',
  ]);
});

describe.each([
  'Settings.FeeStructure',
  'Policies.CollectionPolicy',
  'Policies.ConcessionPolicy',
  'Policies.RefundPolicy',
  'Policies.ProrationPolicy',
])('%s configuration permissions', (module) => {
  const base = `Finance.${module}`;
  const catalog = ['View', 'Add', 'Delete'].map((action) => ({
    name: `${base}.${action}`,
    isGranted: true,
  }));
  it('resolves the API grants and updates exactly the three canonical keys', () => {
    expect(getActionPermissionBase(`${base}.View`)).toBe(base);
    const names = getNodeActionPermissionNames({ permissionName: `${base}.View` }, catalog);
    expect(names).toEqual(catalog.map((item) => item.name));
    const revoked = setPermissionGrants(catalog, names, false);
    expect(getChangedPermissionGrants(revoked, catalog)).toHaveLength(3);
    expect(revoked.every((item) => !item.isGranted)).toBe(true);
    expect(setPermissionGrants(revoked, names, true)).toEqual(catalog);
  });
  it('never creates fake switches for permissions missing in an older API response', () => {
    expect(getNodePermissionActions(`${base}.View`, catalog.slice(0, 2))).toEqual(['View', 'Add']);
    expect(getNodeActionPermissionNames({ permissionName: `${base}.View` }, [])).toEqual([]);
  });
});
