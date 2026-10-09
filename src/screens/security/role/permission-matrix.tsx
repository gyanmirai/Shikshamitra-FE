import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Button, Typography, useMediaQuery } from '@mui/material';

import { filterMatrixRows } from './permission-matrix-model';
import PermissionMatrixTable from './permission-matrix-table';
import PermissionMatrixMobile from './permission-matrix-mobile';
import PermissionMatrixToolbar from './permission-matrix-toolbar';

import type { PermissionOverrideState } from './permission-catalogue';
import type { MatrixRow, MatrixAction } from './permission-matrix-model';

export type PermissionMatrixProps = {
  rows: MatrixRow[];
  user: boolean;
  disabled: boolean;
  visibility?: boolean;
  onChange: (row: MatrixRow, action: MatrixAction, state: PermissionOverrideState) => void;
};
export default function PermissionMatrix({
  rows,
  user,
  disabled,
  visibility = false,
  onChange,
}: PermissionMatrixProps) {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const [search, setSearch] = useState('');
  const [onlyOverrides, setOnlyOverrides] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const visibleRows = filterMatrixRows(rows, search, onlyOverrides, collapsed);
  const toggleGroup = (id: string) =>
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const empty = (
    <Stack alignItems="center" spacing={1.5} sx={{ p: 3 }}>
      <Typography variant="subtitle2">
        {search || onlyOverrides ? 'No matching permissions' : 'No permission actions available'}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {search || onlyOverrides
          ? 'Try a different search or clear the filters.'
          : 'This feature has no actions in the current server catalogue.'}
      </Typography>
      {(search || onlyOverrides) && (
        <Button
          onClick={() => {
            setSearch('');
            setOnlyOverrides(false);
          }}
        >
          Clear filters
        </Button>
      )}
    </Stack>
  );
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <PermissionMatrixToolbar
        search={search}
        onSearch={setSearch}
        user={user}
        disabled={disabled}
        onlyOverrides={onlyOverrides}
        onOverrides={setOnlyOverrides}
        overrideCount={rows.reduce(
          (count, row) => count + row.actions.filter((action) => action.overridden).length,
          0
        )}
      />
      {desktop ? (
        <PermissionMatrixTable
          rows={visibleRows}
          allRows={rows}
          user={user}
          disabled={disabled}
          visibility={visibility}
          onChange={onChange}
          collapsed={collapsed}
          toggleGroup={toggleGroup}
          empty={empty}
        />
      ) : (
        <PermissionMatrixMobile
          rows={visibleRows}
          user={user}
          disabled={disabled}
          visibility={visibility}
          onChange={onChange}
          collapsed={collapsed}
          toggleGroup={toggleGroup}
          empty={empty}
        />
      )}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ pt: 1.5, pb: 0.5, color: 'text.primary' }}
      >
        <Iconify icon="solar:link-linear" width={16} sx={{ flexShrink: 0 }} />
        <Typography variant="caption">
          {user
            ? 'Role = follow assigned roles. Allow / Deny = override for this user.'
            : 'Allow grants access to this role. Revoke removes its direct grant; inherited access can remain.'}
        </Typography>
      </Stack>
    </Box>
  );
}
