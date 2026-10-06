import 'simplebar-react/dist/simplebar.min.css';

import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { Box, Stack, Button, Typography, CssBaseline } from '@mui/material';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { financePermissions } from 'src/constants/finance-menu';
import ConcessionPolicyWorkspace from 'src/screens/finance/policies/workspaces/ConcessionPolicyWorkspace';

import { api } from './mock-service';

const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    globalState: () => ({
      currentYear: { id: 'synthetic-year', name: '2026–27' },
      academicYears: [],
    }),
    auth: () => ({
      permissions: Object.values(financePermissions.policies.concessionPolicyActions).map(
        (name) => ({ name, isGranted: true })
      ),
    }),
    confirmPopup: () => ({ isChanges: false }),
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
});

function Fixture() {
  const { setMode } = useColorScheme();
  return (
    <Box
      sx={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        p: 1.5,
        gap: 1,
        bgcolor: 'background.neutral',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
          UI verification · synthetic policies · no backend writes
        </Typography>
        <Button size="small" onClick={() => setMode('light')}>
          Light
        </Button>
        <Button size="small" onClick={() => setMode('dark')}>
          Dark
        </Button>
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ConcessionPolicyWorkspace />
      </Box>
    </Box>
  );
}

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={createTheme(defaultSettings)}>
    <CssBaseline />
    <Provider store={store}>
      <Fixture />
    </Provider>
  </ThemeProvider>
);
