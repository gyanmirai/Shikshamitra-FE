import type { StudentOnboardingItem } from 'src/screens/student/onboarding/student-setup/student-onboarding-model';

import { useState } from 'react';
import { Toaster } from 'sonner';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { createTheme } from 'src/theme/create-theme';
import { FormSectionCard } from 'src/components/form-section-card';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { defaultSettings } from 'src/components/settings/config-settings';
import { Box, Stack, Button, TextField, Typography, CssBaseline } from '@mui/material';
import StudentOnboardingPortalAccounts from 'src/screens/student/onboarding/student-setup/student-onboarding-portal-accounts';

import { useFixtureRequests } from './mock-api';

const scenario = new URLSearchParams(window.location.search).get('scenario');
const state = {
  auth: {
    permissions: [
      'Students.Onboarding.View',
      'Students.Onboarding.Add',
      'AbpIdentity.Users.Create',
      'AbpIdentity.Users.Update',
    ].map((name) => ({ name, isGranted: true })),
  },
  globalState: {},
  confirmPopup: { isChanges: false },
};
const store = configureStore({ reducer: (current = state) => current });
const student = {
  id: 'case-preview',
  studentId: 'student-preview',
  studentName: 'Vinay Sinh',
  applicationNumber: 'SYNTHETIC-ONLY',
  studentEnrollmentId: 'enrollment-preview',
  backendStatus: 3,
} as StudentOnboardingItem;

function Preview() {
  const { mode, setMode } = useColorScheme();
  const [busy, setBusy] = useState(false);
  const requests = useFixtureRequests();
  return (
    <Box sx={{ p: 2, minHeight: '100dvh', bgcolor: 'background.default' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
        <Typography variant="h5">Student Setup · App Login</Typography>
        <Button size="small" onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>
          {mode === 'dark' ? 'Light theme' : 'Dark theme'}
        </Button>
      </Stack>
      <Typography variant="caption" color="text.secondary">
        Synthetic component QA only. No real student accounts or emails are changed.
      </Typography>
      <Box
        sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5, mt: 2 }}
      >
        <FormSectionCard title="Class & Numbers" icon="mdi:school-outline">
          <Stack spacing={1}>
            <Typography variant="subtitle2">Vinay Sinh · Class 2-A</Typography>
            <TextField
              size="small"
              label="GR number"
              value="GR-000012"
              slotProps={{ input: { readOnly: true } }}
            />
            <TextField
              size="small"
              label="Roll number"
              value="44"
              slotProps={{ input: { readOnly: true } }}
            />
          </Stack>
        </FormSectionCard>
        <FormSectionCard title="App Login" icon="mdi:account-key-outline">
          <StudentOnboardingPortalAccounts
            student={student}
            canManage={scenario !== 'permission'}
            onBusyChange={setBusy}
          />
        </FormSectionCard>
      </Box>
      <Typography
        variant="caption"
        component="p"
        data-testid="fixture-requests"
        sx={{ overflowWrap: 'anywhere', mt: 2 }}
      >
        {requests || 'No requests'}
      </Typography>
      <Typography variant="caption">{busy ? 'Request in progress' : 'Idle'}</Typography>
      <Toaster />
    </Box>
  );
}

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider
      theme={createTheme(defaultSettings)}
      defaultMode={
        new URLSearchParams(window.location.search).get('theme') === 'dark' ? 'dark' : 'light'
      }
    >
      <CssBaseline />
      <Preview />
    </ThemeProvider>
  </Provider>
);
