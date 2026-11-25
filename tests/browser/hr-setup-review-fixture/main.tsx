import { Provider } from 'react-redux';
import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { createTheme } from 'src/theme/create-theme';
import { Box, Stack, Button, CssBaseline } from '@mui/material';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import HRPolicyOverview from 'src/screens/hr/policies/HRPolicyOverview';
import { defaultSettings } from 'src/components/settings/config-settings';

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
    globalState: () => ({ currentYear: { id: 'synthetic-year' } }),
  },
});
function ThemeSwitch() {
  const { mode, setMode } = useColorScheme();
  return <Button onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>Toggle theme</Button>;
}
function Fixture() {
  const [mode, setMode] = useState('valid');
  const [reviewed, setReviewed] = useState<string[]>([]);
  const evidence = useMemo(() => ({ mode, setMode, reviewed, setReviewed }), [mode, reviewed]);
  return (
    <ThemeProvider theme={createTheme(defaultSettings)} defaultMode="light">
      <CssBaseline />
      <Box component="main" sx={{ p: 2, minHeight: '100dvh', bgcolor: 'background.default' }}>
        <h1>Synthetic HR policy workflow</h1>
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
          <FixtureContext.Provider value={evidence}>
            <HRPolicyOverview />
          </FixtureContext.Provider>
        </Provider>
      </Box>
    </ThemeProvider>
  );
}
createRoot(document.getElementById('root')!).render(<Fixture />);
