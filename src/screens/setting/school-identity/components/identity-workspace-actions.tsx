import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';

import { IdentityMoreActions } from './identity-more-actions';

import type { IdentityProfile } from '../types';
import type { SchoolIdentityWorkspace } from '../hooks/use-school-identity';

export function IdentityWorkspaceActions({
  workspace,
  onEdit,
  onCopy,
  onReset,
  onHistory,
}: {
  workspace: SchoolIdentityWorkspace;
  onEdit: (profile: IdentityProfile | null) => void;
  onCopy: (profile: IdentityProfile | null) => void;
  onReset: (profile: IdentityProfile | null) => void;
  onHistory: () => void;
}) {
  const { query, canManage, tab, permissions } = workspace;
  const disabled = !query.currentData || query.isFetching || query.isError;
  return (
    <Box
      role="group"
      aria-label="School identity actions"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 1,
        '& .MuiButton-root': {
          minHeight: { xs: 44, sm: 36 },
          height: 'auto',
          whiteSpace: 'normal',
        },
        '& .MuiIconButton-root': { minWidth: { xs: 44, sm: 36 }, minHeight: { xs: 44, sm: 36 } },
      }}
    >
      <Button
        startIcon={<Iconify icon="mdi:history" width={18} />}
        disabled={disabled}
        onClick={onHistory}
      >
        View history
      </Button>
      {canManage && tab === 1 && (
        <IdentityMoreActions
          disabled={disabled}
          canCopy={permissions.canAccessSignature}
          onCopy={() => onCopy(query.currentData ?? null)}
          onReset={() => onReset(query.currentData ?? null)}
        />
      )}
      {canManage && (
        <Button
          variant="contained"
          startIcon={<Iconify icon="mdi:pencil-outline" width={18} />}
          disabled={disabled}
          onClick={() => onEdit(query.currentData ?? null)}
        >
          {tab === 0 ? 'Edit school defaults' : 'Edit override'}
        </Button>
      )}
    </Box>
  );
}
