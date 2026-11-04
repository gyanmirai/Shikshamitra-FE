import 'simplebar-react/dist/simplebar.min.css';

import React from 'react';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { Stack, Typography, CssBaseline } from '@mui/material';
import { defaultSettings } from 'src/components/settings/config-settings';
import { PfCoverageSettings } from 'src/screens/hr/payroll/setting/pf-coverage-settings';

const readOnly = new URLSearchParams(window.location.search).get('access') === 'readonly';
const mode = new URLSearchParams(window.location.search).get('theme') === 'dark' ? 'dark' : 'light';
const store = configureStore({
  reducer: () => ({
    auth: {
      permissions: (readOnly ? ['View'] : ['View', 'Add']).map((action) => ({
        name: `HR.PayrollManagement.Settings.PfRule.${action}`,
        isGranted: true,
      })),
    },
    confirmPopup: { isChanges: false },
  }),
});
createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider
      theme={createTheme({ ...defaultSettings, colorScheme: mode })}
      defaultMode={mode}
      storageManager={null}
    >
      <CssBaseline />
      <Stack spacing={2} sx={{ p: 2 }}>
        <Typography variant="h5">PF Rule</Typography>
        <Typography variant="caption">
          Synthetic UI fixture. No school records are changed.
        </Typography>
        <PfCoverageSettings />
      </Stack>
    </ThemeProvider>
  </Provider>
);
