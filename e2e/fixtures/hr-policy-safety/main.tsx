import 'simplebar-react/dist/simplebar.min.css';

import React from 'react';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from 'src/redux/auth/authSlice';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { hrPermissions } from 'src/constants/hr-menus';
import { Box, Alert, CssBaseline } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import HRPolicyWorkspace from 'src/screens/hr/policies/HRPolicyWorkspace';
import { hrLeavePolicyPermissions } from 'src/constants/hr-policy-permissions';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { year } from './data';

const query = new URLSearchParams(window.location.search);
const permissions = [
  ...Object.values(hrPermissions.policies),
  ...Object.values(hrPermissions.policyActions),
  ...Object.values(hrLeavePolicyPermissions),
].map((name) => ({ name, isGranted: true }));
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
            <HRPolicyWorkspace focus={query.get('surface') === 'leave' ? 'leave' : 'attendance'} />
          </Box>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  </Provider>
);
