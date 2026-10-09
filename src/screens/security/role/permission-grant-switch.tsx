import { Box, Stack, Switch, Typography } from '@mui/material';

import UserPermissionControl from './user-permission-control';
import { useUserPermissionOverrides } from './user-permission-context';

import type { PermissionOverrideState } from './permission-catalogue';

export default function PermissionGrantSwitch({
  label,
  checked,
  hasDirect,
  sources,
  inheritedOnly,
  disabled,
  onChange,
  help,
  hideLabel = false,
  ariaLabel,
  names,
  onOverrideChange,
}: {
  label: string;
  checked: boolean;
  hasDirect: boolean;
  sources: string[];
  inheritedOnly: boolean;
  disabled?: boolean;
  onChange: () => void;
  help?: string;
  hideLabel?: boolean;
  ariaLabel?: string;
  names?: string[];
  onOverrideChange?: (state: PermissionOverrideState) => void;
}) {
  const overrides = useUserPermissionOverrides();
  if (overrides && names) return <UserPermissionControl names={names} label={label} ariaLabel={ariaLabel}
    disabled={disabled} hideLabel={hideLabel} help={help} onChange={onOverrideChange} />;
  const description = [
    help,
    sources.length
      ? `Inherited from ${sources.join(', ')}. Role access remains effective. Remove the role grant or assignment to revoke it.`
      : '',
    hasDirect ? 'Direct grant. Switching off removes only the direct grant.' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <Stack spacing={0.25} sx={{ minWidth: 0 }} title={description || undefined}>
      <Box component="label" sx={{ display: 'flex', alignItems: 'center', minHeight: 44 }}>
        {!hideLabel && (
          <Typography variant="caption" color={checked ? 'text.primary' : 'text.secondary'}>
            {label}
          </Typography>
        )}
        <Switch
          size="small"
          checked={checked}
          disabled={disabled || inheritedOnly}
          onChange={onChange}
          slotProps={{ input: { 'aria-label': ariaLabel ?? label } }}
          sx={{ minWidth: 44, minHeight: 44 }}
        />
      </Box>
      {sources.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
          Inherited from {sources.join(', ')}
        </Typography>
      )}
      {hasDirect && (
        <Typography variant="caption" color="text.secondary">
          Direct grant
        </Typography>
      )}
    </Stack>
  );
}
