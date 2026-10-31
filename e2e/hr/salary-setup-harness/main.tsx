import React from 'react';
import { Toaster } from 'sonner';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { hrPermissions } from 'src/constants/hr-menus';
import { Box, Alert, CssBaseline } from '@mui/material';
import { defaultSettings } from 'src/components/settings/config-settings';
import PayrollSettings from 'src/screens/hr/payroll/setting/payroll-settings';
import SalaryEditorScreen from 'src/screens/hr/payroll/structure/salary-editor-screen';
import SalaryTemplateEditor from 'src/screens/hr/payroll/setting/salary-template-editor';

const view = new URLSearchParams(window.location.search).get('view');

const store = configureStore({
  reducer: {
    auth: () => ({
      loading: false,
      permissionsInitialized: true,
      permissions: [
        { name: hrPermissions.payroll.compensationRevisionActions.manage, isGranted: true },
        ...Object.values(hrPermissions.payroll.settings.salaryTemplateActions).map((name) => ({
          name,
          isGranted: true,
        })),
        ...(view === 'settings'
          ? [
              hrPermissions.payroll.settings.pfRule,
              hrPermissions.payroll.settings.statutorySchemes,
              hrPermissions.payroll.settings.professionalTax,
              hrPermissions.payroll.settings.earningComponents,
              hrPermissions.payroll.settings.deductionComponents,
              hrPermissions.payroll.settings.payrollDocuments,
            ].map((name) => ({ name, isGranted: true }))
          : []),
      ],
    }),
    globalState: () => ({}),
    confirmPopup: () => ({ isChanges: false }),
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={createTheme(defaultSettings)}>
    <CssBaseline />
    <Provider store={store}>
      <Box
        sx={{
          height: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          p: { xs: 1, md: 2 },
          gap: 1,
          bgcolor: 'background.neutral',
        }}
      >
        <Alert severity="info">
          Synthetic browser test. No staff or tenant records are changed.
        </Alert>
        <Box sx={{ minHeight: 0, flex: 1 }}>
          {view === 'settings' ? (
            <PayrollSettings />
          ) : view === 'template' ? (
            <SalaryTemplateEditor templateId="synthetic-template" />
          ) : (
            <SalaryEditorScreen employeeId="synthetic-staff" />
          )}
        </Box>
      </Box>
      <Toaster />
    </Provider>
  </ThemeProvider>
);
