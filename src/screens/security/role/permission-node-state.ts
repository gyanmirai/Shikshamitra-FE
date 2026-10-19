import { groupGrantState } from './effective-permission-grants';
import { isFinancePermissionGroup } from './finance-permission-groups';
import {
  getActionPermissionBase, getNodePermissionActions,
  isAccountSettingPermission, isStatutorySchemePermission, isFinanceConfigurationPermission,
  getNodeRevocationPermissionNames, getNodeActionPermissionNamesForAction,
} from './account-settings-permissions';

import type { PermissionNodeProps } from './permission-node-types';

export function permissionNodeState({ node, permissions, inherited = new Map(), manageableNames }: PermissionNodeProps) {
  const base = getActionPermissionBase(node.permissionName);
  const isStatutoryScheme = isStatutorySchemePermission(base);
  const actions = getNodePermissionActions(node.permissionName ?? [], permissions);
  const availableNames = actions.flatMap((action) =>
    getNodeActionPermissionNamesForAction(node.permissionName ?? [], action, permissions));
  const incomplete = !availableNames.length ||
    (isAccountSettingPermission(base) && actions.length < 2) ||
    (isFinanceConfigurationPermission(base) && actions.length < 3);
  const state = groupGrantState(availableNames, permissions, inherited);
  const editableNames = availableNames.filter((name) => !manageableNames || manageableNames.has(name));
  const directState = groupGrantState(editableNames, permissions, new Map());
  const revokeFeature = isStatutoryScheme || isFinancePermissionGroup(base);
  const revocationNames = revokeFeature ? getNodeRevocationPermissionNames(node, permissions) : availableNames;
  const { hasDirect } = groupGrantState(revocationNames.filter((name) => !manageableNames || manageableNames.has(name)), permissions, new Map());
  const canRevoke = directState.checked || (hasDirect && (revokeFeature || state.sources.length > 0));
  return { actions, availableNames, incomplete, state, editableNames, canRevoke, isStatutoryScheme,
    fullySelected: state.checked, inheritedOnly: state.inheritedOnly && !hasDirect };
}
