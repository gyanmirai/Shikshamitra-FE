import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { createRoot } from 'react-dom/client';
import { Box, CssBaseline } from '@mui/material';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { hrPermissions } from 'src/constants/hr-menus';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { defaultSettings } from 'src/components/settings/config-settings';
import SalaryDocumentCenter from 'src/screens/hr/payroll/payslip-generation';

const permissions = [
  `${hrPermissions.payroll.generateSalarySlip}.View`,
  `${hrPermissions.payroll.generateSalarySlip}.Add`,
  `${hrPermissions.payroll.runPayroll}.View`,
  hrPermissions.payroll.runPayrollAdjustments,
];
const store = configureStore({
  reducer: {
    auth: () => ({
      permissionsInitialized: true,
      permissions: permissions.map((name) => ({ name, isGranted: true })),
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
      modeStorageKey="salary-documents-fixture-mode"
      theme={createTheme({ ...defaultSettings, colorScheme: dark ? 'dark' : 'light' })}
    >
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box
          sx={{
            height: '100dvh',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            p: 1,
            overflow: 'hidden',
          }}
        >
          <SalaryDocumentCenter />
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  </Provider>
);
