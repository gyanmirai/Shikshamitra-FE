import type { ReactNode } from 'react';

import Box from '@mui/material/Box';

import { LoginBrandPanel } from './login-brand-panel';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Box
      component="main"
      sx={(theme) => ({
        width: 1,
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 0, sm: 3, md: 4 },
        '@media (min-width: 900px) and (max-height: 800px)': { p: 2 },
        bgcolor: 'background.neutral',
        ...theme.applyStyles('dark', { bgcolor: 'background.default' }),
      })}
    >
      <Box
        sx={(theme) => ({
          width: 1,
          maxWidth: 1280,
          minWidth: 0,
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1.08fr) minmax(0, 1fr)' },
          bgcolor: 'background.paper',
          borderRadius: { xs: 0, sm: 3 },
          borderWidth: { xs: 0, sm: 1 },
          borderStyle: 'solid',
          borderColor: 'divider',
          overflow: 'hidden',
          boxShadow: { xs: 'none', sm: theme.customShadows.card },
        })}
      >
        <LoginBrandPanel />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 0,
            px: { xs: 3, sm: 5, lg: 6 },
            py: { xs: 4, md: 5 },
            '@media (min-width: 900px) and (max-height: 800px)': { py: 2 },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
