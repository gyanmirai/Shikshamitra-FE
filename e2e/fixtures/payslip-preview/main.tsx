import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { Box, Typography, CssBaseline } from '@mui/material';
import { defaultSettings } from 'src/components/settings/config-settings';
import PayslipSettingsForm from 'src/screens/hr/payroll/salarySlip-generate/payslip-settings-form';

const store = configureStore({
  reducer: {
    auth: () => ({ permissionsInitialized: true, permissions: [] }),
    confirmPopup: () => ({ isChanges: false }),
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});
const dark = new URLSearchParams(window.location.search).get('theme') === 'dark';
createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider
      defaultMode={dark ? 'dark' : 'light'}
      modeStorageKey="payslip-preview-mode"
      theme={createTheme({ ...defaultSettings, colorScheme: dark ? 'dark' : 'light' })}
    >
      <CssBaseline />
      <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', minWidth: 0, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Payslip &amp; Statement Settings
        </Typography>
        <PayslipSettingsForm canEdit />
      </Box>
    </ThemeProvider>
  </Provider>
);
