import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import PermissionUnavailable from './permission-unavailable';
import PermissionNodeActions from './permission-node-actions';
import { permissionNodeState } from './permission-node-state';
import PermissionNodeChildren from './permission-node-children';
import { groupGrantState } from './effective-permission-grants';
import { useUserPermissionOverrides } from './user-permission-context';
import { getNodeRevocationPermissionNames } from './account-settings-permissions';

import type { PermissionNodeProps } from './permission-node-types';

export default function PermissionNode(props: PermissionNodeProps) {
  const { node, permissions, disabled = false, depth = 0, onSelectAll, onToggle,
    inherited = new Map<string, string[]>(), manageableNames } = props;
  const [expanded, setExpanded] = useState(
    typeof node.permissionName === 'string' &&
      groupGrantState([node.permissionName], permissions, inherited).checked
  );
  const children = node.permissionChildren ?? node.children ?? [];
  const overrides = useUserPermissionOverrides();
  const hasChildren = children.length > 0;
  const { actions, availableNames, incomplete, state, editableNames, canRevoke, isStatutoryScheme,
    fullySelected, inheritedOnly } = permissionNodeState(props);

  return (
    <Box sx={{ pl: depth * 3, mb: 1 }}>
      <Card
        data-testid={`permission-${node.title}`}
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 1.5,
          borderColor: fullySelected ? 'primary.main' : 'divider',
          bgcolor: fullySelected
            ? (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.04)
            : 'background.paper',
          transition: 'all 0.2s',
          '&:hover': { borderColor: 'primary.main', boxShadow: (theme) => theme.customShadows.z1 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1,
              flexGrow: 1,
              minWidth: 0,
            }}
          >
            {hasChildren && (
              <IconButton
                aria-label={`${expanded ? 'Collapse' : 'Expand'} ${node.title}`}
                aria-expanded={expanded}
                onClick={() => setExpanded(!expanded)}
                sx={{ minWidth: 44, minHeight: 44 }}
              >
                <Iconify
                  icon={expanded ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
                  width={16}
                />
              </IconButton>
            )}
            <Typography variant="subtitle2" sx={{ fontWeight: fullySelected ? 700 : 600 }}>
              {node.title}
            </Typography>
            {!hasChildren && incomplete && (
              <PermissionUnavailable
                title={node.title}
                permissionName={node.permissionName}
                availableNames={availableNames}
              />
            )}
          </Box>
          {!hasChildren && (
            <>
              <PermissionNodeActions
                node={node}
                permissions={permissions}
                disabled={disabled}
                inherited={inherited}
                actions={actions}
                onToggle={onToggle}
                isStatutoryScheme={isStatutoryScheme}
                manageableNames={manageableNames}
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 1, ml: 'auto' }}>
              <Button
                size="small"
                disabled={disabled || (!overrides && inheritedOnly) || (!canRevoke && !editableNames.length)}
                color={(overrides ? state.checked : canRevoke) ? 'error' : 'primary'}
                sx={(theme) => ({ minHeight: 44,
                  color: (overrides ? state.checked : canRevoke) ? 'error.dark' : 'primary.dark',
                  ...theme.applyStyles('dark', { color: (overrides ? state.checked : canRevoke) ? 'error.light' : 'primary.light' }),
                  '&.Mui-disabled': { color: 'action.disabled' },
                })}
                title={
                  !overrides && state.sources.length
                    ? 'Only direct grants can be changed here. Inherited role access remains effective.'
                    : undefined
                }
                onClick={() => onSelectAll(node, !(overrides ? state.checked : canRevoke), false)}
              >
                {overrides ? state.checked ? 'Deny All' : 'Allow All' : inheritedOnly ? 'Inherited' : canRevoke ? 'Revoke All' : 'Grant All'}
              </Button>
              {overrides && <Button size="small" disabled={disabled || !editableNames.length} sx={{ minHeight: 44 }}
                onClick={() => overrides.setStates(getNodeRevocationPermissionNames(node, permissions), 'inherit')}>Follow role</Button>}
              </Box>
            </>
          )}
        </Box>
      </Card>
      <PermissionNodeChildren props={props} expanded={expanded} children={children} />
    </Box>
  );
}
