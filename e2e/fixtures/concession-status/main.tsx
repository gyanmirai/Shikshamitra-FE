import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { Box, Button, Typography, CssBaseline } from '@mui/material';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { financePermissions } from 'src/constants/finance-menu';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import StudentConcessionTable from 'src/screens/finance/Concession/Components/StudentConcessionTable';
import 'simplebar-react/dist/simplebar.min.css';

const store = configureStore({ reducer: { confirmPopup, auth: () => ({
  user: { sub: 'maker' },
  permissions: [{ name: financePermissions.fees.concessionActions.view, isGranted: true }],
}) } });
function ThemeToggle() {
  const { mode, setMode } = useColorScheme();
  return <Button onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>Toggle preview theme</Button>;
}
createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider theme={createTheme(defaultSettings)} defaultMode="light" modeStorageKey="concession-status-mode">
      <CssBaseline />
      <Box sx={{ p: 1, height: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', minHeight: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6">Concessions · synthetic verification</Typography><ThemeToggle />
        </Box>
        <StudentConcessionTable onReject={() => undefined} onAddConcession={() => undefined} />
      </Box>
    </ThemeProvider>
  </Provider>
);
