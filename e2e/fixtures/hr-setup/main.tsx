import 'simplebar-react/dist/simplebar.min.css';

import dayjs from 'dayjs';
import { Toaster } from 'sonner';
import { Provider } from 'react-redux';
import React, { useState } from 'react';
import { api } from 'src/redux/service';
import { createRoot } from 'react-dom/client';
import { hrPaths } from 'src/constants/hr-menus';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from 'src/redux/auth/authSlice';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { setupListeners } from '@reduxjs/toolkit/query';
import globalReducer from 'src/redux/globalState/globalSlice';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { hrSetupOperatorPermissions } from 'src/constants/hr-setup';
import { Stack, Button, Typography, CssBaseline } from '@mui/material';
import { defaultSettings } from 'src/components/settings/config-settings';
import confirmPopupReducer from 'src/redux/confirmPopup/confirmPopupSlice';
import { HrSetupSessionProvider } from 'src/screens/hr/setup/hr-setup-session';
import { HrSetupCoordinator } from 'src/screens/hr/setup/hr-setup-coordinator';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import EarningComponent from 'src/screens/hr/payroll/setting/earning-component';
import DeductionComponent from 'src/screens/hr/payroll/setting/deduction-component';
import SalaryTemplateEditor from 'src/screens/hr/payroll/setting/salary-template-editor';

dayjs.extend(customParseFormat);
const context = await (await fetch('/fixture/context')).json();
const scenario =
  new URLSearchParams(window.location.search).get('scenario') ??
  (window.location.pathname === hrPaths.payroll.settings.deductionComponents
    ? 'deduction-components'
    : null);
const fixtureMode =
  new URLSearchParams(window.location.search).get('theme') === 'dark' ? 'dark' : 'light';
const baseGrants =
  scenario === 'self-service'
    ? ['HR.LeaveManagement.LeaveCenter.Add']
    : [
        ...hrSetupOperatorPermissions,
        'HR.Policies.View',
        'HR.Policies.PreviewImpact',
        'HR.LeaveManagement.Setting.LeavePolicy.View',
        'HR.LeaveManagement.Setting.LeavePolicy.SetDefault',
        'HR.PayrollManagement.Settings.EarningComponents.View',
        'HR.PayrollManagement.Settings.DeductionComponents.View',
        'HR.PayrollManagement.Settings.PfRule.View',
        'HR.PayrollManagement.Settings.SalaryTemplates.View',
        'HR.PayrollManagement.Settings.StatutorySchemes.View',
        'HR.PayrollManagement.Settings.StatutorySchemes.Activate',
        'HR.PayrollManagement.Settings.StatutorySchemes.ConfigureCalculation',
        'AbpIdentity.Roles.Update',
      ];
const grants = baseGrants.filter(
  (name) =>
    scenario !== 'no-deduction-create' ||
    name !== 'HR.PayrollManagement.Settings.DeductionComponents.Add'
);
const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    globalState: globalReducer,
    confirmPopup: confirmPopupReducer,
  },
  preloadedState: {
    auth: {
      ...authReducer(undefined, { type: 'fixture/init' }),
      user: { sub: context.actorId, tenantid: context.tenantId },
      permissions: grants.map((name) => ({ name, isGranted: true })),
      permissionsInitialized: true,
      loading: false,
      isAuthenticated: true,
    },
    globalState: { currentYear: context.year, currentBoard: {}, currentMedium: {} },
  },
  middleware: (defaults) => defaults({ serializableCheck: false }).concat(api.middleware),
});
setupListeners(store.dispatch);

function Fixture() {
  const [hr, setHr] = useState(true);
  return (
    <HrSetupSessionProvider>
      <Stack spacing={2} sx={{ p: 2 }}>
        <Typography variant="h5">HR Workspace</Typography>
        <Typography variant="body2">
          {context.synthetic
            ? 'Synthetic salary component fixture. Real setup editors with in-memory API responses.'
            : 'Disposable school fixture. Real setup editors and backend APIs. Synthetic authentication.'}
        </Typography>
        <Button onClick={() => setHr((value) => !value)}>{hr ? 'Leave HR' : 'Return to HR'}</Button>
        <Typography>Normal HR operations remain available after closing setup.</Typography>
        {scenario === 'salary-template' ? (
          <SalaryTemplateEditor mode="create" />
        ) : scenario === 'earning-components' ? (
          <EarningComponent />
        ) : scenario === 'deduction-components' ? (
          <DeductionComponent />
        ) : hr ? (
          <HrSetupCoordinator />
        ) : null}
      </Stack>
    </HrSetupSessionProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider
      theme={createTheme({ ...defaultSettings, colorScheme: fixtureMode })}
      defaultMode={fixtureMode}
      storageManager={null}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <CssBaseline />
        <Fixture />
        <Toaster />
      </LocalizationProvider>
    </ThemeProvider>
  </Provider>
);
