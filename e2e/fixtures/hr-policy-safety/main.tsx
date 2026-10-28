import 'simplebar-react/dist/simplebar.min.css';

import React from 'react';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from 'src/redux/auth/authSlice';
import PF from 'src/screens/hr/payroll/setting/pf';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { hrPermissions } from 'src/constants/hr-menus';
import { Box, Alert, CssBaseline } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import HRPolicyWorkspace from 'src/screens/hr/policies/HRPolicyWorkspace';
import ProfessionalTax from 'src/screens/hr/payroll/setting/professional-tax';
import { hrLeavePolicyPermissions } from 'src/constants/hr-policy-permissions';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import EarningComponent from 'src/screens/hr/payroll/setting/earning-component';
import ManualAttendanceScreen from 'src/screens/hr/attendance/manual-attendance';
import DeductionComponent from 'src/screens/hr/payroll/setting/deduction-component';
import SalaryTemplateSettings from 'src/screens/hr/payroll/setting/salary-templates';
import SalaryTemplateEditor from 'src/screens/hr/payroll/setting/salary-template-editor';
import PayslipStatementSettings from 'src/screens/hr/payroll/setting/payslip-statement-settings';
import StatutorySchemesPage from 'src/app/(auth-route)/hr/(Payroll-Management)/payroll/setting/statutory-schemes/page';

import { year } from './data';

const query = new URLSearchParams(window.location.search);
const focus =
  (['calendars', 'attendance', 'leave', 'payroll', 'assignments'] as const).find(
    (surface) => surface === query.get('surface')
  ) || 'attendance';
const permissions = [
  ...Object.values(hrPermissions.policies),
  ...Object.values(hrPermissions.policyActions),
  ...Object.values(hrLeavePolicyPermissions),
  'HR.PayrollManagement.Settings.PfRule.View',
  'HR.PayrollManagement.Settings.PfRule.Add',
  ...Object.values(hrPermissions.payroll.settings).filter(
    (value): value is string => typeof value === 'string'
  ),
  ...Object.values(hrPermissions.payroll.settings.salaryTemplateActions),
  ...Object.values(hrPermissions.payroll.settings.statutorySchemeActions),
  `${hrPermissions.payroll.generateSalarySlip}.Add`,
].map((name) => ({ name, isGranted: true }));
const settingsScreens: Record<string, React.ComponentType> = {
  earnings: EarningComponent,
  deductions: DeductionComponent,
  'professional-tax': ProfessionalTax,
  'salary-templates': SalaryTemplateSettings,
  'salary-template-editor': () => <SalaryTemplateEditor mode="create" />,
  'payslip-settings': PayslipStatementSettings,
  'statutory-schemes': StatutorySchemesPage,
};
const SettingsScreen = settingsScreens[query.get('surface') || ''];
const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    confirmPopup,
    globalState: () => ({ currentYear: year }),
  },
  preloadedState: {
    auth: {
      ...authReducer(undefined, { type: 'init' }),
      permissions,
      user: { sub: 'synthetic-user' },
      isAuthenticated: true,
      permissionsInitialized: true,
    },
  },
  middleware: (defaults) => defaults({ serializableCheck: false }).concat(api.middleware),
});
createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider
      theme={createTheme(defaultSettings)}
      defaultMode={query.get('theme') === 'dark' ? 'dark' : 'light'}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <CssBaseline />
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: 1 }}>
          <Alert severity="info">
            Synthetic policy fixture — all policy writes are refused; no school data is connected.
          </Alert>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            {SettingsScreen ? (
              <SettingsScreen />
            ) : query.get('surface') === 'pf' ? (
              <PF />
            ) : query.get('surface') === 'manual-attendance' ? (
              <ManualAttendanceScreen />
            ) : (
              <HRPolicyWorkspace focus={focus} />
            )}
          </Box>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  </Provider>
);
