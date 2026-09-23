import { it, expect, describe } from 'vitest';

import { setPermissionGrants, getChangedPermissionGrants } from './permission-grants';
import {
  getActionPermissionBase,
  getNodePermissionActions,
  getNodeActionPermissionNames,
  getAffectedNodePermissionNames,
  getNodeRevocationPermissionNames,
  getNodeActionPermissionNamesForAction,
} from './account-settings-permissions';

describe('Statutory Schemes permission groups', () => {
  const root = 'HR.PayrollManagement.Settings.StatutorySchemes';
  const node = { permissionName: `${root}.View` };
  const edits = ['Edit', 'Activate', 'ManageEnrollment', 'ApproveOverride'].map((action) => `${root}.${action}`);
  const catalog = [`${root}.View`, ...edits].map((name) => ({ name, isGranted: true }));

  it('uses three existing controls and maps Edit to all four defined write permissions', () => {
    expect(getNodePermissionActions(node.permissionName, catalog)).toEqual(['View', 'Edit', 'Delete']);
    expect(getNodeActionPermissionNamesForAction(node.permissionName, 'Edit', catalog)).toEqual(edits);
    expect(getNodeActionPermissionNamesForAction(node.permissionName, 'View', catalog)).toEqual([`${root}.View`]);
    expect(getNodeActionPermissionNamesForAction(node.permissionName, 'Delete', catalog)).toEqual([]);
    expect(getNodeActionPermissionNames(node, catalog)).toEqual(catalog.map(({ name }) => name));
  });

  it('keeps View and Edit independent and never invents missing actions', () => {
    expect(getAffectedNodePermissionNames(node, 'View', false, catalog)).toEqual(new Set([`${root}.View`]));
    expect(getAffectedNodePermissionNames(node, 'Edit', true, catalog)).toEqual(new Set(edits));
    expect(getAffectedNodePermissionNames(node, 'Edit', false, catalog)).toEqual(new Set(edits));
    expect(getNodeActionPermissionNamesForAction(node.permissionName, 'Edit', catalog.slice(0, 1))).toEqual([]);
    const withDelete = [...catalog, { name: `${root}.Delete`, isGranted: false }];
    expect(getNodeActionPermissionNamesForAction(node.permissionName, 'Delete', withDelete)).toEqual([`${root}.Delete`]);
  });

  it('revokes every feature grant including unrepresented actions, without granting unknown rights', () => {
    const extra = [root, `${root}.FutureAction`, `${root}.Nested.Action`, `${root}.Add`];
    const outside = [`${root}Other.Edit`, 'HR.PayrollManagement.Settings.PFRule.View', 'ShikshaMitra.Module.HR.PayrollManagement'];
    const complete = [...catalog, ...extra.concat(outside).map((name) => ({ name, isGranted: true }))];
    expect(getNodeRevocationPermissionNames(node, complete)).toEqual([...catalog.map(({ name }) => name), ...extra]);
    expect(getNodeActionPermissionNames(node, complete)).toEqual(catalog.map(({ name }) => name));
    expect(getNodeActionPermissionNamesForAction(node.permissionName, 'Add', complete)).toEqual([]);
    expect(getNodeRevocationPermissionNames({ children: [node, node] }, complete)).toEqual([...catalog.map(({ name }) => name), ...extra]);
  });
});

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

it('does not invent actions missing from the permission catalog', () => {
  expect(getActionPermissionBase('Finance.Settings.FeeCategory')).toBe(
    'Finance.Settings.FeeCategory'
  );
  expect(getNodePermissionActions('Finance.Settings.FeeCategory', [])).toEqual([]);
});

it('exposes every server-defined generic action, including disabled grants', () => {
  const base = 'Finance.Fees.Concession';
  const actions = ['View', 'Add', 'Edit', 'Submit', 'UploadDocument', 'Approve', 'Reject', 'Reverse'];
  const catalog = actions.map((action) => ({
    name: `${base}.${action}`,
    isGranted: ['View', 'Add', 'Approve', 'Reject'].includes(action),
  }));

  expect(getNodePermissionActions(`${base}.View`, catalog)).toEqual(actions);
  expect(getNodeActionPermissionNames({ permissionName: `${base}.View` }, catalog)).toEqual(
    actions.map((action) => `${base}.${action}`)
  );
});

it('groups specialized Student Admissions actions behind View, Add, and Delete', () => {
  const base = 'Students.Admissions.Inquiries';
  const actions = ['View', 'Add', 'Delete', 'Manage', 'Create', 'Edit', 'Assign'];
  const catalog = actions.map((action) => ({ name: `${base}.${action}`, isGranted: false }));

  expect(getActionPermissionBase(`${base}.View`)).toBe(base);
  expect(getNodePermissionActions(`${base}.View`, catalog)).toEqual(['View', 'Add', 'Delete']);
  expect(getNodeActionPermissionNamesForAction(`${base}.View`, 'View', catalog)).toEqual([
    `${base}.View`,
  ]);
  expect(getNodeActionPermissionNamesForAction(`${base}.View`, 'Add', catalog)).toEqual(
    ['Add', 'Manage', 'Create', 'Edit', 'Assign'].map((action) => `${base}.${action}`)
  );
  expect(getNodeActionPermissionNamesForAction(`${base}.View`, 'Delete', catalog)).toEqual([
    `${base}.Delete`,
  ]);
  expect(getNodeActionPermissionNames({ permissionName: `${base}.View` }, catalog)).toEqual(
    ['View', 'Add', 'Manage', 'Create', 'Edit', 'Assign', 'Delete'].map(
      (action) => `${base}.${action}`
    )
  );
});

it('grants the Student View group when Add is enabled', () => {
  const base = 'Students.Admissions.Inquiries';
  const catalog = ['View', 'Manage', 'Create', 'Edit', 'Assign'].map((action) => ({
    name: `${base}.${action}`,
    isGranted: false,
  }));
  const affectedNames = getAffectedNodePermissionNames(
    { permissionName: `${base}.View` },
    'Add',
    true,
    catalog
  );

  expect(affectedNames).toEqual(new Set(catalog.map((permission) => permission.name)));
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
