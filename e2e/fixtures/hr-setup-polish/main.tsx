import '@fontsource/public-sans/400.css';
import '@fontsource/public-sans/600.css';
import '@fontsource/public-sans/700.css';
import 'simplebar-react/dist/simplebar.min.css';

import type { HrSetupReadiness } from 'src/redux/hr/hr-setup-readiness-api';

import { Provider } from 'react-redux';
import React, { useState } from 'react';
import { api } from 'src/redux/service';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from 'src/redux/auth/authSlice';
import { Button, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import globalReducer from 'src/redux/globalState/globalSlice';
import HrSetupWizard from 'src/screens/hr/setup/hr-setup-wizard';
import { defaultSettings } from 'src/components/settings/config-settings';
import confirmPopupReducer from 'src/redux/confirmPopup/confirmPopupSlice';

const params = new URLSearchParams(window.location.search);
const mode = params.get('theme') === 'dark' ? 'dark' : 'light';
const scenario = params.get('scenario');
const readonly = scenario === 'read-only';
const readiness: HrSetupReadiness = {
  academicYearId: scenario === 'no-year' ? null : 'synthetic-year',
  availableYears: [],
  isReady: scenario === 'complete',
  checks: [
    {
      code: 'academic-year',
      step: 'staff',
      state: 'ready',
      reason: 'Academic year 2026–2027 is selected.',
      canConfigure: false,
    },
    {
      code: 'shift',
      step: 'staff',
      state: 'ready',
      reason: 'An active staff shift is available.',
      canConfigure: true,
    },
    {
      code: 'teaching-role',
      step: 'staff',
      state: 'ready',
      reason: 'A teaching staff role is available for onboarding.',
      canConfigure: false,
    },
    {
      code: 'non-teaching-role',
      step: 'staff',
      state: 'ready',
      reason: 'A non teaching staff role is available for onboarding.',
      canConfigure: false,
    },
    {
      code: 'calendar',
      step: 'policies',
      state: 'ready',
      reason: 'An active work calendar is available.',
      canConfigure: true,
    },
    {
      code: 'attendance-policy',
      step: 'policies',
      state: 'ready',
      reason: 'A default attendance policy is configured.',
      canConfigure: true,
    },
    {
      code: 'leave-policy',
      step: 'policies',
      state: 'ready',
      reason: 'A default leave policy is configured.',
      canConfigure: true,
    },
    {
      code: 'payroll-policy',
      step: 'policies',
      state: 'ready',
      reason: 'A default payroll policy is configured.',
      canConfigure: true,
    },
    {
      code: 'earnings',
      step: 'earnings',
      state: 'ready',
      reason: 'Active earning components are available for salary templates.',
      canConfigure: true,
    },
    {
      code: 'pf-coverage',
      step: 'salary',
      state: scenario === 'complete' ? 'ready' : 'missing',
      reason:
        'Record whether the school is covered under PF, with an effective month and evidence reference.',
      canConfigure: !readonly,
    },
    {
      code: 'salary-template',
      step: 'salary',
      state: 'ready',
      reason: 'An active salary template and its required dependencies are usable.',
      canConfigure: !readonly,
    },
  ],
};
if (scenario === 'states') {
  readiness.checks
    .filter((check) => check.step === 'policies')
    .forEach((check, index) => {
      check.state = (['inactive', 'invalid', 'conflicting', 'unknown'] as const)[index];
    });
}
if (scenario === 'no-year') readiness.checks[0].state = 'unknown';
const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    globalState: globalReducer,
    confirmPopup: confirmPopupReducer,
  },
  preloadedState: {
    auth: {
      ...authReducer(undefined, { type: 'init' }),
      permissions: readonly
        ? []
        : [
            'HR.PayrollManagement.Settings.PfRule.View',
            'HR.PayrollManagement.Settings.PfRule.Add',
            'HR.PayrollManagement.Settings.DeductionComponents.View',
            'HR.PayrollManagement.Settings.DeductionComponents.Add',
          ].map((name) => ({ name, isGranted: true })),
    },
  },
  middleware: (defaults) => defaults({ serializableCheck: false }).concat(api.middleware),
});
function Fixture() {
  const [open, setOpen] = useState(true);
  return open ? (
    <HrSetupWizard
      readiness={scenario === 'error' ? undefined : readiness}
      error={scenario === 'error'}
      refreshing={false}
      refresh={async () => {
        if (scenario === 'error') throw new Error('Synthetic readiness failure');
        return readiness;
      }}
      onClose={() => setOpen(false)}
    />
  ) : (
    <Button onClick={() => setOpen(true)}>Resume HR setup</Button>
  );
}
createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider
      theme={createTheme({ ...defaultSettings, colorScheme: mode })}
      defaultMode={mode}
      modeStorageKey={`hr-polish-${mode}`}
    >
      <CssBaseline />
      <Fixture />
    </ThemeProvider>
  </Provider>
);
