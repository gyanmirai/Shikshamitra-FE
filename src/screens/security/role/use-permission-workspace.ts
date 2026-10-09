'use client';

import { useMemo, useState } from 'react';
import { fullSecurityNavData } from 'src/layouts/config-nav-dashboard';

import { getAffectedNodePermissionNames } from './account-settings-permissions';
import { actionMatrixRows, visibilityMatrixRows } from './permission-matrix-model';
import {
  canManageGrant,
  catalogueEntries,
  inheritedSources,
  buildVisibilityPanels,
} from './permission-catalogue';

import type { PermissionWorkspaceProps } from './permission-workspace';
import type { MatrixRow, MatrixAction } from './permission-matrix-model';
import type { NavigationPermission, PermissionOverrideState } from './permission-catalogue';

export function usePermissionWorkspace({
  catalogue,
  provider,
  states,
  setStates,
  disabled,
  visibility = false,
}: PermissionWorkspaceProps) {
  const [modules] = useState<NavigationPermission[]>(() =>
    fullSecurityNavData().flatMap((group) => group.items)
  );
  const [moduleTitle, setModuleTitle] = useState('');
  const [submoduleTitle, setSubmoduleTitle] = useState('');
  const [dependencyNote, setDependencyNote] = useState('');
  const module = modules.find((item) => item.title === moduleTitle);
  const selected = module?.submodule?.length
    ? module.submodule.find((item) => item.title === submoduleTitle)
    : module;
  const visibilityPanels = visibility
    ? buildVisibilityPanels(catalogueEntries(catalogue), modules)
    : [];
  const navigation = visibility
    ? visibilityPanels.map((panel) => ({ title: panel.title, icon: panel.icon }))
    : modules;
  const user = provider.providerName === 'U';
  /** Memoization Justification: flattening the catalogue and mapping grouped actions scans
   * hundreds of server entries; navigation-only renders reuse the derived matrix. */
  const rows = useMemo(() => {
    const model = { catalogue, provider, states };
    if (!visibility) return selected ? actionMatrixRows(selected, model) : [];
    const panel = buildVisibilityPanels(catalogueEntries(catalogue), modules).find(
      (item) => item.title === moduleTitle
    );
    return panel ? visibilityMatrixRows(panel, model) : [];
  }, [catalogue, provider, states, visibility, selected, modules, moduleTitle]);
  const sources = user
    ? [
        ...new Set(
          catalogueEntries(catalogue).flatMap((entry) =>
            inheritedSources(entry, provider)
              .filter((source) => source.providerName === 'R')
              .map((source) => source.providerKey)
          )
        ),
      ]
    : [];
  const change = (row: MatrixRow, action: MatrixAction, state: PermissionOverrideState) => {
    if (disabled || !action.editable) return;
    const grants = catalogueEntries(catalogue).map((entry) => ({
      name: entry.name,
      isGranted: states[entry.name] === 'allow',
    }));
    const names =
      visibility || (user && state === 'inherit')
        ? action.names
        : [...getAffectedNodePermissionNames(row.node, action.action, state === 'allow', grants)];
    const extras = names.filter((name) => !action.names.includes(name));
    setDependencyNote(
      extras.length
        ? `${action.label} also updates ${extras.length} related ${extras.length === 1 ? 'permission' : 'permissions'} required by the existing action rules. Review the full change list before saving.`
        : ''
    );
    const manageable = new Set(
      catalogueEntries(catalogue)
        .filter((entry) => canManageGrant(entry, provider))
        .map((entry) => entry.name)
    );
    setStates(
      names.filter((name) => manageable.has(name)),
      state
    );
  };
  const onModule = (node: NavigationPermission) => {
    if (node.title === moduleTitle) return;
    setModuleTitle(node.title);
    setSubmoduleTitle('');
    setDependencyNote('');
  };

  return {
    moduleTitle,
    submoduleTitle,
    dependencyNote,
    selected,
    navigation,
    user,
    rows,
    sources,
    change,
    onModule,
    setSubmoduleTitle,
    setDependencyNote,
  };
}
