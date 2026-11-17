import 'src/global.css';

import { Toaster } from 'sonner';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import SubLayout from 'src/components/sub-layout';
import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { Box, Button, Typography, CssBaseline } from '@mui/material';
import { defaultSettings } from 'src/components/settings/config-settings';
import { StudentFeedbackScope } from 'src/screens/student/student-feedback-scope';
import StudentRecordDocuments from 'src/screens/student/records/student-record-documents';
import { LocalizationProvider } from 'src/components/Localization-provider/localization-provider';

import { api, calls } from './service';

const query = new URLSearchParams(window.location.search);
const permissions = ['View', ...(!query.has('readonly') ? ['Add'] : [])].map((action) => ({
  name: `Students.Records.StudentICard.${action}`,
  isGranted: true,
}));
const store = configureStore({
  reducer: {
    confirmPopup,
    [api.reducerPath]: api.reducer,
    globalState: (state = { currentYear: { id: 'test-year' } }) => state,
    auth: (
      state = {
        loading: false,
        permissionsInitialized: true,
        permissions,
        user: { sub: 'synthetic-user' },
        sessionContext: { tenantId: 'synthetic-tenant' },
      }
    ) => state,
  },
  middleware: (getDefault) => getDefault({ serializableCheck: false }).concat(api.middleware),
});

function Fixture() {
  const [showCalls, setShowCalls] = useState(false);
  const [, setRevision] = useState(0);
  useEffect(() => {
    const listener = () => setRevision((value) => value + 1);
    window.addEventListener('fixture-request', listener);
    return () => window.removeEventListener('fixture-request', listener);
  }, []);
  return (
    <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box
        sx={{
          p: 1,
          flexShrink: 0,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2">Synthetic Issued Cards · 27 Test Records</Typography>
        <Typography variant="caption">Isolated data · No school API access</Typography>
        <Button size="small" onClick={() => setShowCalls((value) => !value)}>
          Fixture requests
        </Button>
        {showCalls && (
          <Box
            component="pre"
            sx={{ maxHeight: 180, overflow: 'auto', fontSize: 10 }}
            data-testid="fixture-requests"
          >
            {JSON.stringify(calls, null, 2)}
          </Box>
        )}
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, minWidth: 0 }}>
        <SubLayout>
          <StudentFeedbackScope>
            <StudentRecordDocuments fixedKind="ids" />
          </StudentFeedbackScope>
        </SubLayout>
      </Box>
      <Toaster />
    </Box>
  );
}

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider
      defaultMode={query.has('light') ? 'light' : 'dark'}
      modeStorageKey="issued-cards-fixture-theme"
      theme={createTheme({
        ...defaultSettings,
        colorScheme: query.has('light') ? 'light' : 'dark',
      })}
    >
      <LocalizationProvider>
        <CssBaseline />
        <Fixture />
      </LocalizationProvider>
    </ThemeProvider>
  </Provider>
);
