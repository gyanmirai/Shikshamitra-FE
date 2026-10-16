import { it, expect, describe } from 'vitest';

import { permissionBulkNames } from './permission-bulk-state';
import { canManageGrant, catalogueEntries } from './permission-catalogue';
import { setPermissionGrants, getChangedPermissionGrants } from './permission-grants';

import type { PermissionGrant } from './permission-grants';
import type { PermissionCatalogue, NavigationPermission } from './permission-catalogue';

const feature = (title: string, base: string): NavigationPermission => ({
  title,
  permissionName: `${base}.View`,
});
const grantsFor = (names: string[], isGranted = false): PermissionGrant[] =>
  names.map((name) => ({ name, isGranted }));
const payroll = feature('Run Payroll', 'HR.PayrollManagement.RunPayroll');
const staff = feature('Staff', 'HR.Staff');
const payrollNames = ['View', 'Add', 'Lock'].map(
  (action) => `HR.PayrollManagement.RunPayroll.${action}`
);
const staffNames = ['View', 'Edit'].map((action) => `HR.Staff.${action}`);
const moduleNode: NavigationPermission = {
  title: 'HR/Staff',
  permissionName: 'ShikshaMitra.Module.HR',
  submodule: [
    {
      title: 'Payroll Management',
      permissionChildren: [{ title: 'Processing', children: [payroll, payroll] }],
    },
    { title: 'Staff', children: [staff] },
  ],
};

describe('permission bulk targets', () => {
  it('collects the full module through every navigation level and deduplicates repeated features', () => {
    const names = [...payrollNames, ...staffNames];
    const grants = grantsFor(names);

    expect(permissionBulkNames([moduleNode, payroll], grants, new Set(names))).toEqual({
      grant: names,
      revoke: names,
    });
  });

  it('limits a submodule operation to its mapped descendants and preserves unrelated grants', () => {
    const outside = [
      ...staffNames,
      'HR.PayrollManagement.UnmappedFeature.View',
      'HR.PayrollManagement.RunPayrollOther.View',
      'ShikshaMitra.Module.HR',
      'ShikshaMitra.Module.HR.PayrollManagement',
    ];
    const grants = grantsFor([...payrollNames, ...outside], true);
    const targets = permissionBulkNames(
      [moduleNode.submodule![0]],
      grants,
      new Set(grants.map(({ name }) => name))
    );
    const updated = setPermissionGrants(grants, targets.revoke, false);

    expect(targets).toEqual({ grant: payrollNames, revoke: payrollNames });
    expect(getChangedPermissionGrants(updated, grants)).toEqual(grantsFor(payrollNames));
    expect(updated.filter(({ name }) => outside.includes(name))).toEqual(grantsFor(outside, true));
  });

  it.each(['R', 'U'])('includes only catalogue actions eligible for provider %s', (providerName) => {
    const catalogue: PermissionCatalogue = {
      groups: [{
        name: 'HR',
        displayName: 'HR',
        permissions: payrollNames.map((name, index) => ({
          name,
          displayName: name,
          isGranted: false,
          allowedProviders: index === 0 ? [] : [index === 1 ? 'R' : 'U'],
          grantedProviders: [],
        })),
      }],
    };
    const provider = { providerName, providerKey: 'synthetic' };
    const entries = catalogueEntries(catalogue);
    const manageable = new Set(
      entries.filter((entry) => canManageGrant(entry, provider)).map(({ name }) => name)
    );
    manageable.add('HR.PayrollManagement.RunPayroll.Delete');
    const expected = [payrollNames[0], payrollNames[providerName === 'R' ? 1 : 2]];

    expect(permissionBulkNames([moduleNode], entries, manageable)).toEqual({
      grant: expected,
      revoke: expected,
    });
  });

  it('revokes hidden statutory actions within the exact namespace without granting them', () => {
    const root = 'HR.PayrollManagement.Settings.StatutorySchemes';
    const mapped = ['View', 'Edit', 'Activate', 'ManageEnrollment', 'ApproveOverride', 'ConfigureCalculation']
      .map((action) => `${root}.${action}`);
    const hidden = [root, `${root}.FutureAction`, `${root}.Nested.Action`];
    const restricted = `${root}.RestrictedAction`;
    const outside = [`${root}Other.Edit`, 'HR.PayrollManagement.Settings.PFRule.View'];
    const grants = grantsFor([...mapped, ...hidden, restricted, ...outside], true);
    const manageable = new Set(grants.map(({ name }) => name).filter((name) => name !== restricted));
    const node: NavigationPermission = {
      title: 'Payroll Management',
      children: [{ title: 'Settings', permissionChildren: [feature('Statutory Schemes', root)] }],
    };
    const targets = permissionBulkNames([node], grants, manageable);

    expect(targets).toEqual({ grant: mapped, revoke: [...mapped, ...hidden] });
    expect(getChangedPermissionGrants(setPermissionGrants(grants, targets.revoke, false), grants))
      .toEqual(grantsFor([...mapped, ...hidden]));
  });

  it('has no targets for a missing catalogue or a provider with no eligible actions', () => {
    expect(permissionBulkNames([moduleNode], [], new Set(payrollNames)))
      .toEqual({ grant: [], revoke: [] });
    expect(permissionBulkNames([moduleNode], grantsFor(payrollNames), new Set()))
      .toEqual({ grant: [], revoke: [] });
  });
});
