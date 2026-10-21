import { it, expect, describe } from 'vitest';
import instituteSetupModule, { instituteSetupPaths } from 'src/constants/institute-setup';

import { getNodeActionPermissionNamesForAction } from './account-settings-permissions';

const base = 'InstituteSetup.SchoolDocuments';
const catalogue = ['View', 'Add', 'Delete'].map((action) => ({
  name: `${base}.${action}`,
  isGranted: false,
}));

describe('School Documents menu and permission grouping', () => {
  it.each(['View', 'Add', 'Delete'] as const)('maps only the exact %s permission', (action) => {
    expect(getNodeActionPermissionNamesForAction(`${base}.View`, action, catalogue)).toEqual([
      `${base}.${action}`,
    ]);
    expect(getNodeActionPermissionNamesForAction(`${base}.View`, action, [])).toEqual([]);
  });

  it('appears directly after School Identity with independent action and visibility grants', () => {
    const [{ items }] = Object.values(instituteSetupModule)[0];
    const index = items.findIndex((item) => item.path === instituteSetupPaths.schoolIdentity);
    expect(items[index + 1]).toMatchObject({
      title: 'School Documents',
      path: '/setting/school-documents',
      permissionName: `${base}.View`,
      visibilityPermissionName: 'ShikshaMitra.Module.InstituteSetup.SchoolDocuments',
    });
  });
});
