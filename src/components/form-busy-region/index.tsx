import type { ReactNode } from 'react';

import { alpha } from '@mui/material/styles';
import { Box, Stack, Typography, CircularProgress } from '@mui/material';

type Props = { busy: boolean; label?: string; children: ReactNode };

/** Keeps a blocking form visible while disabling native and custom controls. */
export function FormBusyRegion({ busy, label = 'Saving…', children }: Props) {
  return (
    <Box
      component="fieldset"
      disabled={busy}
      aria-busy={busy}
      sx={{ position: 'relative', border: 0, p: 0, m: 0, minWidth: 0 }}
    >
      <Box inert={busy || undefined}>{children}</Box>
      {busy && (
        <Stack
          role="status"
          aria-label={label}
          alignItems="center"
          justifyContent="center"
          spacing={1}
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            minHeight: 64,
            bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
          }}
        >
          <CircularProgress size={24} aria-hidden="true" />
          <Typography variant="body2">{label}</Typography>
        </Stack>
      )}
    </Box>
  );
}
