import type { ReactNode } from 'react';

import { Paper } from '@mui/material';

export function NotificationFilterRow({ children }: { children: ReactNode }) {
  return (
    <Paper
      sx={{
        p: 1,
        borderRadius: 2,
        flexShrink: 0,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        '& > *': { flex: { xs: '1 1 100%', sm: '0 1 240px' }, minWidth: 0, maxWidth: '100%' },
      }}
    >
      {children}
    </Paper>
  );
}
