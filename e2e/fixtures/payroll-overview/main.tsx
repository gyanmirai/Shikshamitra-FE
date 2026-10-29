import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { hrPermissions } from 'src/constants/hr-menus';
import { Box, Alert, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { defaultSettings } from 'src/components/settings/config-settings';
import PayrollHome from 'src/screens/hr/payroll/payroll-home/payroll-home';
import MonthlyPayslips from 'src/screens/hr/payroll/salarySlip-generate/salarySlipGenerate';

const store = configureStore({
  reducer: {
    auth: () => ({
      permissionsInitialized: true,
      permissions: [`${hrPermissions.payroll.generateSalarySlip}.View`].map((name) => ({
        name,
        isGranted: true,
      })),
    }),
    globalState: () => ({ currentYear: { id: 'year-2026', name: '2026-27' } }),
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
      modeStorageKey="payroll-fixture-mode"
      theme={createTheme({ ...defaultSettings, colorScheme: dark ? 'dark' : 'light' })}
    >
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ p: 2, minWidth: 0 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Synthetic local payroll data. No school records are changed.
          </Alert>
          {window.location.pathname.endsWith('/payslip-generation') ? (
            <MonthlyPayslips />
          ) : (
            <PayrollHome />
          )}
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  </Provider>
);
