import type { ReactNode } from 'react';

import Box from '@mui/material/Box';

import { LoginBrandPanel } from './login-brand-panel';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Box
      component="main"
      sx={{
        width: 1,
        minHeight: '100dvh',
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 0.95fr) minmax(0, 1.05fr)' },
        bgcolor: 'background.paper',
      }}
    >
      <LoginBrandPanel />
      <Box
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 0,
          bgcolor: 'background.neutral',
          px: { xs: 2, sm: 4, md: 3, lg: 5 },
          py: { xs: 3, sm: 4, md: 5 },
          ...theme.applyStyles('dark', { bgcolor: 'background.default' }),
        })}
      >
        {children}
      </Box>
    </Box>
  );
}
