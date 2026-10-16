import { settingPath } from 'src/routes/paths';
import { it, vi, expect, describe } from 'vitest';
import instituteSetupModule from 'src/constants/institute-setup';

import { actionMatrixRows } from './permission-matrix-model';
import { buildVisibilityPanels } from './permission-catalogue';
import { getNodeActionPermissionNames } from './account-settings-permissions';

import type { PermissionCatalogue } from './permission-catalogue';

vi.mock('src/constants/icon-view', () => ({ default: () => null }));

const nodes = instituteSetupModule[settingPath].flatMap((group) => group.items);
const actions = ['View', 'Add', 'Edit', 'Delete'];
const catalogue: PermissionCatalogue = {
  groups: [{ name: 'InstituteSetup', displayName: 'Institute Setup', permissions:
    ['ShiftManagement', 'AcademicSetup'].flatMap((feature) => [
      `ShikshaMitra.Module.InstituteSetup.${feature}`,
      ...actions.map((action) => `InstituteSetup.${feature}.${action}`),
    ]).map((name) => ({ name, displayName: name, isGranted: false,
      allowedProviders: [], grantedProviders: [] })),
  }],
};

describe.each([
  ['Shift Management', 'ShiftManagement'], ['Academic Setup', 'AcademicSetup'],
])('%s action catalogue mapping', (title, feature) => {
  const node = nodes.find((item) => item.title === title)!;
  const names = actions.map((action) => `InstituteSetup.${feature}.${action}`);

  it.each(['R', 'U'])('renders every existing action for provider %s', (providerName) => {
    const rows = actionMatrixRows(node, {
      catalogue, provider: { providerName, providerKey: 'synthetic' }, states: {},
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].actions.map((action) => action.label)).toEqual(actions);
    expect(rows[0].actions.flatMap((action) => action.names)).toEqual(names);
    expect(rows[0].actions.every((action) => action.editable)).toBe(true);
    expect(getNodeActionPermissionNames(node, catalogue.groups[0].permissions)).toEqual(names);
  });

  it('preserves the separate navigation visibility flag', () => {
    expect(node.permissionName).toBe(`ShikshaMitra.Module.InstituteSetup.${feature}`);
    const panels = buildVisibilityPanels([{
      title: 'Institute Setup', submodule: [node],
    }]);
    expect(panels[0].submodule).toEqual([{
      title, permissionName: `ShikshaMitra.Module.InstituteSetup.${feature}`,
    }]);
  });

  it('does not manufacture actions missing from the server catalogue', () => {
    const rows = actionMatrixRows(node, {
      catalogue: { groups: [] }, provider: { providerName: 'U', providerKey: 'synthetic' }, states: {},
    });
    expect(rows).toEqual([]);
  });
});
