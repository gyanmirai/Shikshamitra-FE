import { Label } from 'src/components/label';
import { stylesMode } from 'src/theme/styles';
import { Stack, Typography } from '@mui/material';
import HelpOutline from '@mui/icons-material/HelpOutline';
import BlockOutlined from '@mui/icons-material/BlockOutlined';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import RemoveCircleOutline from '@mui/icons-material/RemoveCircleOutline';

import type { MatrixAction } from './permission-matrix-model';

export default function PermissionRoleResult({
  action,
  visibility,
}: {
  action: MatrixAction;
  visibility: boolean;
}) {
  const unavailable = action.result === 'Unavailable';
  const overridden = action.overridden && !unavailable;
  const result = overridden ? action.result : action.roleResult;
  const allowed = result === 'Allowed' || result === 'Visible';
  const mixed = result === 'Mixed access';
  const color = unavailable ? 'default' : mixed ? 'warning' : allowed ? 'success' : 'error';
  const text = unavailable
    ? 'Role value unavailable'
    : overridden
      ? mixed
        ? 'Mixed access with user overrides'
        : `${action.result} by user override`
      : mixed
        ? 'Mixed role access'
        : visibility
          ? allowed
            ? 'Visible by role'
            : 'Hidden by role'
          : allowed
            ? 'Allowed by role'
            : 'Denied by role';
  const StatusIcon = unavailable
    ? HelpOutline
    : mixed
      ? RemoveCircleOutline
      : allowed
        ? CheckCircleOutline
        : BlockOutlined;

  return (
    <Stack spacing={0.25} alignItems="flex-start" sx={{ mt: 0.5, minWidth: 0 }}>
      <Label
        color={color}
        startIcon={<StatusIcon aria-hidden="true" />}
        sx={{
          color: unavailable ? 'text.primary' : `${color}.darker`,
          maxWidth: 1,
          height: 'auto',
          minHeight: 24,
          lineHeight: 1.5,
          py: 0.25,
          whiteSpace: 'normal',
          textAlign: 'left',
          [stylesMode.dark]: {
            color: unavailable ? 'text.primary' : `${color}.light`,
          },
        }}
      >
        {text}
      </Label>
      {overridden && (
        <Typography variant="caption" color="text.secondary">
          Role default:{' '}
          {visibility
            ? action.roleResult === 'Allowed'
              ? 'Visible'
              : action.roleResult === 'Denied'
                ? 'Hidden'
                : action.roleResult
            : action.roleResult}
        </Typography>
      )}
    </Stack>
  );
}
