import { it, expect, describe } from 'vitest';
import studentModule, {
  studentPermissions,
  studentVisibilityPermissions,
} from 'src/constants/student-menu';

import { missingVisibility, buildVisibilityPrerequisites } from './visibility-prerequisites';

import type { PermissionCatalogue, NavigationPermission } from './permission-catalogue';

const moduleName = 'ShikshaMitra.Module.HR';
const feature = `${moduleName}.Employee`;
const action = 'HR.Employee.EmployeeList.Edit';
const provider = { providerName: 'U', providerKey: 'user' };
const navigation: NavigationPermission[] = [
  {
    title: 'HR',
    permissionName: moduleName,
    submodule: [
      {
        title: 'Staff',
        permissionName: feature,
        children: [
          {
            title: 'Employee List',
            permissionName: 'HR.Employee.EmployeeList.View',
          },
        ],
      },
    ],
  },
];
const catalogue = (inherited = false): PermissionCatalogue => ({
  groups: [
    {
      name: 'HR',
      displayName: 'HR',
      permissions: [moduleName, feature, action].map((name) => ({
        name,
        displayName: name,
        isGranted: inherited,
        allowedProviders: [],
        grantedProviders: inherited ? [{ providerName: 'R', providerKey: 'HR Manager' }] : [],
      })),
    },
  ],
});

describe('visibility prerequisites', () => {
  it('maps House Management actions through the existing Student and Records visibility flags', () => {
    const items = Object.values(studentModule()).flatMap((sections) =>
      sections.flatMap((section) => section.items)
    );
    const prerequisites = buildVisibilityPrerequisites([
      { title: 'Student', permissionName: studentPermissions.root, submodule: items },
    ]);
    expect(prerequisites['Students.Records.HouseManagement']).toEqual([
      [studentPermissions.root, studentVisibilityPermissions.records],
    ]);
  });
  const index = () => buildVisibilityPrerequisites(navigation);
  it('requires both module and feature visibility for an action', () => {
    expect(missingVisibility([action], index(), catalogue(), provider, {})).toEqual([
      moduleName,
      feature,
    ]);
  });
  it('uses inherited visibility and honors an explicit user denial', () => {
    expect(missingVisibility([action], index(), catalogue(true), provider, {})).toEqual([]);
    expect(
      missingVisibility([action], index(), catalogue(true), provider, { [feature]: 'deny' })
    ).toEqual([feature]);
  });
  it('recognizes visibility grants in the same unsaved draft', () => {
    expect(
      missingVisibility([action], index(), catalogue(), provider, {
        [moduleName]: 'allow',
        [feature]: 'allow',
      })
    ).toEqual([]);
  });
  it('requires absent catalogue flags and does not invent dependencies for API-only actions', () => {
    expect(missingVisibility([action], index(), { groups: [] }, provider, {})).toEqual([
      moduleName,
      feature,
    ]);
    expect(missingVisibility(['API.Only.Edit'], index(), catalogue(), provider, {})).toEqual([]);
    expect(missingVisibility([`${action}Other`], index(), catalogue(), provider, {})).toEqual([
      moduleName,
      feature,
    ]);
    expect(
      missingVisibility(['HR.Employee.EmployeeListOther.Edit'], index(), catalogue(), provider, {})
    ).toEqual([]);
  });
  it('accepts any complete configured path for a feature shown in multiple places', () => {
    const alternate = buildVisibilityPrerequisites([
      ...navigation,
      {
        title: 'Alternative',
        permissionName: 'ShikshaMitra.Module.Security',
        children: [
          {
            title: 'Employee',
            permissionName: 'HR.Employee.EmployeeList.View',
          },
        ],
      },
    ]);
    const source = catalogue();
    source.groups[0].permissions.push({
      name: 'ShikshaMitra.Module.Security',
      displayName: 'Security',
      isGranted: false,
      allowedProviders: [],
      grantedProviders: [],
    });
    expect(
      missingVisibility([action], alternate, source, provider, {
        'ShikshaMitra.Module.Security': 'allow',
      })
    ).toEqual([]);
  });
  it('prefers an available prerequisite path over a shorter provider-ineligible path', () => {
    const alternateIndex = {
      'HR.Employee.EmployeeList': [['ShikshaMitra.Module.Restricted'], [moduleName, feature]],
    };
    const source = catalogue();
    source.groups[0].permissions.push({
      name: 'ShikshaMitra.Module.Restricted',
      displayName: 'Restricted',
      isGranted: false,
      allowedProviders: ['R'],
      grantedProviders: [],
    });
    expect(missingVisibility([action], alternateIndex, source, provider, {})).toEqual([moduleName, feature]);
  });
});
