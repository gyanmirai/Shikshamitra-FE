import 'simplebar-react/dist/simplebar.min.css';

import dayjs from 'dayjs';
import React from 'react';
import { Toaster } from 'sonner';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from 'src/redux/auth/authSlice';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { hrPermissions } from 'src/constants/hr-menus';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import EmployeeFrom from 'src/screens/hr/employee/employee-form';
import { defaultSettings } from 'src/components/settings/config-settings';
import confirmPopupReducer from 'src/redux/confirmPopup/confirmPopupSlice';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Box, Alert, Stack, Button, Typography, CssBaseline } from '@mui/material';

dayjs.extend(customParseFormat);
const scenario = new URLSearchParams(window.location.search).get('scenario') || 'ready';
const staffPermissions = [
  `${hrPermissions.employee.list}.View`,
  `${hrPermissions.employee.list}.${scenario === 'edit' ? 'Edit' : 'Add'}`,
];
// Keep synthetic server grants independent of the production permission constants.
const policyPermissions = [
  'HR.Policies.View',
  'HR.LeaveManagement.Setting.LeavePolicy.View',
  'HR.Policies.Assign',
  'HR.Policies.PreviewImpact',
];
const permissions = (
  scenario === 'missing-permission' || scenario === 'edit'
    ? staffPermissions
    : [...staffPermissions, ...policyPermissions]
).map((name) => ({ name, isGranted: true }));
const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    globalState: () => ({ currentYear: { id: 'synthetic-year', name: '2026-2027' } }),
    confirmPopup: confirmPopupReducer,
  },
  preloadedState: {
    auth: {
      ...authReducer(undefined, { type: 'fixture/init' }),
      permissions,
      user: { sub: 'synthetic-user' },
      isAuthenticated: true,
      permissionsInitialized: true,
    },
  },
  middleware: (defaults) => defaults({ serializableCheck: false }).concat(api.middleware),
});

function Fixture() {
  const [open, setOpen] = React.useState(true);
  return (
    <Stack spacing={1} sx={{ p: { xs: 1, md: 2 }, height: '100vh', bgcolor: 'background.neutral' }}>
      <Alert severity="info">
        Synthetic browser regression: production personal-information form and RTK clients;
        unvisited later steps are stubbed. No school data or backend writes.
      </Alert>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <Typography variant="h6">{scenario === 'edit' ? 'Edit Staff' : 'Add Staff'}</Typography>
        <Typography variant="body2">Scenario: {scenario}</Typography>
        {!open && <Button onClick={() => setOpen(true)}>Reopen staff form</Button>}
      </Stack>
      <Box
        data-testid="hr-employee-form"
        sx={{ flex: 1, minHeight: 0, bgcolor: 'background.paper', borderRadius: 2 }}
      >
        {open ? (
          <EmployeeFrom
            editData={
              scenario === 'edit'
                ? { id: 'synthetic-employee', firstName: 'Existing', lastName: 'Staff' }
                : null
            }
            handleClose={() => setOpen(false)}
          />
        ) : (
          <Typography sx={{ p: 2 }}>Staff form closed</Typography>
        )}
      </Box>
    </Stack>
  );
}

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider theme={createTheme(defaultSettings)} defaultMode="system">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <CssBaseline />
        <Fixture />
        <Toaster />
      </LocalizationProvider>
    </ThemeProvider>
  </Provider>
);
