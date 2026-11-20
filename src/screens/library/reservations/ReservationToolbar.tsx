import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Stack, Button, Checkbox, FormControlLabel } from '@mui/material';

export function ReservationToolbar({
  includeHistory,
  onHistory,
  canWrite,
  locked,
  onCreate,
}: {
  includeHistory: boolean;
  onHistory: (value: boolean) => void;
  canWrite: boolean;
  locked: boolean;
  onCreate: () => void;
}) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ flexWrap: 'wrap', gap: 1 }}
    >
      <FormControlLabel
        control={
          <Checkbox
            checked={includeHistory}
            onChange={(_, value) => onHistory(value)}
            disabled={locked}
          />
        }
        label="Include completed and cancelled requests"
      />
      {canWrite && (
        <Button
          type="button"
          size="small"
          color="inherit"
          variant="contained"
          disabled={locked}
          onClick={onCreate}
          startIcon={<Iconify icon={GlobalIcons.addIcon} />}
        >
          Reserve book
        </Button>
      )}
    </Stack>
  );
}
