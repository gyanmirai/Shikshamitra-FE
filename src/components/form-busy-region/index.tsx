import type { ReactNode } from 'react';

import { varAlpha } from 'src/theme/styles';
import { alpha } from '@mui/material/styles';
import { Box, Stack, Typography, CircularProgress } from '@mui/material';

type Props = {
  busy: boolean;
  label?: string;
  children: ReactNode;
  /** Preserve control-level feedback without covering it with a second loader. */
  showOverlay?: boolean;
};

/** Keeps a blocking form visible while disabling native and custom controls. */
export function FormBusyRegion({ busy, label = 'Saving…', children, showOverlay = true }: Props) {
  return (
    <Box aria-busy={busy} sx={{ position: 'relative', minWidth: 0 }}>
      <Box component="fieldset" disabled={busy} sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}>
        <Box inert={busy || undefined}>{children}</Box>
      </Box>
      {/* Keep feedback outside the fieldset so loading transitions preserve container-query layout. */}
      {busy && !showOverlay && (
        <Box
          role="status"
          aria-label={label}
          sx={{
            position: 'absolute',
            width: 1,
            height: 1,
            p: 0,
            m: -1,
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          {label}
        </Box>
      )}
      {busy && showOverlay && (
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
            bgcolor: (theme) =>
              theme.vars
                ? varAlpha(theme.vars.palette.background.paperChannel, 0.8)
                : alpha(theme.palette.background.paper, 0.8),
          }}
        >
          <CircularProgress size={24} aria-hidden="true" />
          <Typography variant="body2">{label}</Typography>
        </Stack>
      )}
    </Box>
  );
}
