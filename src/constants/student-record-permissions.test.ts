import { it, expect, describe } from 'vitest';
import { fullSecurityNavData } from 'src/layouts/config-nav-dashboard';
import {
  setPermissionGrants,
  getChangedPermissionGrants,
} from 'src/screens/security/role/permission-grants';
import {
  getNodeActionPermissionNames,
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
  ...actions('HouseManagement'),
  ...actions('StudentICard'),
  ...actions('Certificates'),
  ...actions('Reports'),
  ...actions('Settings'),
  ...actions('Overrides', ['View', 'Add']),
  ...actions('GuardianAccess', ['View', 'Add']),
  ...actions('Changes'),
  ...actions('Transitions'),
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

describe('Student Records security navigation', () => {
  it('uses the six current Student Records submodules and their routes', () => {
    const records = recordsNavigation();
    expect(records.children?.map((node) => [node.title, node.path])).toEqual([
      ['Student List', '/student/profile'],
      ['House Management', '/student/records/houses'],
      ['Student I-Card', '/student/student-i-card'],
      ['Certificates', '/student/certificates'],
      ['Reports', '/student/reports'],
      ['Settings', '/student/studentRecords/setting'],
    ]);
  });

  it.each([
    ['House Management', 'HouseManagement'],
    ['Student I-Card', 'StudentICard'],
    ['Certificates', 'Certificates'],
    ['Reports', 'Reports'],
    ['Settings', 'Settings'],
  ])('maps %s to its exact backend action bundle', (title, feature) => {
    expect(getNodeActionPermissionNames(submodule(title), catalogue)).toEqual(actions(feature));
  });

  it('retains historical workflow identifiers without inventing Delete', () => {
    const node = { permissionName: `${prefix}Overrides.View` };
    expect(getNodeActionPermissionNamesForAction(node.permissionName!, 'View', catalogue)).toEqual(actions('Overrides', ['View']));
    expect(getNodeActionPermissionNamesForAction(node.permissionName!, 'Add', catalogue)).toEqual(actions('Overrides', ['Add']));
    expect(getNodeActionPermissionNamesForAction(node.permissionName!, 'Delete', catalogue)).toEqual([]);
  });

  it('keeps guardian workflow identifiers distinct from profile guards', () => {
    const node = { permissionName: `${prefix}GuardianAccess.View` };
    expect(getNodeActionPermissionNamesForAction(node.permissionName!, 'View', catalogue)).toEqual(
      actions('GuardianAccess', ['View'])
    );
    expect(getNodeActionPermissionNamesForAction(node.permissionName!, 'Add', catalogue)).toEqual(
      actions('GuardianAccess', ['Add'])
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
