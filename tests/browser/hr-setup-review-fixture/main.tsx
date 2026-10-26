import { useState } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { createRoot } from 'react-dom/client';
import { createTheme } from 'src/theme/create-theme';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { Box, Button, CssBaseline, Stack } from '@mui/material';
import { defaultSettings } from 'src/components/settings/config-settings';
import { HRSetupReviewChecklist } from 'src/screens/hr/policies/components/HRSetupReviewChecklist';
import { FixtureContext } from './api';

const permissions = [
  'HR.Policies.View',
  'HR.Policies.Edit',
  'HR.Policies.PreviewImpact',
  'HR.Policies.Calendars',
  'HR.Policies.Attendance',
  'HR.Policies.Payroll',
  'HR.Policies.PolicyAssignment',
  'HR.LeaveManagement.Setting.LeavePolicy.View',
];
const store = configureStore({
  reducer: {
    auth: () => ({ permissions: permissions.map((name) => ({ name, isGranted: true })) }),
  },
});
function ThemeSwitch() {
  const { mode, setMode } = useColorScheme();
  return <Button onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>Toggle theme</Button>;
}
function Fixture() {
  const [mode, setMode] = useState('valid');
  const [reviewed, setReviewed] = useState<string[]>([]);
  return (
    <ThemeProvider theme={createTheme(defaultSettings)} defaultMode="light">
      <CssBaseline />
      <Box component="main" sx={{ p: 2, minHeight: '100dvh', bgcolor: 'background.default' }}>
        <h1>Synthetic HR setup review</h1>
        <p>Local synthetic fixture. No backend, credentials, school data or live writes.</p>
        <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1}>
          {['valid', 'stale', 'missing', 'no staff', 'loading', 'error', 'conflict', 'saving'].map(
            (value) => (
              <Button
                key={value}
                onClick={() => {
                  setMode(value);
                  setReviewed([]);
                }}
              >
                {value}
              </Button>
            )
          )}
          <ThemeSwitch />
        </Stack>
        <Provider store={store}>
          <FixtureContext.Provider value={{ mode, setMode, reviewed, setReviewed }}>
            <HRSetupReviewChecklist academicYearId="synthetic-year" />
          </FixtureContext.Provider>
        </Provider>
      </Box>
    </ThemeProvider>
  );
}
createRoot(document.getElementById('root')!).render(<Fixture />);
