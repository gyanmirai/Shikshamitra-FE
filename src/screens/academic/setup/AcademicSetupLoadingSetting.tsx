import { Stack, Typography, CircularProgress } from '@mui/material';

export default function AcademicSetupLoadingSetting() {
  return (
    <Stack role="status" aria-label="Loading setting" aria-live="polite"
      alignItems="center" justifyContent="center" spacing={2} sx={{ flex: 1, minHeight: 160 }}>
      <CircularProgress size={24} />
      <Typography variant="body2" color="text.secondary">Loading setting…</Typography>
    </Stack>
  );
}
