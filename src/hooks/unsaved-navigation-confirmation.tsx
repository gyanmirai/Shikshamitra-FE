import Close from '@mui/icons-material/Close';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Button, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

type Props = {
  title?: string;
  description?: string;
  keepEditingLabel?: string;
  discardLabel?: string;
  busy: boolean;
  onKeepEditing: () => void;
  onDiscard: () => void;
};

export function UnsavedNavigationConfirmation({
  title,
  description,
  keepEditingLabel,
  discardLabel,
  busy,
  onKeepEditing,
  onDiscard,
}: Props) {
  return (
    <CustomDialog
      open
      title={title || 'Discard unsaved changes?'}
      handleClose={onKeepEditing}
      hasForm={false}
      guardUnsavedChanges={false}
      disableClose={busy}
      maxWidth="xs"
      aria-describedby="unsaved-changes-description"
      paperProps={{ sx: { maxWidth: 460 } }}
    >
      <DialogScrollContent sx={{ py: 2, px: 2.5 }}>
        <Typography
          id="unsaved-changes-description"
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.6 }}
        >
          {description ||
            'Your changes have not been saved. Keep editing, or discard them and continue.'}
        </Typography>
      </DialogScrollContent>
      <DialogActions
        sx={{
          px: 2,
          py: 1.5,
          gap: 1,
          borderTop: 1,
          flexWrap: 'wrap',
          borderColor: 'divider',
          '& > :not(style) ~ :not(style)': { ml: 0 },
        }}
      >
        <Button
          autoFocus
          size="small"
          variant="outlined"
          color="inherit"
          disabled={busy}
          onClick={onKeepEditing}
          startIcon={<Close fontSize="small" />}
        >
          {keepEditingLabel ?? 'Keep editing'}
        </Button>
        <Button
          size="small"
          color="error"
          variant="contained"
          disabled={busy}
          onClick={onDiscard}
          startIcon={<Iconify icon={GlobalIcons.delete} />}
        >
          {discardLabel ?? 'Discard changes'}
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
