import { describe, expect, it } from 'vitest';

import { studentPath } from 'src/routes/paths';
import { catalogueStates, draftChanges } from 'src/screens/security/role/permission-draft-state';
import { actionMatrixRows } from 'src/screens/security/role/permission-matrix-model';
import { getNodeActionPermissionNamesForAction } from 'src/screens/security/role/account-settings-permissions';

import studentModule, { studentPermissions } from './student-menu';

const features = ['Records.StudentList', 'Records.Changes', 'Records.Transitions',
  'Records.Overrides', 'Records.GuardianAccess', 'IdentityCompliance'];
const names = features.flatMap((feature) =>
  (['Records.Overrides', 'Records.GuardianAccess'].includes(feature) ? ['View', 'Add'] : ['View', 'Add', 'Delete'])
    .map((action) => `Students.${feature}.${action}`));
const provider = { providerName: 'U', providerKey: 'profile-user' };
const catalogue = { groups: [{ name: 'Students', displayName: 'Students', permissions: names.map((name, i) => ({
  name, displayName: name, isGranted: i % 2 === 0, allowedProviders: [],
  grantedProviders: i % 2 === 0 ? [{ providerName: 'R', providerKey: 'staff' }] : [],
})) }], overrides: { 'Students.Records.Changes.Add': 'deny' as const } };
const records = studentModule()[studentPath][0].items.find((node) => node.title === 'Student Records')!;

describe('Student Records menu-aligned permission matrix', () => {
  it('renders only the actual Records menu entries', () => {
    const rows = actionMatrixRows(records, { catalogue, provider, states: catalogueStates(catalogue, provider) });
    expect(rows.filter((row) => !row.group).map((row) => row.title)).toEqual([
      'Student List', 'House Management', 'Student I-Card', 'Certificates',
      'Records reports', 'Student reports', 'Settings',
    ]);
  });

  it.each(['View', 'Add', 'Delete'])('keeps existing %s workflow grants manageable through Student List', (action) => {
    expect(getNodeActionPermissionNamesForAction(studentPermissions.records.studentList, action,
      catalogue.groups[0].permissions).toSorted()).toEqual(names.filter((name) => name.endsWith(`.${action}`)).toSorted());
  });

  it('keeps the navigation guard on StudentList.View', () => {
    expect(records.children?.find((node) => node.title === 'Student List')?.permissionName)
      .toBe('Students.Records.StudentList.View');
  });

  it('preserves existing partial grants and explicit denials until an administrator edits them', () => {
    const states = catalogueStates(catalogue, provider);
    actionMatrixRows(records, { catalogue, provider, states });
    expect(states['Students.Records.Changes.Add']).toBe('deny');
    expect(draftChanges(catalogue, provider, states)).toEqual([]);
  });
});
