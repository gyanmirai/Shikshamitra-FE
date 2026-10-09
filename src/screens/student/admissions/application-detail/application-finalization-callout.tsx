import { Iconify } from 'src/components/iconify';
import { Button, Divider, Typography } from '@mui/material';

export function ApplicationFinalizationCallout({
  busy,
  onOpen,
  compact = false,
}: {
  busy: boolean;
  onOpen: () => void;
  compact?: boolean;
}) {
  return (
    <>
      <Divider sx={{ my: compact ? 1 : 2 }} />
      <Typography variant="body2" color="text.secondary">
        The application is approved and its journey is complete. Finalize admission to create or
        link the Student identity. Placement and enrollment happen later.
      </Typography>
      <Button
        variant="contained"
        color={compact ? 'inherit' : 'success'}
        size="small"
        disabled={busy}
        startIcon={<Iconify icon="mdi:school-outline" />}
        onClick={onOpen}
        sx={{
          mt: 1,
          alignSelf: 'flex-start',
        }}
      >
        Finalize admission
      </Button>
    </>
  );
}
