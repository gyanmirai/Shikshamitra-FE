import { LoadingButton } from '@mui/lab';
import { Stack, Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';

export function BorrowingRulesActions({
  canEdit,
  dirty,
  busy,
  onReset,
}: {
  canEdit: boolean;
  dirty: boolean;
  busy: boolean;
  onReset: () => void;
}) {
  return (
    <Stack direction="row" spacing={1}>
      <Button
        type="button"
        size="small"
        variant="outlined"
        color="inherit"
        onClick={() => onReset()}
        disabled={!canEdit || !dirty || busy}
        startIcon={<Iconify icon={GlobalIcons.resetIcon} />}
      >
        Reset
      </Button>
      <LoadingButton
        data-testid="library-settings-borrowing-rules-save-button"
        type="submit"
        size="small"
        variant="contained"
        color="inherit"
        loading={busy}
        disabled={!canEdit || !dirty}
        startIcon={<Iconify icon={GlobalIcons.submit} />}
      >
        Save
      </LoadingButton>
    </Stack>
  );
}
