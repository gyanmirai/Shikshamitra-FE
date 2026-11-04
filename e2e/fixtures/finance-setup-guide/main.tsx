import type { UnknownAction } from '@reduxjs/toolkit';

import React from 'react';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import FinanceSetupScreen from 'src/screens/finance/setup';
import { defaultSettings } from 'src/components/settings/config-settings';
import { financePermissions, financeSetupViewPermissions } from 'src/constants/finance-menu';

import { api } from './mock-service';

const query = new URLSearchParams(window.location.search);
const permissions = [
  financePermissions.root,
  financePermissions.dashboard,
  financePermissions.reports,
  ...financeSetupViewPermissions,
]
  .filter(
    (name) =>
      !query.has('limited') ||
      name.includes('Accounts.Settings.') ||
      name === financePermissions.root ||
      name === financePermissions.dashboard
  )
  .filter((name) => !query.has('denied') || name === financePermissions.root)
  .map((name) => ({ name, isGranted: true }));
const store = configureStore({
  reducer: {
    confirmPopup,
    [api.reducerPath]: api.reducer,
    globalState: (state = { currentYear: { id: 'year-a' } }, action: UnknownAction) =>
      action.type === 'fixture/year' ? { currentYear: { id: String(action.payload) } } : state,
    auth: (
      state = {
        sessionContext: { accountMode: 'tenant', tenantId: 'synthetic-tenant' },
        user: { sub: 'synthetic-user' },
        loading: false,
        permissionsInitialized: true,
        permissions,
      }
    ) => state,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider
      theme={createTheme({ ...defaultSettings, colorScheme: query.has('dark') ? 'dark' : 'light' })}
    >
      <CssBaseline />
      <FinanceSetupScreen />
    </ThemeProvider>
  </Provider>
);
