import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Button, DialogActions } from '@mui/material';

export function ReservationFormFooter({
  busy,
  disabled,
  onCancel,
}: {
  busy: boolean;
  disabled: boolean;
  onCancel: () => void;
}) {
  return (
    <DialogActions>
      <Button
        type="button"
        size="small"
        variant="outlined"
        color="inherit"
        disabled={busy}
        onClick={onCancel}
        startIcon={<Iconify icon={GlobalIcons.cancel} />}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        size="small"
        variant="contained"
        color="inherit"
        loading={busy}
        disabled={disabled}
        startIcon={<Iconify icon={GlobalIcons.submit} />}
      >
        Submit
      </Button>
    </DialogActions>
  );
}
