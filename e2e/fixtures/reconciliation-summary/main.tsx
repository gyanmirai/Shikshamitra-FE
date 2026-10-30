import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { Box, Button, CssBaseline, TextField, Typography } from '@mui/material';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import confirmPopupReducer from 'src/redux/confirmPopup/confirmPopupSlice';
import FinanceReconciliation from 'src/screens/finance/Finance-reconciliation';
import 'simplebar-react/dist/simplebar.min.css';

if (!new URLSearchParams(window.location.search).has('tab')) {
  window.history.replaceState(null, '', '?tab=4');
}

const store = configureStore({
  reducer: {
    globalState: (state = { currentYear: { id: 'year', name: '2026-27', startDate: '2026-04-01', endDate: '2027-03-31' } }) => state,
    auth: (state = { permissions: [], permissionsInitialized: true, loading: false }) => state,
    confirmPopup: confirmPopupReducer,
  },
});

function Fixture() {
  const { setMode } = useColorScheme();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh', minHeight: 0 }}>
      <Box component="header" aria-label="Fixture global navigation" sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', p: 1, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
        <Typography variant="subtitle2">Synthetic reconciliation · Actual screen · No writes</Typography>
        <TextField size="small" label="Search module" disabled />
        <Button size="small" onClick={() => setMode('light')}>Light theme</Button>
        <Button size="small" onClick={() => setMode('dark')}>Dark theme</Button>
      </Box>
      <Box sx={{ p: 1, flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
        <FinanceReconciliation />
      </Box>
    </Box>
  );
}

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <CssBaseline />
      <Fixture />
    </ThemeProvider>
  </Provider>
);
