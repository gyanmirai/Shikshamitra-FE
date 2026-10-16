import { varAlpha } from 'src/theme/styles';
import { Box, Stack, Button, Tooltip } from '@mui/material';

import { permissionBulkNames } from './permission-bulk-state';
import { usePermissionBulk } from './permission-bulk-context';

import type { NavigationPermission, PermissionOverrideState } from './permission-catalogue';

export default function PermissionBulkActions({
  scope,
  nodes,
}: {
  scope: string;
  nodes: NavigationPermission[];
}) {
  const context = usePermissionBulk();
  if (!context) return null;
  const { grants, manageable, states, setStates, disabled, user } = context;
  const names = permissionBulkNames(nodes, grants, manageable);
  const actions: {
    label: string;
    names: string[];
    state: PermissionOverrideState;
    color: 'primary' | 'error' | 'info';
    help: string;
  }[] = [
    {
      label: 'Grant all',
      names: names.grant,
      state: 'allow',
      color: 'primary',
      help: `Grant every available permission in ${scope}, including filtered and collapsed features.`,
    },
    {
      label: 'Revoke all',
      names: names.revoke,
      state: user ? 'deny' : 'inherit',
      color: 'error',
      help: user
        ? `Deny every available permission in ${scope} for this user, including access from roles.`
        : `Remove all direct grants in ${scope}. Inherited access can remain.`,
    },
    ...(user
      ? [
          {
            label: 'Follow role',
            names: names.revoke,
            state: 'inherit' as const,
            color: 'info' as const,
            help: `Clear user overrides in ${scope} and follow the assigned roles.`,
          },
        ]
      : []),
  ];
  return (
    <Stack
      role="group"
      aria-label={`${scope} permissions`}
      direction="row"
      flexWrap="wrap"
      gap={0.25}
      sx={{
        alignSelf: 'flex-start',
        width: 'fit-content',
        maxWidth: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 0.75,
        bgcolor: 'background.paper',
        p: 0.25,
      }}
    >
      {actions.map((action) => (
        <Tooltip key={action.label} title={action.help} describeChild disableInteractive>
          <Box component="span" sx={{ display: 'inline-flex' }}>
            <Button
              type="button"
              size="small"
              color={action.color}
              variant="text"
              aria-label={`${action.label} ${scope} permissions`}
              disabled={
                disabled ||
                !action.names.some((name) => (states[name] ?? 'inherit') !== action.state)
              }
              onClick={(event) => {
                event.stopPropagation();
                setStates(action.names, action.state);
              }}
              sx={(theme) => ({
                whiteSpace: 'nowrap',
                flexShrink: 0,
                minWidth: 0,
                height: { xs: 44, lg: 32 },
                px: 0.75,
                borderRadius: 0.5,
                fontSize: 12,
                fontWeight: 400,
                color: `${action.color}.dark`,
                bgcolor: varAlpha(theme.vars.palette[action.color].mainChannel, 0.12),
                '&:hover': {
                  bgcolor: varAlpha(theme.vars.palette[action.color].mainChannel, 0.12),
                },
                ...theme.applyStyles('dark', {
                  color: `${action.color}.light`,
                }),
                '&.Mui-disabled': { color: 'text.disabled', bgcolor: 'transparent' },
                '&.Mui-focusVisible': {
                  outline: '2px solid',
                  outlineColor: 'text.primary',
                  outlineOffset: -1,
                },
              })}
            >
              {action.label}
            </Button>
          </Box>
        </Tooltip>
      ))}
    </Stack>
  );
}
