import { useId } from 'react';
import { Stack, Select, Tooltip, MenuItem, Typography } from '@mui/material';

import { useUserPermissionOverrides } from './user-permission-context';

import type { PermissionOverrideState } from './permission-catalogue';

export default function UserPermissionControl({ names, label, ariaLabel, disabled, hideLabel, help, onChange }: {
  names: string[];
  label: string;
  ariaLabel?: string;
  disabled?: boolean;
  hideLabel?: boolean;
  help?: string;
  onChange?: (state: PermissionOverrideState) => void;
}) {
  const overrides = useUserPermissionOverrides()!;
  const id = useId();
  const states = names.map((name) => overrides.states[name] ?? 'inherit');
  const state = !states.length ? 'unavailable' : states.every((value) => value === states[0]) ? states[0] : 'mixed';
  const allowed = names.filter((name) => overrides.states[name] === 'allow'
    || (overrides.states[name] !== 'deny' && !!overrides.sources.get(name)?.length)).length;
  const effective = !names.length ? 'Unavailable' : allowed === names.length ? 'Allowed' : allowed ? 'Mixed access' : 'Denied';
  const sources = [...new Set(names.flatMap((name) => overrides.sources.get(name) ?? []))];
  const description = [help, sources.length ? `Role default from ${sources.join(', ')}.` : 'Role default: denied.',
    'Follow role uses the role default. Allow and Deny stay unchanged when role permissions change.'].filter(Boolean).join(' ');
  return <Stack spacing={0.25} sx={{ minWidth: 132 }}>
    {!hideLabel && <Typography id={`${id}-label`} variant="caption" color="text.secondary">{label}</Typography>}
    <Tooltip title={description} disableInteractive>
      <Select size="small" value={state} disabled={disabled || !names.length}
        SelectDisplayProps={{ style: { minHeight: 44, height: 44, boxSizing: 'border-box', display: 'flex', alignItems: 'center' } }}
        inputProps={{ 'aria-label': `${ariaLabel ?? label} permission`, 'aria-describedby': `${id}-status` }}
        onChange={(event) => {
          const value = event.target.value as PermissionOverrideState;
          if (onChange) onChange(value); else overrides.setStates(names, value);
        }} sx={{ minHeight: 44 }}>
        {!names.length && <MenuItem value="unavailable" disabled>Unavailable</MenuItem>}
        {state === 'mixed' && <MenuItem value="mixed" disabled>Mixed overrides</MenuItem>}
        <MenuItem value="inherit">Follow role</MenuItem>
        <MenuItem value="allow">Allow</MenuItem>
        <MenuItem value="deny">Deny</MenuItem>
      </Select>
    </Tooltip>
    <Typography id={`${id}-status`} variant="caption" color="text.secondary">{effective}{state === 'inherit' ? ' · role default' : ['mixed', 'unavailable'].includes(state) ? '' : ' · override'}</Typography>
  </Stack>;
}
