import { it, expect, describe } from 'vitest';

import {
  canManageGrant,
  hasDirectGrant,
  permissionLabel,
  catalogueEntries,
  inheritedSources,
  branchPermissions,
  buildPermissionPanels,
  buildVisibilityPanels,
  filterPermissionBranches,
} from './permission-catalogue';

import type { CataloguePermission, PermissionCatalogue } from './permission-catalogue';

const entry = (name: string, parentName?: string): CataloguePermission => ({
  name,
  parentName,
  displayName: name.split('.').at(-1)!,
  isGranted: false,
  allowedProviders: [],
  grantedProviders: [],
});
const permissions = [
  entry('HR'),
  entry('HR.Payroll', 'HR'),
  entry('HR.Payroll.View', 'HR.Payroll'),
  entry('HR.Payroll.Edit', 'HR.Payroll'),
  entry('HR.Payroll.Activate', 'HR.Payroll'),
  entry('HR.Payroll.FutureAction', 'HR.Payroll'),
  entry('Unmapped'),
  entry('Unmapped.Nested', 'Unmapped'),
  entry('Unmapped.Nested.Publish', 'Unmapped.Nested'),
  entry('ShikshaMitra.Module.HR'),
];
const catalogue: PermissionCatalogue = {
  groups: [{ name: 'School', displayName: 'School', permissions }],
};
const navigation = [
  {
    title: 'HR/Staff',
    permissionName: 'ShikshaMitra.Module.HR',
    submodule: [
      {
        title: 'Payroll Management',
        children: [{ title: 'Payroll', permissionName: 'HR.Payroll.View' }],
      },
    ],
  },
];

describe('server-driven permissions in the existing panels', () => {
  it('keeps unmapped feature context in untranslated action labels', () => {
    const permission = { ...entry('HR.Future.Payroll.Lock'), displayName: 'Permission:HR.Future.Payroll.Lock' };
    expect(permissionLabel(permission, 'HR')).toBe('Future / Payroll / Lock');
    expect(permissionLabel(permission, 'HR.Future.Payroll')).toBe('Lock');
    expect(permissionLabel({ ...permission, displayName: 'Lock payroll' }, 'HR')).toBe('Lock payroll');
  });
  it('uses only navigation visibility flags and retains their nested labels and order', () => {
    const flags = [
      'ShikshaMitra.Module.HR',
      'ShikshaMitra.Module.HR.Payroll',
      'ShikshaMitra.Module.HR.Payroll.Settings',
      'ShikshaMitra.Module.HR.FutureArea',
      'ShikshaMitra.Module.FutureModule',
    ];
    const nav = [
      {
        title: 'HR',
        permissionName: flags[0],
        submodule: [
          {
            title: 'Payroll',
            permissionName: flags[1],
            children: [
              { title: 'Settings', permissionName: flags[2] },
              { title: 'Duplicate settings', permissionName: flags[2] },
              { title: 'Module shortcut', permissionName: flags[0] },
              { title: 'View payroll', permissionName: 'HR.Payroll.View' },
            ],
          },
        ],
      },
    ];
    const visibilityEntries = [...flags.map((name) => entry(name)), entry('HR.ESI.Activate')];
    const model = buildVisibilityPanels(nav);
    const names = model
      .flatMap((panel) => [
        panel.permissionName,
        ...panel.submodule.map((sub) => sub.permissionName),
      ])
      .filter(Boolean);
    expect(names).toEqual(flags.slice(0, 3));
    expect(new Set(names).size).toBe(names.length);
    expect(model.map((panel) => panel.title)).toEqual(['HR']);
    expect(model[0].submodule.map((sub) => sub.title)).toEqual(['Payroll', 'Payroll / Settings']);
    const actions = buildPermissionPanels(
      { groups: [{ name: 'HR', displayName: 'HR', permissions: visibilityEntries }] },
      nav
    ).flatMap((panel) => panel.submodule.flatMap((sub) => branchPermissions(sub.roots)));
    expect(actions.map((action) => action.name)).toEqual(['HR.ESI.Activate']);
  });
  it('uses explicit visibility mappings without requiring a server catalogue', () => {
    const model = buildVisibilityPanels([
      {
        title: 'Academics',
        permissionName: 'Academics.View',
        visibilityPermissionName: 'ShikshaMitra.Module.Academics',
        submodule: [
          {
            title: 'Class Teacher Assignment',
            permissionName: ['Academics.ClassTeacher.View', 'Academics.ClassTeacher.Edit'],
            visibilityPermissionName: 'ShikshaMitra.Module.Academics.ClassTeacherAssignment',
          },
          {
            title: 'Curriculum',
            permissionChildren: [
              {
                title: 'Settings',
                permissionName: 'ShikshaMitra.Module.Academics.Curriculum.Settings',
              },
            ],
          },
        ],
      },
    ]);
    expect(model[0].permissionName).toBe('ShikshaMitra.Module.Academics');
    expect(model[0].submodule).toEqual([
      {
        title: 'Class Teacher Assignment',
        permissionName: 'ShikshaMitra.Module.Academics.ClassTeacherAssignment',
      },
      {
        title: 'Curriculum / Settings',
        permissionName: 'ShikshaMitra.Module.Academics.Curriculum.Settings',
      },
    ]);
  });
  it('keeps flat HR catalogue actions in their own navigation feature, including future actions', () => {
    const data: PermissionCatalogue = {
      groups: [
        {
          name: 'HR',
          displayName: 'HR',
          permissions: [
            entry('HR'),
            entry('HR.Dashboard.View', 'HR'),
            entry('HR.Payroll.ESI.View', 'HR'),
            entry('HR.Payroll.ESI.Activate', 'HR'),
            entry('HR.Payroll.ESI.FutureAction', 'HR'),
            entry('HR.Payroll.Run.View', 'HR'),
            entry('HR.Payroll.Run.Lock', 'HR'),
          ],
        },
      ],
    };
    const panels = buildPermissionPanels(data, [
      {
        title: 'HR',
        submodule: [
          {
            title: 'Dashboard',
            children: [{ title: 'Dashboard', permissionName: 'HR.Dashboard.View' }],
          },
          {
            title: 'Payroll',
            children: [
              { title: 'Statutory Schemes', permissionName: 'HR.Payroll.ESI.View' },
              { title: 'Run Payroll', permissionName: 'HR.Payroll.Run' },
            ],
          },
        ],
      },
    ]);
    expect(branchPermissions(panels[0].submodule[0].roots).map((p) => p.name)).toEqual([
      'HR.Dashboard.View',
    ]);
    expect(branchPermissions(panels[0].submodule[1].roots).map((p) => p.name)).toEqual([
      'HR.Payroll.ESI.View',
      'HR.Payroll.ESI.Activate',
      'HR.Payroll.ESI.FutureAction',
      'HR.Payroll.Run.View',
      'HR.Payroll.Run.Lock',
    ]);
    const all = panels.flatMap((panel) =>
      panel.submodule.flatMap((sub) => branchPermissions(sub.roots))
    );
    expect(all.map((p) => p.name).sort()).toEqual(
      data.groups[0].permissions.map((p) => p.name).sort()
    );
    expect(all.filter((p) => p.name.startsWith('ui-feature:'))).toEqual([]);
  });
  it('reaches every action once, including future and unmapped entries', () => {
    const panels = buildPermissionPanels(catalogue, navigation);
    const names = panels.flatMap((panel) =>
      panel.submodule.flatMap((sub) => branchPermissions(sub.roots).map((item) => item.name))
    );
    expect(names.sort()).toEqual(
      permissions
        .filter((p) => p.name !== 'ShikshaMitra.Module.HR')
        .map((p) => p.name)
        .sort()
    );
    expect(new Set(names).size).toBe(names.length);
    expect(panels[0].title).toBe('HR/Staff');
  });

  it('keeps the complete subtree available when search hides actions', () => {
    const { roots } = buildPermissionPanels(catalogue, navigation)[0].submodule[0];
    expect(
      branchPermissions(filterPermissionBranches(roots, 'Activate')).map((p) => p.name)
    ).toEqual(['HR.Payroll', 'HR.Payroll.Activate']);
    expect(branchPermissions(roots).map((p) => p.name)).toContain('HR.Payroll.FutureAction');
    expect(branchPermissions(roots)).toHaveLength(5);
  });

  it('separates inherited access from a direct user grant and provider eligibility', () => {
    const provider = { providerName: 'U', providerKey: 'synthetic-user' };
    const permission = {
      ...entry('HR.Payroll.Lock'),
      isGranted: true,
      allowedProviders: ['R'],
      grantedProviders: [{ providerName: 'R', providerKey: 'HR Manager' }, provider],
    };
    expect(hasDirectGrant(permission, provider)).toBe(true);
    expect(inheritedSources(permission, provider)).toEqual([
      { providerName: 'R', providerKey: 'HR Manager' },
    ]);
    expect(canManageGrant(permission, provider)).toBe(false);
  });

  it('deduplicates catalogue rows and preserves cyclic or missing-parent entries', () => {
    const orphan = entry('Future', 'Missing');
    const data = {
      groups: [
        {
          name: 'Future',
          displayName: 'Future',
          permissions: [orphan, orphan, entry('A', 'B'), entry('B', 'A')],
        },
      ],
    };
    expect(catalogueEntries(data)).toHaveLength(3);
    const names = buildPermissionPanels(data, []).flatMap((panel) =>
      panel.submodule.flatMap((sub) => branchPermissions(sub.roots).map((p) => p.name))
    );
    expect(names.sort()).toEqual(['A', 'B', 'Future']);
  });
});
