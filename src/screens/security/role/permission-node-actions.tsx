import Box from '@mui/material/Box';

import PermissionGrantSwitch from './permission-grant-switch';
import { groupGrantState } from './effective-permission-grants';
import { useUserPermissionOverrides } from './user-permission-context';
import { getAffectedNodePermissionNames, getNodeActionPermissionNamesForAction } from './account-settings-permissions';

import type { PermissionNodeProps } from './permission-node-types';

export default function PermissionNodeActions({
  node,
  permissions,
  onToggle,
  disabled,
  inherited,
  actions,
  isStatutoryScheme,
  manageableNames,
}: Pick<PermissionNodeProps, 'node' | 'permissions' | 'onToggle' | 'disabled'> & {
  inherited: Map<string, string[]>;
  actions: string[];
  isStatutoryScheme: boolean;
  manageableNames?: Set<string>;
}) {
  const overrides = useUserPermissionOverrides();
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 2 }}>
      {actions.map((action) => {
        const names = getNodeActionPermissionNamesForAction(
          node.permissionName ?? [],
          action,
          permissions
        );
        const state = groupGrantState(names, permissions, inherited);
        const { checked } = state;
        const explanation =
          [
            isStatutoryScheme && action === 'Edit'
              ? 'Edit settings, activate the scheme, manage enrollment and approve overrides.'
              : '',
          ]
            .filter(Boolean)
            .join(' ') || undefined;
        return (
            <Box
              key={action}
              title={
                isStatutoryScheme && action === 'Delete' && !names.length
                  ? 'Deletion is not supported for Statutory Schemes.'
                  : undefined
              }
              sx={{
                opacity: names.length ? 1 : 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <PermissionGrantSwitch
                names={names}
                onOverrideChange={(overrideState) => overrides?.setStates(overrideState === 'inherit' ? names
                  : [...getAffectedNodePermissionNames(node, action, overrideState === 'allow', permissions)], overrideState)}
                ariaLabel={action}
                label={action === 'ChangeStatus' ? 'Change Status' : action}
                {...state}
                help={explanation}
                disabled={disabled || !names.length || names.some((name) => manageableNames && !manageableNames.has(name))}
                onChange={() => onToggle(node, action, checked)}
              />
            </Box>
        );
      })}
    </Box>
  );
}
