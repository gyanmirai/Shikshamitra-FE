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
  path?: string;
  permissionName?: string | string[];
  children?: PermissionNode[];
  permissionChildren?: PermissionNode[];
  submodule?: PermissionNode[];
};

const prefix = 'Students.Records.';
const actions = (feature: string, names = ['View', 'Add', 'Delete']) =>
  names.map((action) => `${prefix}${feature}.${action}`);
const catalogue = [
  ...actions('StudentList'),
  ...actions('StudentICard'),
  ...actions('Certificates'),
  ...actions('Reports'),
  ...actions('Settings'),
  ...actions('Overrides', ['Request', 'Approve']),
  ...actions('GuardianAccess', ['View', 'Manage']),
  ...actions('Changes', ['View', 'Create', 'Approve']),
  ...actions('Transitions', ['View', 'Create', 'Approve']),
  'ShikshaMitra.Module.Students.Records',
].map((name) => ({ name, isGranted: false }));

function recordsNavigation(): PermissionNode {
  const student = (fullSecurityNavData() as { items: PermissionNode[] }[])
    .flatMap((group) => group.items)
    .find((node) => node.title === 'Student');
  const records = student?.submodule?.find((node) => node.title === 'Student Records');
  if (!records) throw new Error('Student Records navigation is missing.');
  return records;
}

function submodule(title: string): PermissionNode {
  const node = recordsNavigation().children?.find((child) => child.title === title);
  if (!node) throw new Error(`Student Records submodule ${title} is missing.`);
  return node;
}

function studentListPermission(title: string): PermissionNode {
  const node = (getPermissionChildren(submodule('Student List')) as PermissionNode[]).find(
    (child) => child.title === title
  );
  if (!node) throw new Error(`Student List permission ${title} is missing.`);
  return node;
}

describe('Student Records security navigation', () => {
  it('uses the five Student Records submodules and their routes', () => {
    const records = recordsNavigation();
    expect(records.children?.map((node) => [node.title, node.path])).toEqual([
      ['Student List', '/student/profile'],
      ['Student I-Card', '/student/student-i-card'],
      ['Certificates', '/student/certificates'],
      ['Reports', '/student/reports'],
      ['Settings', '/student/studentRecords/setting'],
    ]);
  });

  it.each([
    ['Student I-Card', 'StudentICard'],
    ['Certificates', 'Certificates'],
    ['Reports', 'Reports'],
    ['Settings', 'Settings'],
  ])('maps %s to its exact backend action bundle', (title, feature) => {
    expect(getNodeActionPermissionNames(submodule(title), catalogue)).toEqual(actions(feature));
  });

  it.each([
    ['Historical entry requests', 'Request'],
    ['Historical entry approvals', 'Approve'],
  ])('keeps %s separate from the other approval action', (title, action) => {
    const node = studentListPermission(title);
    const names = [...getAffectedNodePermissionNames(node, 'Add', true, catalogue)];
    const updated = setPermissionGrants(catalogue, names, true);
    expect(getChangedPermissionGrants(updated, catalogue)).toEqual([
      { name: `${prefix}Overrides.${action}`, isGranted: true },
    ]);
    expect(
      getNodeActionPermissionNamesForAction(node.permissionName!, 'Delete', catalogue)
    ).toEqual([]);
  });

  it('keeps guardian grants distinct from profile grants', () => {
    const node = studentListPermission('Guardian portal access');
    expect(getNodeActionPermissionNamesForAction(node.permissionName!, 'View', catalogue)).toEqual(
      actions('GuardianAccess', ['View'])
    );
    expect(getNodeActionPermissionNamesForAction(node.permissionName!, 'Add', catalogue)).toEqual(
      actions('GuardianAccess', ['Manage'])
    );
    expect(
      getNodeActionPermissionNamesForAction(node.permissionName!, 'Delete', catalogue)
    ).toEqual([]);
  });

  it('revokes one submodule without touching its sibling or hidden workflow grants', () => {
    const granted = catalogue.map((permission) => ({ ...permission, isGranted: true }));
    const names = getNodeRevocationPermissionNames(submodule('Certificates'), granted);
    expect(names.sort()).toEqual(actions('Certificates').sort());
    const updated = setPermissionGrants(granted, names, false);
    expect(
      getChangedPermissionGrants(updated, granted)
        .map(({ name }) => name)
        .sort()
    ).toEqual(actions('Certificates').sort());
    expect(
      updated
        .filter((permission) => !actions('Certificates').includes(permission.name))
        .every((permission) => permission.isGranted)
    ).toBe(true);
  });

  it('does not invent unavailable actions in a partial catalogue', () => {
    const partial = [{ name: `${prefix}StudentICard.View`, isGranted: false }];
    expect(getNodeActionPermissionNames(submodule('Student I-Card'), partial)).toEqual([
      `${prefix}StudentICard.View`,
    ]);
    expect(
      getNodeActionPermissionNamesForAction(
        submodule('Student I-Card').permissionName!,
        'Add',
        partial
      )
    ).toEqual([]);
  });
});
