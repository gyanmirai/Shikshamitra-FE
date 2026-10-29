import { useId } from 'react';
import { Box, Tooltip, Typography } from '@mui/material';

import PermissionRoleResult from './permission-role-result';
import PermissionActionNotes from './permission-action-notes';
import PermissionRuleSelector from './permission-rule-selector';
import { visibilityPrerequisiteWarning } from './visibility-prerequisites';

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
  const hidden = !visibility && !!action.visibilityMissing?.length;
  const rule = user ? action.rule : action.hasDirect ? 'allow' : 'inherit';
  const provenance = user
    ? action.overridden
      ? 'User override'
      : action.sources.length
        ? 'Inherited from role'
        : 'Role default'
    : action.hasDirect
      ? 'Direct grant'
      : action.sources.length
        ? 'Inherited'
        : 'Not granted';
  const roleDefault = visibility
    ? action.roleResult === 'Allowed'
      ? 'Visible'
      : action.roleResult === 'Denied'
        ? 'Hidden'
        : action.roleResult
    : action.roleResult;
  const explanation = user
    ? `Role default: ${roleDefault}${action.sources.length ? ` from ${action.sources.join(', ')}` : ' · no role grant'}. ${action.overridden ? 'This user override stays when role permissions change.' : 'Follow role keeps access in sync with role permissions.'}`
    : action.sources.length
      ? `Inherited from ${action.sources.join(', ')}. Removing a direct grant leaves inherited access effective.`
      : 'Direct grants apply to this role.';
  const summary = `${hidden ? `${visibilityPrerequisiteWarning} ` : ''}${action.result}. ${provenance}. ${explanation}`;
  return (
    <Box
      role="group"
      aria-label={`${feature} ${action.label} editor`}
      onClick={(event) => event.stopPropagation()}
      sx={{ minWidth: 0, width: 1 }}
    >
      {showLabel && (
        <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
          {action.label}
        </Typography>
      )}
      <Tooltip
        title={
          <>
            {summary}
            <PermissionActionNotes action={action} />
          </>
        }
        describeChild
        disableInteractive={!hidden}
      >
        <Box
          tabIndex={hidden ? 0 : undefined}
          aria-label={hidden ? `${feature}: ${visibilityPrerequisiteWarning}` : undefined}
          sx={{
            width: 1,
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: 2,
            },
          }}
        >
          <PermissionRuleSelector
            id={id}
            label={`${feature} ${action.label} permission`}
            rule={rule}
            user={user}
            disabled={disabled || !action.editable || hidden}
            onChange={onChange}
          />
        </Box>
      </Tooltip>
      {user && <PermissionRoleResult action={action} visibility={visibility} />}
      <Box id={`${id}-result`} hidden>
        {summary}
        <PermissionActionNotes action={action} />
      </Box>
    </Box>
  );
}
