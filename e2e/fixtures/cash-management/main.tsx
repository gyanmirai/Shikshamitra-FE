import 'simplebar-react/dist/simplebar.min.css';

import React from 'react';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { createTheme } from 'src/theme/create-theme';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { Box, Alert, Stack, Button, CssBaseline } from '@mui/material';
import CashManagement from 'src/screens/finance/accounts/CashManagement';
import { defaultSettings } from 'src/components/settings/config-settings';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ManualEntryForm from 'src/screens/finance/accounts/Registers/ManualEntryForm';

import { api } from './mock-service';

const period = {
  id: 'year',
  name: '2026–27',
  startDate: '2026-04-01',
  endDate: '2027-03-31',
  boards: [{ id: 'board', name: 'CBSE', educationMediums: [{ id: 'medium', name: 'English' }] }],
};
const permissions = ['View', 'Approve', 'Deposit', 'Reconcile']
  .map((action) => `Finance.Accounts.CashManagement.${action}`)
  .concat(['Finance.Accounts.ExpenseTracking.Add', 'Finance.Accounts.IncomeTracking.Add'])
  .filter(
    (name) => !new URLSearchParams(window.location.search).has('readonly') || name.endsWith('.View')
  )
  .map((name) => ({ name, isGranted: true }));
const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    confirmPopup,
    globalState: () => ({ currentYear: period }),
    auth: () => ({
      user: {
        sub: new URLSearchParams(window.location.search).has('collector')
          ? 'other-user'
          : 'reviewer',
      },
      permissions,
      permissionsInitialized: true,
      loading: false,
    }),
  },
  middleware: (getDefault) => getDefault({ serializableCheck: false }).concat(api.middleware),
});
function Fixture() {
  const { setMode } = useColorScheme();
  const [entry, setEntry] = React.useState<'income' | 'expense' | null>(null);
  return (
    <Stack sx={{ height: '100vh', p: { xs: 1, md: 2 }, bgcolor: 'background.neutral' }} spacing={1}>
      <Alert severity="info">
        Synthetic Cash Management verification · no backend writes · 2026–27
      </Alert>
      <Stack direction="row" spacing={1}>
        <Button onClick={() => setMode('light')}>Light</Button>
        <Button onClick={() => setMode('dark')}>Dark</Button>
        <Button onClick={() => setEntry('expense')}>Add Expense</Button>
        <Button onClick={() => setEntry('income')}>Add Income</Button>
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {entry ? (
          <ManualEntryForm
            direction={entry}
            period={period}
            month="2026-10"
            onClose={() => setEntry(null)}
          />
        ) : (
          <CashManagement />
        )}
      </Box>
    </Stack>
  );
}
createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Fixture />
      </LocalizationProvider>
    </ThemeProvider>
  </Provider>
);
