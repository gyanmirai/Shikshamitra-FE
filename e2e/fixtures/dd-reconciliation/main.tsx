import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { Box, Button, CssBaseline, Typography } from '@mui/material';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import confirmPopupReducer from 'src/redux/confirmPopup/confirmPopupSlice';
import DemandDraftTable from 'src/screens/finance/Finance-reconciliation/Component/DemandDraftTable';
import 'simplebar-react/dist/simplebar.min.css';
const store = configureStore({
  reducer: {
    globalState: (state = { currentYear: { id: 'year', name: '2026-27' } }) => state,
    auth: (state = { permissions: [], permissionsInitialized: true, loading: false }) => state,
    confirmPopup: confirmPopupReducer,
  },
});
function Fixture() {
  const { setMode } = useColorScheme();
  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100dvh', minHeight: 0 }}>
      <Typography variant="h5">Demand Draft Date Checks</Typography>
      <Typography>Synthetic data · Actual reconciliation table · No backend writes</Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button onClick={() => setMode('light')}>Light theme</Button>
        <Button onClick={() => setMode('dark')}>Dark theme</Button>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, minWidth: 0 }}>
        <DemandDraftTable />
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
