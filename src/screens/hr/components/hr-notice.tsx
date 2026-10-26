'use client';

import type { ReactNode } from 'react';
import type { AlertProps } from '@mui/material/Alert';

import { Alert, Stack, Typography, LinearProgress } from '@mui/material';

/** HR workspace feedback. Keep consequential severities on the shared semantic palette. */
export function HrNotice({ severity = 'info', role, sx, ...props }: AlertProps) {
  return (
    <Alert
      {...props}
      severity={severity}
      role={role ?? (severity === 'info' ? 'status' : 'alert')}
      variant={severity === 'info' ? 'outlined' : props.variant}
      sx={[
        ...(severity === 'info'
          ? [
              {
                // Match both scheme overrides without changing the global Alert theme.
                '&&': {
                  bgcolor: 'background.paper',
                  borderColor: 'divider',
                  color: 'text.primary',
                  ...(props.action ? { flexWrap: { xs: 'wrap', sm: 'nowrap' } } : {}),
                  '& .MuiAlert-icon': { color: 'text.secondary' },
                  '& .MuiAlert-message': { flex: '1 1 0', minWidth: 0, overflowWrap: 'anywhere' },
                  '& .MuiAlert-action': {
                    flexShrink: 0,
                    ...(props.action
                      ? { flexBasis: { xs: '100%', sm: 'auto' }, justifyContent: 'flex-end' }
                      : {}),
                  },
                },
              },
            ]
          : []),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
}

/** One quiet progress indicator with a polite request-status announcement. */
export function HrLoadingNotice({ children }: { children: ReactNode }) {
  return (
    <Stack spacing={1} role="status" aria-live="polite" aria-atomic="true" sx={{ minWidth: 0 }}>
      <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
        {children}
      </Typography>
      <LinearProgress color="inherit" aria-hidden="true" sx={{ color: 'text.secondary' }} />
    </Stack>
  );
}
