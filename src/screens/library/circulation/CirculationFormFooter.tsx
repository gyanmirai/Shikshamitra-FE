import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Button, DialogActions } from '@mui/material';
import { LoadingButton } from 'src/components/loading-button';

export function CirculationFormFooter({
  busy,
  disabled,
  onCancel,
  label,
  blockClose = false,
}: {
  busy: boolean;
  disabled: boolean;
  onCancel: () => void;
  label: string;
  blockClose?: boolean;
}) {
  return (
    <DialogActions>
      <Button
        type="button"
        size="small"
        variant="outlined"
        color="inherit"
        disabled={busy || blockClose}
        onClick={onCancel}
        startIcon={<Iconify icon={GlobalIcons.cancel} />}
      >
        Cancel
      </Button>
      <LoadingButton
        type="submit"
        size="small"
        variant="contained"
        color="inherit"
        loading={busy}
        disabled={disabled}
        startIcon={<Iconify icon={GlobalIcons.submit} />}
      >
        {label}
      </LoadingButton>
    </DialogActions>
  );
}
