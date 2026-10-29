import 'simplebar-react/dist/simplebar.min.css';

import React from 'react';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { tagTypes } from 'src/redux/tagTypes';
import { configureStore } from '@reduxjs/toolkit';
import { createTheme } from 'src/theme/create-theme';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { Box, Stack, Alert, Button, CssBaseline } from '@mui/material';
import { defaultSettings } from 'src/components/settings/config-settings';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ManualEntryForm from 'src/screens/finance/accounts/Registers/ManualEntryForm';
import RefundPolicyDrawer from 'src/screens/finance/policies/components/RefundPolicyDrawer';
import ProrationPolicyDrawer from 'src/screens/finance/policies/components/ProrationPolicyDrawer';
import CashBulkDepositDialog from 'src/screens/finance/accounts/CashManagement/CashBulkDepositDialog';

import { api, completeSetup } from './mock-service';

const params = new URLSearchParams(window.location.search);
const period = { id: 'year', name: '2026-2027', startDate: '2026-06-01', endDate: '2027-05-31' };
const allowed = [
  'Finance.Policies.ProrationPolicy',
  'Finance.Policies.RefundPolicy',
  'Finance.Settings.FeeCategory',
  'Finance.Accounts.Settings.IncomeCategory',
  'Finance.Accounts.Settings.ExpenseCategory',
  'Finance.Accounts.Settings.BankAccount',
  'Finance.Accounts.IncomeTracking',
  'Finance.Accounts.ExpenseTracking',
]
  .flatMap((base) => [`${base}.View`, `${base}.Add`])
  .concat('Finance.Accounts.CashManagement.Deposit');
const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    confirmPopup,
    globalState: () => ({ currentYear: period, academicYears: [period] }),
    auth: () => ({
      loading: false,
      permissionsInitialized: true,
      permissions: allowed
        .filter((name) => !params.has('readonly') || !name.includes('.Settings.'))
        .map((name) => ({ name, isGranted: true })),
    }),
  },
  middleware: (getDefault) => getDefault({ serializableCheck: false }).concat(api.middleware),
});

function Fixture() {
  const [open, setOpen] = React.useState(true);
  const { setMode } = useColorScheme();
  const view = params.get('view') || 'proration';
  return (
    <Stack sx={{ height: '100vh', p: 2, bgcolor: 'background.neutral' }} spacing={1}>
      <Alert severity="info">
        Synthetic prerequisite verification. Production components; no backend writes.
      </Alert>
      <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1}>
        <Button onClick={() => setMode('light')}>Light</Button>
        <Button onClick={() => setMode('dark')}>Dark</Button>
        <Button onClick={() => setOpen(true)}>Open form</Button>
        <Button
          onClick={() => {
            completeSetup();
            store.dispatch(api.util.invalidateTags(tagTypes));
            window.dispatchEvent(new Event('focus'));
          }}
        >
          Complete synthetic setup
        </Button>
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {open && (view === 'income' || view === 'expense') && (
          <ManualEntryForm
            direction={view}
            period={period}
            month="2026-10"
            initialBankAccountId={params.get('missing') === 'bank' ? 'bank' : undefined}
            onClose={() => setOpen(false)}
          />
        )}
        {view === 'proration' && (
          <ProrationPolicyDrawer open={open} academicYearId="year" onClose={() => setOpen(false)} />
        )}
        {view === 'refund' && (
          <RefundPolicyDrawer open={open} academicYearId="year" onClose={() => setOpen(false)} />
        )}
        {open && view === 'deposit' && (
          <CashBulkDepositDialog
            academicYearId="year"
            amount={100}
            onClose={() => setOpen(false)}
            onRefresh={async () => 100}
          />
        )}
      </Box>
    </Stack>
  );
}
const dark = params.has('dark');
createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider
      theme={createTheme({ ...defaultSettings, colorScheme: dark ? 'dark' : 'light' })}
      defaultMode={dark ? 'dark' : 'light'}
      modeStorageKey={`prerequisite-fixture-${dark}`}
    >
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Fixture />
      </LocalizationProvider>
    </ThemeProvider>
  </Provider>
);
