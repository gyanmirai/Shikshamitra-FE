'use client';

import { SplashScreen } from 'src/components/loading-screen';
import { Box, Alert, Stack, Button, Typography } from '@mui/material';
import { SignOutButton } from 'src/layouts/components/sign-out-button';

import SetupWizard from './components/setup-wizard';
import SetupCompleted from './components/setup-completed';
import { useInitialSetupSnapshot } from './hooks/use-initial-setup-snapshot';

export default function InitialSetupScreen() {
  const query = useInitialSetupSnapshot();
  if (!query.initial && !query.error) return <SplashScreen />;
  if (query.error || !query.initial)
    return (
      <Box sx={{ maxWidth: 560, mx: 'auto', p: 3, mt: 8 }}>
        <Alert severity="error">Unable to load your institute’s setup progress.</Alert>
        <Button onClick={() => query.retry()} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  if (query.initial.isCompleted) return <SetupCompleted progress={query.initial} />;
  if (!query.initial.canManageSetup)
    return (
      <Stack spacing={3} sx={{ maxWidth: 560, mx: 'auto', p: 3, mt: 8 }}>
        <Typography variant="h4">Your institute is getting ready</Typography>
        <Typography color="text.secondary">
          An authorized administrator needs to finish the institute’s initial setup before you can
          use the app.
        </Typography>
        <Button variant="outlined" onClick={() => query.retry()}>
          Check again
        </Button>
        <SignOutButton />
      </Stack>
    );
  return <SetupWizard initial={query.initial} onReload={() => query.reload()} />;
}
