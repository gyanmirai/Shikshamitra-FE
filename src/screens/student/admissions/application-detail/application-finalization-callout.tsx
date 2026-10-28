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
        The application is approved. Finalization checks the completed journey and creates or links
        the Student identity for Onboarding.
      </Typography>
      <Button
        variant="contained"
        color="inherit"
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
