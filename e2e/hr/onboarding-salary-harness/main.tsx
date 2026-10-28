import { Toaster } from 'sonner';
import { Provider } from 'react-redux';
import React, { useState } from 'react';
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
import { FinalizeWorkflow } from 'src/screens/hr/employee-onboarding/finalize-workflow';

const state = {
  auth: {
    permissions: [
      hrPermissions.payroll.compensationRevisionActions.manage,
      hrPermissions.payroll.settings.statutorySchemeActions.manageEnrollment,
    ].map((name) => ({ name, isGranted: true })),
  },
  globalState: {},
  confirmPopup: { isChanges: false },
};
const store = configureStore({
  reducer: {
    auth: (current = state.auth) => current,
    globalState: (current = state.globalState) => current,
    confirmPopup: (current = state.confirmPopup) => current,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});
const application: any = {
  id: 'synthetic-onboarding',
  applicationNumber: 'QA-ONLY',
  firstName: 'Synthetic',
  lastName: 'Staff',
  fullName: 'Synthetic Staff',
  email: 'synthetic@example.test',
  mobileNo: '9876543210',
  hasPhoto: true,
  hasResume: false,
  status: 'Applied',
  workAssignment: { mode: 'decideLater', academicYearId: null, organizationIds: [] },
  personalInfo: {
    firstName: 'Synthetic',
    lastName: 'Staff',
    email: 'synthetic@example.test',
    mobileNo: '9876543210',
    religion: 'Hindu',
    casteType: 0,
    familyCaste: 'General',
    isTeaching: false,
    address1: '1 Test Road',
    address2: 'Test Area',
    country: { name: 'India', isoCode: 'IN' },
    state: { name: 'Gujarat', isoCode: 'GJ' },
    city: 'Ahmedabad',
    pincode: '380001',
  },
};
function Harness() {
  const [open, setOpen] = useState(true);
  const [done, setDone] = useState(false);
  return (
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Provider store={store}>
          <Box sx={{ height: '100dvh', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <Alert severity="info">
              Synthetic local test only. No staff or tenant records are changed.
            </Alert>
            {done && (
              <Alert severity="success">Staff and salary saved. Staff remains inactive.</Alert>
            )}
            {open && (
              <FinalizeWorkflow
                application={application}
                returnHref="/"
                readReady
                readError={false}
                onRetry={() => {}}
                onFinalized={() => {
                  setOpen(false);
                  setDone(true);
                }}
              />
            )}
            <Toaster />
          </Box>
        </Provider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
createRoot(document.getElementById('root')!).render(<Harness />);
