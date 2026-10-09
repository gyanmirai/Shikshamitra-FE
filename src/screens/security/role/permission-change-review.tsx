import { LoadingButton } from '@mui/lab';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Alert, Stack, Button, Typography, DialogActions } from '@mui/material';

import { matrixAction } from './permission-matrix-model';
import { catalogueStates } from './permission-draft-state';
import { permissionLabel, catalogueEntries, isVisibilityPermission } from './permission-catalogue';

import type { usePermissionDraft } from './use-permission-draft';
import type { GrantProvider, PermissionOverrideState } from './permission-catalogue';

const userRuleLabel: Record<PermissionOverrideState, string> = {
  inherit: 'Follow role',
  allow: 'Allow',
  deny: 'Deny',
};
export default function PermissionChangeReview({
  open,
  onClose,
  draft,
  provider,
}: {
  open: boolean;
  onClose: () => void;
  draft: ReturnType<typeof usePermissionDraft>;
  provider: GrantProvider;
}) {
  const entries = draft.catalogue ? catalogueEntries(draft.catalogue) : [];
  const original = draft.catalogue ? catalogueStates(draft.catalogue, provider) : {};
  const user = provider.providerName === 'U';
  const label = (state: PermissionOverrideState) =>
    user ? userRuleLabel[state] : state === 'allow' ? 'Grant' : 'Revoke';
  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      title="Review permission changes"
      maxWidth="md"
      hasUnsavedChanges={false}
      paperProps={{ sx: { '& .MuiIconButton-root': { minHeight: 44, minWidth: 44 } } }}
      disableClose={draft.busy}
      aria-describedby="permission-review-description"
    >
      <DialogScrollContent sx={{ p: 2.5 }} scrollBarProps={{ sx: { minHeight: 0 } }}>
        <Typography
          id="permission-review-description"
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          {draft.changes.length}{' '}
          {draft.changes.length === 1 ? 'permission change' : 'permission changes'} for{' '}
          {user ? 'this user' : `role ${provider.providerKey}`}.
          {user
            ? ' User overrides stay unchanged when role permissions change.'
            : ' User overrides will remain unchanged.'}
        </Typography>
        {draft.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {draft.error}
          </Alert>
        )}
        <Stack divider={<Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />}>
          {draft.changes.map((change) => {
            const entry = entries.find((item) => item.name === change.name);
            const action = draft.catalogue
              ? matrixAction(
                  [change.name],
                  '',
                  { catalogue: draft.catalogue, provider, states: draft.states },
                  isVisibilityPermission(change.name)
                )
              : undefined;
            return (
              <Box key={change.name} sx={{ py: 1.5 }}>
                <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                  {entry ? permissionLabel(entry) : change.name}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  sx={{ mt: 0.5, flexWrap: 'wrap' }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {label(original[change.name] ?? 'inherit')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" aria-label="changes to">
                    →
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {label(change.state)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Effective: {action?.result}
                  </Typography>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </DialogScrollContent>
      <DialogActions
        sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', flexWrap: 'wrap', gap: 1 }}
      >
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          disabled={draft.busy}
          onClick={onClose}
          sx={{ minHeight: { xs: 44, md: 32 } }}
        >
          Back to editing
        </Button>
        <LoadingButton
          size="small"
          color="primary"
          variant="contained"
          loading={draft.busy}
          disabled={draft.blocked || !draft.dirty}
          onClick={draft.submit}
          sx={{ minHeight: { xs: 44, md: 32 } }}
        >
          Save changes
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
