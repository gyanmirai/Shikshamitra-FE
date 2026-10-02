import { it, expect, describe } from 'vitest';
import { fullSecurityNavData } from 'src/layouts/config-nav-dashboard';
import { getPermissionChildren } from 'src/screens/security/role/utils';
import {
  setPermissionGrants,
  getChangedPermissionGrants,
} from 'src/screens/security/role/permission-grants';
import {
  getNodeActionPermissionNames,
  getAffectedNodePermissionNames,
  getNodeRevocationPermissionNames,
  getNodeActionPermissionNamesForAction,
} from 'src/screens/security/role/account-settings-permissions';

type PermissionNode = {
  title: string;
  permissionName?: string | string[];
  path?: string;
  children?: PermissionNode[];
  permissionChildren?: PermissionNode[];
  submodule?: PermissionNode[];
};
const recordsRoot = 'Students.Records';
const actions = (feature: string, names = ['View', 'Add', 'Delete']) =>
  names.map((action) => `${recordsRoot}.${feature}.${action}`);
const featureNames = [
  ...actions('StudentList'),
  ...actions('Certificates'),
  ...actions('StudentICard'),
  ...actions('Overrides', ['Request', 'Approve']),
  ...actions('GuardianAccess', ['View', 'Manage']),
];
const siblingNames = [
  ...actions('Changes', ['View', 'Create', 'Approve', 'Reject', 'Cancel']),
  ...actions('Transitions', ['View', 'Create', 'Approve', 'Correct']),
  ...actions('Reports'),
  ...actions('Settings', ['View', 'Add', 'Delete', 'Publish']),
  ...actions('StudentManagement'),
  'Students.Admissions.Applications.View',
  'Students.Attendance.MarkAttendance.View',
  'ShikshaMitra.Module.Students.Records',
];
const makeCatalogue = (isGranted = false) =>
  [...featureNames, ...siblingNames].map((name) => ({ name, isGranted }));

function getRecordsNavigation() {
  const navigation = fullSecurityNavData() as { items: PermissionNode[] }[];
  const student = navigation
    .flatMap((group) => group.items)
    .find((node) => node.title === 'Student');
  const records = student?.submodule?.find((node) => node.title === 'Student Records');
  if (!records) throw new Error('Student Records navigation is missing.');
  return records;
}
function getSidebarNode(title: string) {
  const node = getRecordsNavigation().children?.find((child) => child.title === title);
  if (!node) throw new Error(`Records sidebar node ${title} is missing.`);
  return node;
}
function getEditorNode(sidebarTitle: string, title: string) {
  const node = (getPermissionChildren(getSidebarNode(sidebarTitle)) as PermissionNode[]).find(
    (child) => child.title === title
  );
  if (!node) throw new Error(`Records permission node ${title} is missing.`);
  return node;
}

describe('Student Records existing Security editor integration', () => {
  it('preserves the six actual sidebar menus and carries permission metadata through fullSecurityNavData', () => {
    const records = getRecordsNavigation();
    expect(records.children?.map((node) => node.title)).toEqual([
      'Student Directory',
      'Changes & Approvals',
      'Documents & IDs',
      'Year-End & Transitions',
      'Reports',
      'Settings',
    ]);
    expect(records.children?.every((node) => node.path?.startsWith('/student/records/'))).toBe(
      true
    );
    expect(
      getPermissionChildren(getSidebarNode('Documents & IDs')).map((node) => node.title)
    ).toEqual(['Certificates', 'Identity cards']);
    expect(
      getPermissionChildren(getSidebarNode('Student Directory')).map((node) => node.title)
    ).toEqual([
      'Directory & profiles',
      'Historical entry requests',
      'Historical entry approvals',
      'Guardian portal access',
    ]);
    expect(records.children?.every((node) => !node.children?.length)).toBe(true);
  });

  it.each(['View', 'Add', 'Delete'])(
    'maps the Documents & IDs %s group to exact registered actions through separate leaves',
    (action) => {
      const catalogue = makeCatalogue();
      const leaves = getPermissionChildren(getSidebarNode('Documents & IDs')) as PermissionNode[];
      const names = leaves.flatMap((node) =>
        getNodeActionPermissionNamesForAction(node.permissionName!, action, catalogue)
      );
      expect(names).toEqual([
        `${recordsRoot}.Certificates.${action}`,
        `${recordsRoot}.StudentICard.${action}`,
      ]);
      expect(
        getNodeActionPermissionNames(getSidebarNode('Documents & IDs'), catalogue).sort()
      ).toEqual([...actions('Certificates'), ...actions('StudentICard')].sort());
      expect(names.every((name) => catalogue.some((permission) => permission.name === name))).toBe(
        true
      );
    }
  );

  it.each([
    ['Historical entry requests', 'Request'],
    ['Historical entry approvals', 'Approve'],
  ])('keeps %s assignable without granting the other historical entry action', (title, action) => {
    const catalogue = makeCatalogue();
    const node = getEditorNode('Student Directory', title);
    const names = [...getAffectedNodePermissionNames(node, 'Add', true, catalogue)];
    const updated = setPermissionGrants(catalogue, names, true);
    expect(getChangedPermissionGrants(updated, catalogue)).toEqual([
      { name: `${recordsRoot}.Overrides.${action}`, isGranted: true },
    ]);
    expect(getNodeActionPermissionNamesForAction(node.permissionName!, 'View', catalogue)).toEqual(
      []
    );
    expect(
      getNodeActionPermissionNamesForAction(node.permissionName!, 'Delete', catalogue)
    ).toEqual([]);
  });

  it.each([
    ['Certificates', 'Certificates'],
    ['Identity cards', 'StudentICard'],
  ])(
    'grants and revokes %s actions without changing the sibling document feature',
    (title, feature) => {
      const catalogue = makeCatalogue();
      const node = getEditorNode('Documents & IDs', title);
      const granted = setPermissionGrants(
        catalogue,
        [...getAffectedNodePermissionNames(node, 'Add', true, catalogue)],
        true
      );
      expect(getChangedPermissionGrants(granted, catalogue)).toEqual(
        actions(feature, ['View', 'Add']).map((name) => ({ name, isGranted: true }))
      );
      const revoked = setPermissionGrants(
        granted,
        [...getAffectedNodePermissionNames(node, 'View', false, granted)],
        false
      );
      expect(getChangedPermissionGrants(revoked, granted)).toEqual(
        actions(feature, ['View', 'Add']).map((name) => ({ name, isGranted: false }))
      );
      expect(revoked).toEqual(catalogue);
    }
  );

  it('maps guardian View and Manage through compact groups and revokes only that feature', () => {
    const node = getEditorNode('Student Directory', 'Guardian portal access');
    const catalogue = makeCatalogue();
    expect(getNodeActionPermissionNamesForAction(node.permissionName!, 'View', catalogue)).toEqual(
      actions('GuardianAccess', ['View'])
    );
    expect(getNodeActionPermissionNamesForAction(node.permissionName!, 'Add', catalogue)).toEqual(
      actions('GuardianAccess', ['Manage'])
    );
    expect(
      getNodeActionPermissionNamesForAction(node.permissionName!, 'Delete', catalogue)
    ).toEqual([]);
    const granted = setPermissionGrants(
      catalogue,
      [...getAffectedNodePermissionNames(node, 'Add', true, catalogue)],
      true
    );
    expect(getChangedPermissionGrants(granted, catalogue).map(({ name }) => name)).toEqual(
      actions('GuardianAccess', ['View', 'Manage'])
    );
    const revoked = setPermissionGrants(
      granted,
      [...getAffectedNodePermissionNames(node, 'View', false, granted)],
      false
    );
    expect(getChangedPermissionGrants(revoked, granted).map(({ name }) => name)).toEqual(
      actions('GuardianAccess', ['View', 'Manage'])
    );
  });

  it.each(['Student Directory', 'Documents & IDs'])(
    'revokes all mapped %s grants without touching sibling features or module visibility',
    (title) => {
      const catalogue = makeCatalogue(true);
      const node = getSidebarNode(title);
      const expected =
        title === 'Student Directory'
          ? [
              ...actions('StudentList'),
              ...actions('Overrides', ['Request', 'Approve']),
              ...actions('GuardianAccess', ['View', 'Manage']),
            ]
          : [...actions('Certificates'), ...actions('StudentICard')];
      const names = getNodeRevocationPermissionNames(node, catalogue);
      expect(names.sort()).toEqual(expected.sort());
      const revoked = setPermissionGrants(catalogue, names, false);
      expect(
        getChangedPermissionGrants(revoked, catalogue)
          .map(({ name }) => name)
          .sort()
      ).toEqual(expected.sort());
      expect(
        revoked
          .filter(({ name }) => siblingNames.includes(name))
          .every(({ isGranted }) => isGranted)
      ).toBe(true);
    }
  );

  it('keeps older and partial catalogues safe without inventing missing actions', () => {
    const oldNames = [
      ...actions('StudentList'),
      ...actions('Certificates'),
      ...actions('StudentICard'),
    ];
    const oldCatalogue = oldNames.map((name) => ({ name, isGranted: false }));
    const directory = getSidebarNode('Student Directory');
    expect(getNodeActionPermissionNames(directory, oldCatalogue).sort()).toEqual(
      actions('StudentList').sort()
    );
    expect(
      getNodeActionPermissionNames(
        getEditorNode('Student Directory', 'Historical entry requests'),
        oldCatalogue
      )
    ).toEqual([]);
    expect(
      getNodeActionPermissionNames(
        getEditorNode('Student Directory', 'Guardian portal access'),
        oldCatalogue
      )
    ).toEqual([]);
    const partial = [{ name: `${recordsRoot}.Certificates.View`, isGranted: false }];
    expect(getNodeActionPermissionNames(getSidebarNode('Documents & IDs'), partial)).toEqual([
      `${recordsRoot}.Certificates.View`,
    ]);
    expect(
      getNodeActionPermissionNamesForAction(
        getEditorNode('Documents & IDs', 'Identity cards').permissionName!,
        'Add',
        partial
      )
    ).toEqual([]);
    expect(getNodeActionPermissionNames(directory, [])).toEqual([]);
  });
});
