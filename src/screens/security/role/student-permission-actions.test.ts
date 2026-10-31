import { it, expect, describe } from 'vitest';
import { studentPath } from 'src/routes/paths';
import studentModule from 'src/constants/student-menu';

import { draftChanges, catalogueStates } from './permission-draft-state';
import { actionMatrixRows, filterMatrixRows } from './permission-matrix-model';
import {
  getNodeActionPermissionNames,
  getAffectedNodePermissionNames,
  getNodeActionPermissionNamesForAction,
} from './account-settings-permissions';

import type { PermissionCatalogue, CataloguePermission } from './permission-catalogue';

// Canonical Student feature inventory from the backend permission catalogue.
// Keep this explicit so an omitted navigation branch cannot silently hide a capability.
const features = [
  'Dashboard',
  'IdentityCompliance',
  'Reports',
  'Onboarding',
  'Admissions',
  'Admissions.Offerings',
  'Admissions.Inquiries',
  'Admissions.Workflows',
  'Admissions.Forms',
  'Admissions.Applications',
  'Admissions.Applicants',
  'Admissions.Assessments',
  'Admissions.Documents',
  'Admissions.Offers',
  'Admissions.Payments',
  'Admissions.Eligibility',
  'Admissions.Reviews',
  'Admissions.Seats',
  'Records.StudentList',
  'Records.HouseManagement',
  'Records.StudentICard',
  'Records.Certificates',
  'Records.Reports',
  'Records.Settings',
  'Records.Changes',
  'Records.Transitions',
  'Attendance.MarkAttendance',
  'Attendance.LeaveAndAbsent',
  'Attendance.Reports',
  'Attendance.Setting.LeaveType',
  'Notification.InquiryManagement',
  'Notification.RegistrationManagement',
  'Notification.AdmissionManagement',
  'Notification.StudentRecordManagement',
  'Notification.AttendanceManagement',
];
const names = [
  ...features.flatMap((feature) =>
    ['View', 'Add', 'Delete'].map((action) => `Students.${feature}.${action}`)
  ),
  ...['Records.Overrides', 'Records.GuardianAccess'].flatMap((feature) =>
    ['View', 'Add'].map((action) => `Students.${feature}.${action}`)
  ),
];
const entry = (name: string): CataloguePermission => ({
  name,
  displayName: name,
  isGranted: false,
  allowedProviders: [],
  grantedProviders: [],
});
const catalogue: PermissionCatalogue = {
  groups: [{ name: 'Students', displayName: 'Students', permissions: names.map(entry) }],
};
const navigation = studentModule()[studentPath][0].items;
const grants = names.map((name) => ({ name, isGranted: false }));
const role = { providerName: 'R', providerKey: 'Admissions staff' };
const user = { providerName: 'U', providerKey: 'student-permission-user' };

describe('complete Student permission editor contract', () => {
  it('reaches every canonical Student capability through the real navigation', () => {
    const resolved = getNodeActionPermissionNames({ children: navigation }, grants);
    expect(resolved.toSorted()).toEqual(names.toSorted());
    expect(new Set(resolved).size).toBe(resolved.length);
  });

  it('shows only View, Add/Update and Delete while keeping canonical Add payloads', () => {
    const actions = navigation.flatMap((node) =>
      actionMatrixRows(node, { catalogue, provider: role, states: {} }).flatMap(
        (row) => row.actions
      )
    );
    expect(new Set(actions.map((action) => action.label))).toEqual(
      new Set(['View', 'Add/Update', 'Delete'])
    );
    expect(
      actions
        .filter((action) => action.label === 'Add/Update')
        .every((action) => action.action === 'Add')
    ).toBe(true);
    expect(new Set(actions.flatMap((action) => action.names))).toEqual(new Set(names));
  });

  it('keeps all nested grants available when the rendered group is collapsed', () => {
    const admissions = navigation.find((node) => node.title === 'Admissions')!;
    const rows = actionMatrixRows(admissions, { catalogue, provider: role, states: {} });
    const group = rows.find((row) => row.group && row.title === 'Pipeline')!;
    expect(group).toBeDefined();
    const visible = filterMatrixRows(rows, '', false, new Set([group.id]));
    expect(visible.some((row) => row.ancestors.includes(group.id))).toBe(false);
    const targets = getNodeActionPermissionNames(admissions, grants);
    expect(new Set(targets)).toEqual(
      new Set(names.filter((name) => name.startsWith('Students.Admissions.')))
    );
    expect(new Set(targets).size).toBe(targets.length);
  });

  it.each(['Records.Overrides', 'Records.GuardianAccess'])(
    'leaves unsupported %s Delete unavailable',
    (feature) => {
      const node = { title: feature, permissionName: `Students.${feature}.View` };
      const [row] = actionMatrixRows(node, { catalogue, provider: role, states: {} });
      expect(row.actions.find((action) => action.action === 'Delete')).toMatchObject({
        names: [],
        editable: false,
        result: 'Unavailable',
      });
      expect(getNodeActionPermissionNames(node, grants)).toEqual([
        `Students.${feature}.View`,
        `Students.${feature}.Add`,
      ]);
      expect(getAffectedNodePermissionNames(node, 'Delete', true, grants)).toEqual(new Set());
    }
  );

  it('resolves Add-guarded Onboarding Settings without inventing nested permission IDs', () => {
    expect(getNodeActionPermissionNamesForAction('Students.Onboarding.Add', 'Add', grants)).toEqual(
      ['Students.Onboarding.Add']
    );
    expect(
      getAffectedNodePermissionNames(
        { permissionName: 'Students.Onboarding.Add' },
        'Add',
        true,
        grants
      )
    ).toEqual(new Set(['Students.Onboarding.Add', 'Students.Onboarding.View']));
  });

  it('preserves approved View/Add/Delete grant dependencies', () => {
    const node = { permissionName: 'Students.Admissions.Applications.View' };
    const capabilityNames = ['View', 'Add', 'Delete'].map(
      (action) => `Students.Admissions.Applications.${action}`
    );
    expect(getAffectedNodePermissionNames(node, 'Delete', true, grants)).toEqual(
      new Set(capabilityNames)
    );
    expect(getAffectedNodePermissionNames(node, 'View', false, grants)).toEqual(
      new Set(capabilityNames)
    );
    expect(getAffectedNodePermissionNames(node, 'Add', false, grants)).toEqual(
      new Set([capabilityNames[1]])
    );
  });
});

describe('Student user exceptions', () => {
  const base = 'Students.Records.Changes';
  const add = `${base}.Add`;
  const node = { title: 'Record changes', permissionName: `${base}.View` };
  const roleCatalogue: PermissionCatalogue = {
    groups: [
      {
        name: 'Students',
        displayName: 'Students',
        permissions: ['View', 'Add', 'Delete'].map((action) => ({
          ...entry(`${base}.${action}`),
          isGranted: true,
          grantedProviders: [role],
        })),
      },
    ],
  };
  const writeAction = (source: PermissionCatalogue, states = catalogueStates(source, user)) =>
    actionMatrixRows(node, { catalogue: source, provider: user, states })[0].actions.find(
      (action) => action.action === 'Add'
    )!;

  it('follows inherited grants without manufacturing a direct user grant', () => {
    expect(writeAction(roleCatalogue)).toMatchObject({
      label: 'Add/Update',
      rule: 'inherit',
      result: 'Allowed',
      overridden: false,
    });
    expect(draftChanges(roleCatalogue, user, catalogueStates(roleCatalogue, user))).toEqual([]);
  });

  it('keeps a Deny effective over role access and restores inheritance with Follow role', () => {
    const denied: PermissionCatalogue = { ...roleCatalogue, overrides: { [add]: 'deny' } };
    expect(writeAction(denied)).toMatchObject({
      rule: 'deny',
      result: 'Denied',
      roleResult: 'Allowed',
      overridden: true,
    });
    const followRole = { ...catalogueStates(denied, user), [add]: 'inherit' as const };
    expect(writeAction(denied, followRole)).toMatchObject({
      rule: 'inherit',
      result: 'Allowed',
      overridden: false,
    });
    expect(draftChanges(denied, user, followRole)).toEqual([{ name: add, state: 'inherit' }]);
  });

  it('retains explicit Allow after a role grant is removed', () => {
    const allowed: PermissionCatalogue = {
      ...roleCatalogue,
      groups: [
        {
          ...roleCatalogue.groups[0],
          permissions: roleCatalogue.groups[0].permissions.map((permission) => ({
            ...permission,
            grantedProviders: [],
          })),
        },
      ],
      overrides: { [add]: 'allow' },
    };
    expect(writeAction(allowed)).toMatchObject({
      rule: 'allow',
      result: 'Allowed',
      roleResult: 'Denied',
      overridden: true,
    });
  });

  it('respects provider eligibility for Student Add/Update', () => {
    const restricted: PermissionCatalogue = {
      ...roleCatalogue,
      groups: [
        {
          ...roleCatalogue.groups[0],
          permissions: roleCatalogue.groups[0].permissions.map((permission) => ({
            ...permission,
            allowedProviders: ['R'],
          })),
        },
      ],
    };
    expect(writeAction(restricted)).toMatchObject({ editable: false, label: 'Add/Update' });
  });
});
