import { useId } from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, Tooltip, Typography } from '@mui/material';

import PermissionActionNotes from './permission-action-notes';
import PermissionRuleSelector from './permission-rule-selector';

import type { MatrixAction } from './permission-matrix-model';
import type { PermissionOverrideState } from './permission-catalogue';

export default function PermissionInlineEditor({
  feature,
  action,
  user,
  visibility = false,
  disabled,
  showLabel = false,
  onChange,
}: {
  feature: string;
  action: MatrixAction;
  user: boolean;
  visibility?: boolean;
  disabled: boolean;
  showLabel?: boolean;
  onChange: (state: PermissionOverrideState) => void;
}) {
  const id = useId();
  const rule = user ? action.rule : action.hasDirect ? 'allow' : 'inherit';
  const provenance = user
    ? action.overridden
      ? 'user override'
      : action.sources.length
        ? 'inherited'
        : 'role default'
    : action.hasDirect
      ? 'Direct grant'
      : action.sources.length
        ? 'Inherited'
        : 'Not granted';
  const roleDefault = visibility
    ? action.roleResult === 'Allowed'
      ? 'Visible'
      : 'Hidden'
    : action.roleResult;
  const explanation = user
    ? `Role default: ${roleDefault}${action.sources.length ? ` from ${action.sources.join(', ')}` : ' · no role grant'}. ${action.overridden ? 'This user override stays when role permissions change.' : 'Follow role keeps access in sync with role permissions.'}`
    : action.sources.length
      ? `Inherited from ${action.sources.join(', ')}. Removing a direct grant leaves inherited access effective.`
      : 'Direct grants apply to this role.';
  return (
    <Box
      role="group"
      aria-label={`${feature} ${action.label} editor`}
      onClick={(event) => event.stopPropagation()}
      sx={{ minWidth: 0 }}
    >
      {showLabel && (
        <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
          {action.label}
        </Typography>
      )}
      <PermissionRuleSelector
        id={id}
        label={`${feature} ${action.label} permission`}
        rule={rule}
        user={user}
        disabled={disabled || !action.editable}
        onChange={onChange}
      />
      <Tooltip title={explanation} disableInteractive>
        <Typography
          id={`${id}-result`}
          variant="caption"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mt: 0.75,
            color: 'text.primary',
            fontSize: 11,
          }}
        >
          <Iconify
            icon={action.overridden ? 'solar:user-bold' : 'solar:link-linear'}
            width={14}
            sx={{ flexShrink: 0 }}
          />
          <Box component="span">{action.result}</Box> · {provenance}
        </Typography>
      </Tooltip>
      <PermissionActionNotes action={action} />
    </Box>
  );
}
