import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Box, Button, Typography, DialogActions } from '@mui/material';

import type { usePermissionDraft } from './use-permission-draft';

export default function PermissionDraftFooter({
  draft,
  onClose,
  onReview,
}: {
  draft: ReturnType<typeof usePermissionDraft>;
  onClose: () => void;
  onReview: () => void;
}) {
  const discardDialog = useBoolean();
  const [closeAfterDiscard, setCloseAfterDiscard] = useState(false);
  const cancel = () => {
    if (draft.busy) return;
    if (!draft.dirty) {
      onClose();
      return;
    }
    setCloseAfterDiscard(true);
    discardDialog.onTrue();
  };
  return (
    <>
      <DialogActions
        sx={{
          px: { xs: 1.5, sm: 2.5 },
          py: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          flexWrap: 'wrap',
          gap: 1,
          '& button': { minHeight: { xs: 44, md: 32 } },
        }}
      >
        <Box
          sx={{
            mr: 'auto',
            width: { xs: '100%', sm: 'auto' },
            display: 'flex',
            gap: 1,
            alignItems: 'center',
          }}
        >
          <Iconify
            icon={draft.dirty ? 'solar:pen-bold' : 'solar:check-circle-linear'}
            width={18}
            sx={{ color: 'text.secondary' }}
          />
          <Typography role="status" variant="body2" color="text.secondary">
            {draft.dirty
              ? `${draft.changes.length} unsaved ${draft.changes.length === 1 ? 'permission change' : 'permission changes'}`
              : 'No unsaved changes'}
          </Typography>
        </Box>
        <Button
          size="small"
          color="inherit"
          variant="outlined"
          disabled={draft.busy}
          onClick={cancel}
        >
          Cancel
        </Button>
        {draft.dirty && (
          <Button
            size="small"
            color="primary"
            disabled={draft.blocked}
            onClick={() => {
              setCloseAfterDiscard(false);
              discardDialog.onTrue();
            }}
          >
            Discard changes
          </Button>
        )}
        <Button
          size="small"
          color="inherit"
          variant="contained"
          disabled={draft.blocked || !draft.dirty}
          onClick={onReview}
          startIcon={<Iconify icon="solar:clipboard-check-linear" />}
        >
          Review changes
        </Button>
      </DialogActions>
      <ConfirmDialog
        open={discardDialog.value}
        onClose={discardDialog.onFalse}
        title="Discard permission changes?"
        icon="warning"
        sx={{ '& button': { minHeight: { xs: 44, md: 32 } } }}
        cancelText="Keep editing"
        disableBackdropClick
        disableCancel={draft.busy}
        disableEscapeKeyDown={draft.busy}
        content="Your unsaved changes will be discarded. Saved permissions will stay unchanged."
        action={
          <Button
            size="small"
            color="error"
            variant="contained"
            disabled={draft.busy}
            sx={{ minHeight: { xs: 44, md: 32 } }}
            onClick={() => {
              draft.discard();
              discardDialog.onFalse();
              if (closeAfterDiscard) onClose();
            }}
          >
            Discard changes
          </Button>
        }
      />
    </>
  );
}
