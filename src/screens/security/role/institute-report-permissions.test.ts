import { it, vi, expect, describe } from 'vitest';
import instituteSetupModule, { instituteSetupPaths } from 'src/constants/institute-setup';

import { getNodeActionPermissionNamesForAction } from './account-settings-permissions';

vi.mock('src/constants/icon-view', () => ({ default: () => null }));
const catalogue = ['View', 'Add'].map((action) => ({ name: `InstituteSetup.Reports.${action}`, isGranted: false }));

describe('Institute Setup Reports permissions', () => {
  it('keeps navigation visibility independent from the exact View permission', () => {
    const {items} = Object.values(instituteSetupModule)[0][0];
    expect(items.find((item) => item.path === instituteSetupPaths.reports)).toMatchObject({
      title: 'Reports', permissionName: 'InstituteSetup.Reports.View', visibilityPermissionName: 'ShikshaMitra.Module.InstituteSetup.Reports',
    });
  });
  it.each(['View', 'Add'] as const)('maps the existing %s action', (action) => {
    expect(getNodeActionPermissionNamesForAction('InstituteSetup.Reports.View', action, catalogue)).toEqual([`InstituteSetup.Reports.${action}`]);
  });
  it('does not invent Edit/Delete grants or grants absent from the server catalogue', () => {
    expect(getNodeActionPermissionNamesForAction('InstituteSetup.Reports.View', 'Delete', catalogue)).toEqual([]);
    expect(getNodeActionPermissionNamesForAction('InstituteSetup.Reports.View', 'Edit', catalogue)).toEqual([]);
    expect(getNodeActionPermissionNamesForAction('InstituteSetup.Reports.View', 'Add', [])).toEqual([]);
  });
});
