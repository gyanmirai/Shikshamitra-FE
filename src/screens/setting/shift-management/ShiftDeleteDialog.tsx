import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';

type Props = {
  open: boolean;
  name?: string;
  busy: boolean;
  onClose: () => void;
  onDelete: () => void;
};

export function ShiftDeleteDialog({ open, name, busy, onClose, onDelete }: Props) {
  return (
    <ConfirmDialog
      open={open}
      disableBackdropClick
      onClose={onClose}
      title="Delete Shift"
      icon={<Iconify icon={GlobalIcons.delete} />}
      content={
        <>
          Delete the shift <strong>{name}</strong>?
        </>
      }
      action={
        <LoadingButton
          type="button"
          size="small"
          variant="contained"
          loading={busy}
          color="error"
          startIcon={<Iconify icon={GlobalIcons.delete} />}
          onClick={onDelete}
        >
          Delete shift
        </LoadingButton>
      }
    />
  );
}
