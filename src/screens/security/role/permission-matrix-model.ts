import { getPermissionChildren } from './utils';
import { catalogueEntries } from './permission-catalogue';
import { matrixAction } from './permission-matrix-action';
import {
  getNodePermissionActions,
  getNodeActionPermissionNamesForAction,
} from './account-settings-permissions';

import type { PermissionStates } from './permission-draft-state';
import type {
  GrantProvider,
  VisibilityPanel,
  PermissionCatalogue,
  CataloguePermission,
  NavigationPermission,
  PermissionOverrideState,
} from './permission-catalogue';

export { matrixAction } from './permission-matrix-action';

export type MatrixAction = {
  action: string;
  label: string;
  names: string[];
  rule: PermissionOverrideState | 'mixed';
  result: 'Allowed' | 'Denied' | 'Mixed access' | 'Visible' | 'Hidden' | 'Unavailable';
  roleResult: 'Allowed' | 'Denied' | 'Mixed access';
  sources: string[];
  editable: boolean;
  overridden: boolean;
  hasDirect: boolean;
};
export type MatrixRow = {
  id: string;
  title: string;
  depth: number;
  ancestors: string[];
  node: NavigationPermission;
  group: boolean;
  actions: MatrixAction[];
};
export type MatrixModel = {
  catalogue: PermissionCatalogue;
  provider: GrantProvider;
  states: PermissionStates;
  entries?: Map<string, CataloguePermission>;
};

export function actionMatrixRows(selected: NavigationPermission, model: MatrixModel): MatrixRow[] {
  const cached = { ...model, entries: modelEntries(model) };
  const grants = catalogueEntries(model.catalogue).map((entry) => ({
    name: entry.name,
    isGranted: model.states[entry.name] === 'allow',
  }));
  const visit = (node: NavigationPermission, id: string, ancestors: string[]): MatrixRow[] => {
    const children: NavigationPermission[] = getPermissionChildren(node);
    const row: MatrixRow = {
      id,
      title: node.title,
      depth: ancestors.length,
      ancestors,
      node,
      group: children.length > 0,
      actions: children.length
        ? []
        : getNodePermissionActions(node.permissionName ?? [], grants).map((action) =>
            matrixAction(
              getNodeActionPermissionNamesForAction(node.permissionName ?? [], action, grants),
              action,
              cached
            )
          ),
    };
    return [
      row,
      ...children.flatMap((child, index) => visit(child, `${id}-${index}`, [...ancestors, id])),
    ];
  };
  const children: NavigationPermission[] = getPermissionChildren(selected);
  const rows = (children.length ? children : [selected]).flatMap((node, index) =>
    visit(node, `feature-${index}`, [])
  );
  return rows.some((row) => row.actions.length) ? rows : [];
}

export function visibilityMatrixRows(panel: VisibilityPanel, model: MatrixModel): MatrixRow[] {
  const cached = { ...model, entries: modelEntries(model) };
  const items = [
    ...(panel.permissionName
      ? [{ title: `${panel.title} module`, permissionName: panel.permissionName }]
      : []),
    ...panel.submodule,
  ];
  return items.map((node, index) => ({
    id: `visibility-${index}`,
    title: node.title,
    depth: 0,
    ancestors: [],
    node,
    group: false,
    actions: [matrixAction([node.permissionName], 'Visible', cached, true)],
  }));
}

export function filterMatrixRows(
  rows: MatrixRow[],
  search: string,
  onlyOverrides: boolean,
  collapsed: Set<string>
) {
  const query = search.trim().toLocaleLowerCase();
  if (!query && !onlyOverrides)
    return rows.filter((row) => row.ancestors.every((id) => !collapsed.has(id)));
  const matches = rows.filter(
    (row) =>
      row.title.toLocaleLowerCase().includes(query) &&
      (!onlyOverrides || row.actions.some((action) => action.overridden))
  );
  const visible = new Set(matches.flatMap((row) => [row.id, ...row.ancestors]));
  return rows.filter(
    (row) =>
      visible.has(row.id) ||
      row.ancestors.some((id) => matches.some((match) => match.group && match.id === id))
  );
}

const modelEntries = (model: MatrixModel) =>
  model.entries ?? new Map(catalogueEntries(model.catalogue).map((entry) => [entry.name, entry]));
