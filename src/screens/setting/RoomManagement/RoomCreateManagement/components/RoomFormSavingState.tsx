import { Box, CircularProgress } from '@mui/material';

export function RoomFormSavingState() {
  return (
    <Box
      role="status"
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'action.disabledBackground',
        zIndex: 1,
      }}
    >
      <CircularProgress size={24} aria-hidden />
      Submitting room…
    </Box>
  );
}
