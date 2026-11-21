import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { LoadingButton } from 'src/components/loading-button';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Alert, Stack, Button, Typography, LinearProgress } from '@mui/material';

import type { useBookDeletion } from './useBookDeletion';

export function BookDeleteDialog({ deletion }: { deletion: ReturnType<typeof useBookDeletion> }) {
  const { state, canConfirm, close, retry, confirm } = deletion;
  const deleting = Boolean(state?.deleting);
  return (
    <ConfirmDialog
      open={Boolean(state)}
      onClose={close}
      title="Delete Book?"
      icon={<Iconify icon={GlobalIcons.delete} color="error.main" />}
      disableCancel={deleting}
      bodyBusy={deleting}
      busyLabel="Deleting book"
      cancelText={canConfirm ? 'Cancel' : 'Close'}
      content={
        state && (
          <Stack spacing={1.5}>
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
              Delete <strong>{state.book.title}</strong> and its unused copies? This cannot be
              undone.
            </Typography>
            {state.checking ? (
              <LinearProgress aria-label="Checking title deletion" />
            ) : state.error ? (
              <Alert severity="error">{state.error}</Alert>
            ) : !canConfirm ? (
              <Alert severity="warning">{state.reason}</Alert>
            ) : null}
          </Stack>
        )
      }
      action={
        canConfirm ? (
          <LoadingButton
            type="button"
            variant="contained"
            color="error"
            loading={deleting}
            startIcon={<Iconify icon={GlobalIcons.delete} />}
            onClick={confirm}
          >
            Delete
          </LoadingButton>
        ) : state?.error ? (
          <Button
            type="button"
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon={GlobalIcons.refresh} />}
            onClick={retry}
          >
            Retry check
          </Button>
        ) : null
      }
    />
  );
}
