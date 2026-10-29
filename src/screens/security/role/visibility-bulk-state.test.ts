import { it, expect } from 'vitest';

import { visibilityBulkNames } from './permission-bulk-state';
import { canManageGrant, catalogueEntries, buildVisibilityPanels } from './permission-catalogue';

import type { PermissionCatalogue, NavigationPermission } from './permission-catalogue';

const root = 'ShikshaMitra.Module.HR';
const names = [root, `${root}.Payroll`, `${root}.Payroll.Settings`, `${root}.Staff`];
const navigation: NavigationPermission[] = [
  {
    title: 'HR',
    permissionName: root,
    submodule: [
      {
        title: 'Payroll',
        visibilityPermissionName: names[1],
        children: [
          { title: 'Settings', permissionName: names[2] },
          { title: 'Duplicate settings', permissionName: names[2] },
          { title: 'Run Payroll', permissionName: 'HR.Payroll.Run.View' },
          { title: 'Missing catalogue entry', permissionName: `${root}.Missing` },
        ],
      },
      { title: 'Staff', permissionName: names[3] },
    ],
  },
  { title: 'Academic', permissionName: 'ShikshaMitra.Module.Academics' },
];
const catalogue: PermissionCatalogue = {
  groups: [
    {
      name: 'Synthetic',
      displayName: 'Synthetic',
      permissions: [
        ...names,
        'ShikshaMitra.Module.Academics',
        'ShikshaMitra.Module.APIOnly',
        'HR.Payroll.Run.View',
      ].map((name) => ({
        name,
        displayName: name,
        isGranted: false,
        grantedProviders: [],
        allowedProviders: name === names[3] ? ['U'] : [],
      })),
    },
  ],
};

it.each(['R', 'U'])('targets only mapped catalogue visibility eligible for %s', (providerName) => {
  const entries = catalogueEntries(catalogue);
  const manageable = new Set(
    entries
      .filter((entry) =>
        canManageGrant(entry, {
          providerName,
          providerKey: 'synthetic',
        })
      )
      .map(({ name }) => name)
  );
  manageable.add(`${root}.Missing`);
  const panels = buildVisibilityPanels(navigation);
  const expected = providerName === 'U' ? names : names.slice(0, 3);
  expect(visibilityBulkNames([panels[0]], entries, manageable)).toEqual(expected);
  expect(visibilityBulkNames(panels, entries, manageable)).toEqual([
    ...expected,
    'ShikshaMitra.Module.Academics',
  ]);
});

it('has no targets without eligible catalogue entries', () => {
  expect(visibilityBulkNames(navigation, [], new Set(names))).toEqual([]);
  expect(visibilityBulkNames(navigation, catalogueEntries(catalogue), new Set())).toEqual([]);
});
