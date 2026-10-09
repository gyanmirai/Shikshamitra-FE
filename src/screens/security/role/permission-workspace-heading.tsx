import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Typography } from '@mui/material';

import type { MatrixRow } from './permission-matrix-model';

export default function PermissionWorkspaceHeading({
  moduleTitle,
  title,
  subjectName,
  sources,
  user,
  visibility,
  rows,
}: {
  moduleTitle: string;
  title: string;
  subjectName?: string;
  sources: string[];
  user: boolean;
  visibility: boolean;
  rows: MatrixRow[];
}) {
  const actions = rows.flatMap((row) => row.actions).filter((action) => action.names.length);
  const allAllowed =
    actions.length > 0 && actions.every((action) => action.roleResult === 'Allowed');
  const labels = [...new Set(actions.map((action) => action.label.toLowerCase()))];
  const summary = allAllowed
    ? visibility
      ? 'All listed navigation items visible by default.'
      : `${new Intl.ListFormat('en', { type: 'conjunction' }).format(labels)} allowed by default.`
    : sources.length
      ? 'Defaults vary by feature. Review inherited access below.'
      : 'No inherited grants. Choose user overrides as needed.';
  return (
    <Stack spacing={2} sx={{ mb: 2.5 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="caption" color="text.secondary">
          {moduleTitle}
        </Typography>
        <Iconify icon="eva:arrow-ios-forward-fill" width={14} sx={{ color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary">
          {visibility ? 'Visibility' : 'Permissions'}
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5">{title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage {visibility ? 'navigation visibility' : 'access'}
            {subjectName ? ` for ${subjectName}` : user ? ' for this user' : ' for this role'}.
          </Typography>
        </Box>
        {subjectName && (
          <Box
            sx={{
              px: 1,
              py: 0.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 0.75,
              maxWidth: '40%',
              overflowWrap: 'anywhere',
              typography: 'caption',
            }}
          >
            {subjectName}
          </Box>
        )}
      </Stack>
      {user && (
        <Box
          sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 1.25,
            borderRadius: 1,
            bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.12),
            color: 'text.primary',
          })}
        >
          <Iconify
            icon="solar:shield-check-linear"
            width={18}
            sx={(theme) => ({
              flexShrink: 0,
              color: 'primary.dark',
              ...theme.applyStyles('dark', { color: 'primary.light' }),
            })}
          />
          <Typography variant="caption" sx={{ flex: 1, minWidth: 0 }}>
            <Box component="strong">
              {user
                ? sources.length
                  ? `${sources.join(', ')} ${sources.length === 1 ? 'role' : 'roles'}`
                  : 'Role defaults'
                : 'Role permissions'}
            </Box>{' '}
            · {user ? summary : 'Direct grants define access for this role.'}
          </Typography>
          <Iconify icon="solar:link-linear" width={18} sx={{ flexShrink: 0 }} />
        </Box>
      )}
    </Stack>
  );
}
