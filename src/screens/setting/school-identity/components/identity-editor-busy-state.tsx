import { Box, Stack, CircularProgress } from '@mui/material';

export function IdentityEditorBusyState({
  preparingImage,
  uploading,
}: {
  preparingImage: boolean;
  uploading: boolean;
}) {
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        bgcolor: 'action.disabledBackground',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Stack alignItems="center" spacing={1}>
        <CircularProgress />
        <span>
          {preparingImage ? 'Preparing image…' : uploading ? 'Uploading image…' : 'Saving…'}
        </span>
      </Stack>
    </Box>
  );
}
