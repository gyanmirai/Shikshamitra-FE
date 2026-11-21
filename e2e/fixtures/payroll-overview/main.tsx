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
import RunPayroll from 'src/screens/hr/payroll/run-payroll/runPayroll';
import PayrollSettings from 'src/screens/hr/payroll/setting/payroll-settings';
import PayrollApprovalWorkflow from 'src/screens/hr/payroll/setting/payroll-approval-workflow';
import MonthlyPayslips from 'src/screens/hr/payroll/salarySlip-generate/salarySlipGenerate';

const params = new URLSearchParams(window.location.search);
const payroll = hrPermissions.payroll;
const actor = params.get('actor') ?? sessionStorage.getItem('payroll-fixture-actor');
if (actor) sessionStorage.setItem('payroll-fixture-actor', actor);
const roles = actor === 'hr' ? [payroll.runPayrollSubmit, payroll.runPayrollExportReview, `${payroll.runPayroll}.Add`]
  : actor === 'principal' ? [payroll.runPayrollLock, payroll.runPayrollExportReview]
    : actor === 'manager' ? [payroll.runPayrollManageWorkflow, payroll.runPayrollSubmit] : [];
const pathname = window.location.pathname;
const workbench = window.location.pathname.endsWith('/run-payroll');
const store = configureStore({
  reducer: {
    auth: () => ({
      permissionsInitialized: true,
      permissions: [`${payroll.generateSalarySlip}.View`, `${payroll.runPayroll}.View`, ...roles].map((name) => ({
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
const dark = params.get('theme') === 'dark';
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
          {pathname.endsWith('/approval-workflow') ? (
            <PayrollApprovalWorkflow />
          ) : pathname.endsWith('/setting') ? (
            <PayrollSettings />
          ) : pathname.endsWith('/payslip-generation') ? (
            <MonthlyPayslips />
          ) : workbench ? (
            <RunPayroll />
          ) : (
            <PayrollHome />
          )}
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  </Provider>
);
