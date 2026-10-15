import Box from '@mui/material/Box';

import { LoginForm } from './components/login-form';
import { LoginBrandPanel } from './components/login-brand-panel';

export default function LoginScreen() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100dvh',
        bgcolor: 'background.neutral',
        p: { xs: 0, sm: 2, lg: 3 },
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          width: 1,
          maxWidth: 1440,
          mx: 'auto',
          minHeight: { xs: '100dvh', sm: 'calc(100dvh - 32px)', lg: 'calc(100dvh - 48px)' },
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 0.95fr) minmax(0, 1.05fr)' },
          bgcolor: 'background.paper',
          borderRadius: { xs: 0, sm: 3 },
          overflow: 'clip',
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
              py: { xs: 2, sm: 3, md: 2 },
            ...theme.applyStyles('dark', { bgcolor: 'background.default' }),
          })}
        >
          <LoginForm />
        </Box>
      </Box>
    </Box>
  );
}
