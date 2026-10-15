import { it, expect, describe } from 'vitest';

import { getNodePermissionActions, getNodeActionPermissionNamesForAction } from './account-settings-permissions';

const base = 'InstituteSetup.SchoolIdentity';
const catalogue = ['View', 'ManageDefaults', 'ManageOverrides', 'AccessSignature'].map((action) => ({
  name: `${base}.${action}`, isGranted: false,
}));

describe('School Identity permission grouping', () => {
  it('keeps the existing compact controls and exposes no invented Delete operation', () => {
    expect(getNodePermissionActions(`${base}.View`, catalogue)).toEqual(['View', 'Add', 'Delete']);
    expect(getNodeActionPermissionNamesForAction(`${base}.View`, 'Delete', catalogue)).toEqual([]);
  });

  it('maps View separately and groups only existing write/signature capabilities', () => {
    expect(getNodeActionPermissionNamesForAction(`${base}.View`, 'View', catalogue)).toEqual([`${base}.View`]);
    expect(getNodeActionPermissionNamesForAction(`${base}.View`, 'Add', catalogue)).toEqual([
      `${base}.ManageDefaults`, `${base}.ManageOverrides`, `${base}.AccessSignature`,
    ]);
  });

  it('does not create a signature grant when the server catalogue excludes it', () => {
    expect(getNodeActionPermissionNamesForAction(`${base}.View`, 'Add', catalogue.slice(0, 3))).not.toContain(`${base}.AccessSignature`);
  });
});
